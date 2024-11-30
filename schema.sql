-- Add settings table to store company-wide settings
create table settings (
  id bigint primary key generated always as identity,
  company_id bigint references companies(id) not null unique,
  currency text not null default 'USD',
  enabled_platforms text[] not null default array['UBER', 'CABIFY', 'BOLT', 'TAXXILO'],
  custom_platforms text[] not null default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_settings_company on settings(company_id);

alter table settings enable row level security;

-- RLS Policies for settings
create policy "Settings are viewable by authenticated users in same company"
  on settings for select
  using (
    exists (
      select 1 from users
      where users.company_id = settings.company_id
      and users.auth_id = auth.uid()::text
    )
  );

create policy "Settings are updatable by admin users in same company"
  on settings for update
  using (
    exists (
      select 1 from users
      where users.company_id = settings.company_id
      and users.role = 'admin'
      and users.auth_id = auth.uid()::text
    )
  );

create policy "Settings are insertable by admin users in same company"
  on settings for insert
  with check (
    exists (
      select 1 from users
      where users.company_id = settings.company_id
      and users.role = 'admin'
      and users.auth_id = auth.uid()::text
    )
  );