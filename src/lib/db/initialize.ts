import { supabase } from '../supabase';

export async function initializeDatabase() {
  try {
    // Test the connection by making a simple query
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      throw new Error(error.message);
    }

    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Error testing database connection:', error);
    throw new Error('Failed to establish database connection. Please check your credentials and try again.');
  }
}

export async function testDatabaseConnection() {
  return initializeDatabase();
}