-- Insert some sample sales for existing users
WITH driver AS (
  SELECT id, company_id FROM public.users WHERE role = 'driver'
),
admin AS (
  SELECT id, name FROM public.users WHERE role = 'admin'
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