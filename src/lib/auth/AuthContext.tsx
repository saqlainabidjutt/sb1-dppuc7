import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Settings } from '../db/types';
import { DEFAULT_SETTINGS, getSettings } from '../db/settings';
import { saveSession, getStoredSession } from './sessionStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'admin' | 'driver' | null;
  userId?: number;
  userName: string;
  companyId?: number;
  settings: Settings;
  login: (role: 'admin' | 'driver', id: number, name: string, company: number, adminId?: number) => void;
  logout: () => void;
  updateSettings: (newSettings: Settings) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'driver' | null>(null);
  const [userId, setUserId] = useState<number | undefined>();
  const [userName, setUserName] = useState('');
  const [companyId, setCompanyId] = useState<number | undefined>();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        handleSessionExpired();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        saveSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load settings whenever companyId changes
  useEffect(() => {
    if (companyId && isAuthenticated) {
      loadSettings();
    }
  }, [companyId, isAuthenticated]);

  const loadSettings = async () => {
    if (!companyId) return;
    
    try {
      const companySettings = await getSettings(companyId);
      setSettings(companySettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Fallback to default settings
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const initializeAuth = async () => {
    // Check for stored session
    const storedSession = getStoredSession();
    if (storedSession) {
      const { data: { session } } = await supabase.auth.setSession(storedSession);
      if (session) {
        // Fetch user data and restore session
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();

          if (userData) {
            login(
              userData.role,
              userData.id,
              userData.name,
              userData.company_id,
              userData.admin_id
            );
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          handleSessionExpired();
        }
      }
    }
  };

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      handleSessionExpired();
    }
  };

  const handleSessionExpired = () => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserId(undefined);
      setUserName('');
      setCompanyId(undefined);
      setSettings(DEFAULT_SETTINGS);
      saveSession(null);
      
      if (location.pathname !== '/') {
        navigate('/', { 
          replace: true,
          state: { 
            from: location.pathname,
            sessionExpired: true 
          }
        });
      }
    }
  };

  const login = async (
    role: 'admin' | 'driver',
    id: number,
    name: string,
    company: number,
    adminId?: number
  ) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    setUserName(name);
    setCompanyId(company);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    handleSessionExpired();
  };

  const updateSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await loadSettings(); // Reload settings from the server to ensure consistency
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userId,
        userName,
        companyId,
        settings,
        login,
        logout,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}