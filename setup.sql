-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

-- Set search path
SET search_path TO public;

-- Create function to get auth_id from email
CREATE OR REPLACE FUNCTION public.get_auth_id_by_email(email_address TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_id UUID;
BEGIN
  -- Get auth_id from auth.users table
  SELECT id INTO auth_id
  FROM auth.users
  WHERE email = email_address;

  IF auth_id IS NULL THEN
    RAISE EXCEPTION 'No auth user found for email: %', email_address;
  END IF;

  RETURN auth_id::TEXT;
END;
$$;

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- Create companies table
CREATE TABLE public.companies (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  admin_id BIGINT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Create users table
CREATE TABLE public.users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT NOT NULL UNIQUE,
  auth_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'driver')),
  name TEXT NOT NULL,
  company_id BIGINT REFERENCES public.companies(id),
  admin_id BIGINT REFERENCES public.users(id),
  commission NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (commission >= 0 AND commission <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Add foreign key from companies to users (admin)
ALTER TABLE public.companies 
  ADD CONSTRAINT companies_admin_id_fkey 
  FOREIGN KEY (admin_id) REFERENCES public.users(id);

-- Create sales table
CREATE TABLE public.sales (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES public.users(id) NOT NULL,
  company_id BIGINT REFERENCES public.companies(id) NOT NULL,
  date DATE NOT NULL,
  platform TEXT NOT NULL,
  card_payments NUMERIC(10,2) NOT NULL DEFAULT 0,
  cash_payments NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_sale NUMERIC(10,2) NOT NULL,
  notes TEXT,
  last_modified_by BIGINT REFERENCES public.users(id) NOT NULL,
  last_modified_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Create settings table
CREATE TABLE public.settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  company_id BIGINT REFERENCES public.companies(id) NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'USD',
  enabled_platforms TEXT[] NOT NULL DEFAULT ARRAY['UBER', 'CABIFY', 'BOLT', 'TAXXILO'],
  custom_platforms TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_users_company ON public.users(company_id);
CREATE INDEX idx_users_admin ON public.users(admin_id);
CREATE INDEX idx_sales_user ON public.sales(user_id);
CREATE INDEX idx_sales_company ON public.sales(company_id);
CREATE INDEX idx_sales_date ON public.sales(date);
CREATE INDEX idx_settings_company ON public.settings(company_id);

-- Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;

-- Insert demo company
INSERT INTO public.companies (
  name,
  address,
  phone,
  email,
  website
) VALUES (
  'Demo Company',
  '123 Main St, Suite 100, New York, NY 10001',
  '+1 (555) 123-4567',
  'contact@democompany.com',
  'https://democompany.com'
);

-- Insert admin user
WITH company AS (
  SELECT id FROM public.companies WHERE name = 'Demo Company'
)
INSERT INTO public.users (
  email,
  auth_id,
  role,
  name,
  company_id,
  commission
) VALUES (
  'admin@example.com',
  get_auth_id_by_email('admin@example.com'),
  'admin',
  'Admin User',
  (SELECT id FROM company),
  0
);

-- Update company with admin_id
UPDATE public.companies
SET admin_id = (
  SELECT id FROM public.users 
  WHERE email = 'admin@example.com'
)
WHERE name = 'Demo Company';

-- Insert driver user
WITH admin_user AS (
  SELECT id, company_id FROM public.users WHERE email = 'admin@example.com'
)
INSERT INTO public.users (
  email,
  auth_id,
  role,
  name,
  company_id,
  admin_id,
  commission
) VALUES (
  'driver@example.com',
  get_auth_id_by_email('driver@example.com'),
  'driver',
  'John Driver',
  (SELECT company_id FROM admin_user),
  (SELECT id FROM admin_user),
  10
);

-- Insert default settings for the company
INSERT INTO public.settings (
  company_id,
  currency,
  enabled_platforms,
  custom_platforms
) VALUES (
  (SELECT id FROM public.companies WHERE name = 'Demo Company'),
  'USD',
  ARRAY['UBER', 'CABIFY', 'BOLT', 'TAXXILO'],
  ARRAY[]::TEXT[]
);

-- Insert sample sales data for the driver
WITH driver AS (
  SELECT id, company_id FROM public.users WHERE email = 'driver@example.com'
),
admin AS (
  SELECT id, name FROM public.users WHERE email = 'admin@example.com'
)
INSERT INTO public.sales (
  user_id,
  company_id,
  date,
  platform,
  card_payments,
  cash_payments,
  total_sale,
  notes,
  last_modified_by,
  last_modified_by_name
)
SELECT 
  driver.id,
  driver.company_id,
  current_date - (n || ' days')::interval,
  platform,
  ROUND((random() * 100)::numeric, 2),
  ROUND((random() * 100)::numeric, 2),
  ROUND((random() * 200)::numeric, 2),
  'Sample sale entry #' || n,
  admin.id,
  admin.name
FROM 
  driver,
  admin,
  generate_series(0, 30) AS n,
  (VALUES ('UBER'), ('BOLT'), ('CABIFY'), ('TAXXILO')) AS platforms(platform)
ORDER BY RANDOM()
LIMIT 50;