import { supabase } from '../supabase';
import { User, Sale, Company } from './schema';

export const getAllDrivers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'driver')
    .order('name');

  if (error) throw error;
  return data || [];
};

export const getUserById = async (userId: number): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const createUser = async (
  email: string,
  password: string,
  role: 'admin' | 'driver',
  name: string,
  companyId: number,
  commission: number = 0
): Promise<User> => {
  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create auth user');

  // Then create user record
  const { data, error } = await supabase
    .from('users')
    .insert([{
      email,
      auth_id: authData.user.id,
      role,
      name,
      company_id: companyId,
      commission
    }])
    .select()
    .single();

  if (error) {
    // Cleanup auth user if db insert fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw error;
  }

  return data;
};

export const updateUser = async (
  userId: number,
  updates: Partial<User>
): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .update({
      name: updates.name,
      email: updates.email,
      commission: updates.commission,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('User not found');

  return data;
};

export const getRecentSales = async (
  userId?: number,
  companyId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<Array<Sale & { driverName: string }>> => {
  let query = supabase
    .from('sales')
    .select(`
      *,
      users!sales_user_id_fkey (
        name
      )
    `)
    .order('date', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  if (startDate) {
    // Format date as YYYY-MM-DD and set to start of day
    const formattedStartDate = startDate.toISOString().split('T')[0];
    query = query.gte('date', formattedStartDate);
  }

  if (endDate) {
    // Format date as YYYY-MM-DD and set to end of day
    const formattedEndDate = endDate.toISOString().split('T')[0];
    query = query.lte('date', formattedEndDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(sale => ({
    ...sale,
    driverName: sale.users.name,
    cardPayments: parseFloat(sale.card_payments) || 0,
    cashPayments: parseFloat(sale.cash_payments) || 0,
    totalSale: parseFloat(sale.total_sale) || 0,
    last_modified_by_name: sale.last_modified_by_name
  }));
};

export const createSale = async (
  userId: number,
  companyId: number,
  date: Date,
  platform: string,
  cardPayments: number,
  cashPayments: number,
  totalSale: number,
  notes: string,
  creator: { id: number; name: string }
): Promise<Sale> => {
  const { data, error } = await supabase
    .from('sales')
    .insert([{
      user_id: userId,
      company_id: companyId,
      date: date.toISOString().split('T')[0],
      platform,
      card_payments: cardPayments.toFixed(2),
      cash_payments: cashPayments.toFixed(2),
      total_sale: totalSale.toFixed(2),
      notes,
      last_modified_by: creator.id,
      last_modified_by_name: creator.name
    }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create sale');

  return {
    ...data,
    cardPayments: parseFloat(data.card_payments),
    cashPayments: parseFloat(data.cash_payments),
    totalSale: parseFloat(data.total_sale)
  };
};

export const updateSale = async (
  saleId: number,
  updates: Partial<Sale>,
  modifier: { id: number; name: string }
): Promise<Sale> => {
  const { data, error } = await supabase
    .from('sales')
    .update({
      date: updates.date?.toISOString().split('T')[0],
      platform: updates.platform,
      card_payments: updates.cardPayments?.toFixed(2),
      cash_payments: updates.cashPayments?.toFixed(2),
      total_sale: updates.totalSale?.toFixed(2),
      notes: updates.notes,
      last_modified_by: modifier.id,
      last_modified_by_name: modifier.name,
      updated_at: new Date().toISOString()
    })
    .eq('id', saleId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Sale not found');

  return {
    ...data,
    cardPayments: parseFloat(data.card_payments),
    cashPayments: parseFloat(data.cash_payments),
    totalSale: parseFloat(data.total_sale)
  };
};

export const deleteSale = async (saleId: number): Promise<void> => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', saleId);

  if (error) throw error;
};

export const getSaleById = async (saleId: number): Promise<Sale | null> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*, users!sales_user_id_fkey(name)')
    .eq('id', saleId)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    driverName: data.users.name,
    cardPayments: parseFloat(data.card_payments),
    cashPayments: parseFloat(data.cash_payments),
    totalSale: parseFloat(data.total_sale)
  };
};

export const getSalesByUserId = async (userId: number): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(sale => ({
    ...sale,
    cardPayments: parseFloat(sale.card_payments),
    cashPayments: parseFloat(sale.cash_payments),
    totalSale: parseFloat(sale.total_sale)
  }));
};

export const getCompanyById = async (companyId: number): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) throw error;
  return data;
};

export const updateCompany = async (
  companyId: number,
  updates: Partial<Company>
): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Company not found');

  return data;
};