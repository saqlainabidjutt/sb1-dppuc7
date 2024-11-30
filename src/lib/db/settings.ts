import { supabase } from '../supabase';
import { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  currency: 'USD',
  enabledPlatforms: ['UBER', 'CABIFY', 'BOLT', 'TAXXILO'],
  customPlatforms: []
};

export async function getSettings(companyId: number): Promise<Settings> {
  try {
    // First check if the user has access to this company
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data: userAccess, error: accessError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('auth_id', userData.user.id)
      .single();

    if (accessError) throw accessError;
    if (userAccess.company_id !== companyId) {
      throw new Error('Unauthorized access to company settings');
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      // If no settings found, create default settings
      if (error.code === 'PGRST116') {
        // Only admin can create settings
        if (userAccess.role !== 'admin') {
          throw new Error('Only admin can initialize settings');
        }
        return createSettings(companyId);
      }
      throw error;
    }

    return {
      currency: data.currency,
      enabledPlatforms: data.enabled_platforms,
      customPlatforms: data.custom_platforms
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return DEFAULT_SETTINGS; // Fallback to default settings instead of throwing
  }
}

export async function createSettings(companyId: number): Promise<Settings> {
  try {
    // Verify user is admin of the company
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data: userAccess, error: accessError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('auth_id', userData.user.id)
      .single();

    if (accessError) throw accessError;
    if (userAccess.role !== 'admin' || userAccess.company_id !== companyId) {
      throw new Error('Only company admin can create settings');
    }

    const { data, error } = await supabase
      .from('settings')
      .insert([{
        company_id: companyId,
        currency: DEFAULT_SETTINGS.currency,
        enabled_platforms: DEFAULT_SETTINGS.enabledPlatforms,
        custom_platforms: DEFAULT_SETTINGS.customPlatforms
      }])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create settings');

    return {
      currency: data.currency,
      enabledPlatforms: data.enabled_platforms,
      customPlatforms: data.custom_platforms
    };
  } catch (error) {
    console.error('Error creating settings:', error);
    return DEFAULT_SETTINGS; // Fallback to default settings instead of throwing
  }
}

export async function updateSettings(
  companyId: number,
  settings: Settings
): Promise<Settings> {
  try {
    // Verify user is admin of the company
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data: userAccess, error: accessError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('auth_id', userData.user.id)
      .single();

    if (accessError) throw accessError;
    if (userAccess.role !== 'admin' || userAccess.company_id !== companyId) {
      throw new Error('Only company admin can update settings');
    }

    const { data, error } = await supabase
      .from('settings')
      .update({
        currency: settings.currency,
        enabled_platforms: settings.enabledPlatforms,
        custom_platforms: settings.customPlatforms,
        updated_at: new Date().toISOString()
      })
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update settings');

    return {
      currency: data.currency,
      enabledPlatforms: data.enabled_platforms,
      customPlatforms: data.custom_platforms
    };
  } catch (error) {
    console.error('Error updating settings:', error);
    return settings; // Return existing settings if update fails
  }
}