-- Enable auth schema access
CREATE POLICY "Enable read access for authenticated users"
  ON auth.users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Grant access to auth schema
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated;
GRANT SELECT ON auth.users TO postgres, anon, authenticated;

-- Insert demo company
INSERT INTO public.companies (
  name,
  address,
  phone,
  email,
  website
) VALUES (
  'Demo Company',
  '123 Main St',
  '+1234567890',
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