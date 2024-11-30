import { supabase } from './supabase';
import { AuthError, AuthApiError } from '@supabase/supabase-js';
import { saveSession } from './auth/sessionStorage';

interface AuthResponse {
  id: number;
  email: string;
  role: 'admin' | 'driver';
  name: string;
  companyId: number;
  adminId?: number;
}

export const authenticateUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    if (!email?.trim() || !password?.trim()) {
      throw new Error('Email and password are required');
    }

    // Sign in with credentials
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password.trim()
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      throw signInError;
    }

    if (!authData?.session?.access_token) {
      throw new Error('No session created');
    }

    // Save session to local storage
    saveSession(authData.session);

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, name, company_id, admin_id')
      .eq('auth_id', authData.session.user.id)
      .single();

    if (userError) {
      console.error('User data fetch error:', userError);
      throw new Error('Failed to fetch user data');
    }

    if (!userData) {
      throw new Error('User not found');
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role as 'admin' | 'driver',
      name: userData.name,
      companyId: userData.company_id,
      adminId: userData.admin_id
    };
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof AuthApiError) {
      if (error.status === 400) {
        throw new Error('Invalid email or password');
      }
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    if (error instanceof AuthError) {
      throw new Error('Authentication failed. Please try again.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unexpected error occurred during authentication');
  }
};