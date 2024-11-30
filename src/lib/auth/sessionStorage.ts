import { Session } from '@supabase/supabase-js';

const SESSION_KEY = 'driver-sales-session';

export const saveSession = (session: Session | null) => {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const getStoredSession = (): Session | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse stored session:', error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};