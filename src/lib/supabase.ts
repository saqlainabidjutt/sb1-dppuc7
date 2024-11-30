import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://lretrwstlwqjzbjzcghu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZXRyd3N0bHdxanpianpjZ2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwMDQyMTYsImV4cCI6MjA0ODU4MDIxNn0.qLcA6VuUsO2mhVauKlbWI-XDa-DaVGQ9wFHso9vQd3I';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'driver-sales-auth'
  }
});

export const tables = {
  users: 'users',
  sales: 'sales',
  companies: 'companies',
  settings: 'settings'
} as const;

// Helper function to get auth headers
export const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
};