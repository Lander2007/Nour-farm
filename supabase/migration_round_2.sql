-- ==============================================================================
-- NOOR FARM: ROUND 2 SQL MIGRATION & RLS POLICIES
-- ==============================================================================

-- 1. SETTINGS TABLE
create table if not exists public.settings (
  id text primary key default 'store_settings',
  store_address text not null default 'أكتوبر – الحي المتميز – السياحية الأولى',
  service_areas jsonb not null default '[{"id":"area-1","name":"أكتوبر – الحي المتميز","enabled":true},{"id":"area-2","name":"أكتوبر – غرب سوميد","enabled":true}]'::jsonb,
  whatsapp_number text not null default '01224272991',
  free_delivery_active boolean not null default false,
  free_delivery_text text not null default 'التوصيل مجاني في عروض الافتتاح',
  updated_at timestamptz not null default now()
);

-- Seed initial settings if row does not exist
insert into public.settings (id, store_address, service_areas, whatsapp_number, free_delivery_active, free_delivery_text)
values (
  'store_settings',
  'أكتوبر – الحي المتميز – السياحية الأولى',
  '[{"id":"area-1","name":"أكتوبر – الحي المتميز","enabled":true},{"id":"area-2","name":"أكتوبر – غرب سوميد","enabled":true}]'::jsonb,
  '01224272991',
  false,
  'التوصيل مجاني في عروض الافتتاح'
)
on conflict (id) do nothing;

-- 2. ALTER ORDERS TABLE WITH NEW COLUMNS
alter table public.orders
  add column if not exists area text not null default '',
  add column if not exists delivery_fee numeric(10, 2) default null,
  add column if not exists delivery_fee_status text not null default 'pending' check (delivery_fee_status in ('pending', 'free', 'set')),
  add column if not exists subtotal_price numeric(10, 2) not null default 0;

-- Backfill subtotal_price for existing orders if 0
update public.orders
set subtotal_price = total_price
where subtotal_price = 0;

-- 3. ROW LEVEL SECURITY (RLS) FOR SETTINGS
alter table public.settings enable row level security;

-- Public read access to settings
drop policy if exists "Public can read store settings" on public.settings;
create policy "Public can read store settings"
  on public.settings for select
  using (true);

-- Authenticated admin update access to settings
drop policy if exists "Authenticated admin can manage settings" on public.settings;
create policy "Authenticated admin can manage settings"
  on public.settings for all
  to authenticated
  using (true)
  with check (true);
