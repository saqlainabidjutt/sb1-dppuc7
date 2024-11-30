-- Create company first
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
) RETURNING id;

-- Create admin user
WITH company AS (
  SELECT id FROM companies WHERE name = 'Demo Company'
)
INSERT INTO public.users (
  email,
  password,
  role,
  name,
  company_id,
  commission
) VALUES (
  'admin@example.com',
  crypt('admin123', gen_salt('bf')), -- Using pgcrypto for password hashing
  'admin',
  'Admin User',
  (SELECT id FROM company),
  0
) RETURNING id;

-- Update company with admin_id
UPDATE public.companies
SET admin_id = (
  SELECT id FROM public.users 
  WHERE email = 'admin@example.com'
)
WHERE name = 'Demo Company';

-- Insert some demo data for testing
WITH admin_user AS (
  SELECT id, company_id FROM public.users WHERE email = 'admin@example.com'
)
INSERT INTO public.users (
  email,
  password,
  role,
  name,
  company_id,
  admin_id,
  commission
) VALUES (
  'driver@example.com',
  crypt('driver123', gen_salt('bf')),
  'driver',
  'John Driver',
  (SELECT company_id FROM admin_user),
  (SELECT id FROM admin_user),
  10
);

-- Insert some sample sales
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
  'Sample sale ' || n,
  admin.id,
  admin.name
FROM 
  driver,
  admin,
  generate_series(0, 4) AS n,
  (VALUES ('UBER'), ('BOLT'), ('CABIFY'), ('TAXXILO')) AS platforms(platform);