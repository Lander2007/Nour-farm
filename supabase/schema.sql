-- ==============================================================================
-- NOOR FARM DATABASE SCHEMA & RLS POLICIES (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. DEPARTMENTS TABLE (2 fixed departments)
create table if not exists public.departments (
  id text primary key,
  name_ar text not null,
  accent_word text not null,
  sub_headline text not null,
  sort integer not null default 0
);

-- 3. SECTIONS TABLE (7 fixed sub-sections)
create table if not exists public.sections (
  id text primary key,
  department_id text not null references public.departments(id) on delete cascade,
  name_ar text not null,
  cover_image text,
  sort integer not null default 0
);

-- 4. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key default uuid_generate_v4()::text,
  section_id text not null references public.sections(id) on delete cascade,
  name_ar text not null,
  image_url text,
  price numeric(10, 2),
  unit_type text not null default 'kg' check (unit_type in ('kg', 'piece', 'bunch', 'pack', 'box')),
  pack_label text,
  step numeric(4, 2) not null default 1.0,
  published boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

-- 5. SETTINGS TABLE
create table if not exists public.settings (
  id text primary key default 'store_settings',
  store_address text not null default 'أكتوبر – الحي المتميز – السياحية الأولى',
  service_areas jsonb not null default '[{"id":"area-1","name":"أكتوبر – الحي المتميز","enabled":true},{"id":"area-2","name":"أكتوبر – غرب سوميد","enabled":true}]'::jsonb,
  whatsapp_number text not null default '01224272991',
  free_delivery_active boolean not null default false,
  free_delivery_text text not null default 'التوصيل مجاني في عروض الافتتاح',
  updated_at timestamptz not null default now()
);

-- 6. ORDERS TABLE
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  address_details jsonb not null,
  location jsonb not null,
  items jsonb not null,
  total_price numeric(10, 2) not null,
  subtotal_price numeric(10, 2) not null default 0,
  area text not null default '',
  delivery_fee numeric(10, 2) default null,
  delivery_fee_status text not null default 'pending' check (delivery_fee_status in ('pending', 'free', 'set')),
  status text not null default 'new' check (status in ('new', 'preparing', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

-- 6. INDEXES FOR HIGH-SPEED QUERIES
create index if not exists idx_products_section_published on public.products(section_id, published, sort);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);

-- 7. SEED DEPARTMENTS & SECTIONS
insert into public.departments (id, name_ar, accent_word, sub_headline, sort)
values
  ('vegetables', 'الخضار', 'طازج', 'خضار يومي من المزرعة، مغسول ومجهّز', 1),
  ('fruits', 'الفاكهة', 'طازجة', 'فواكه الموسم الطبيعية، سكرية ومختارة بالواحدة', 2)
on conflict (id) do update set
  name_ar = excluded.name_ar,
  accent_word = excluded.accent_word,
  sub_headline = excluded.sub_headline,
  sort = excluded.sort;

insert into public.sections (id, department_id, name_ar, cover_image, sort)
values
  ('fresh-vegetables', 'vegetables', 'خضار طازج', '/noor-farm-images/IMG-20261014-WA0114.jpg', 1),
  ('herbs', 'vegetables', 'الخضرة', '/basil.webp', 2),
  ('ready-vegetables', 'vegetables', 'خضار متقطع ومجهّز', '/scenes/cut.jpg', 3),
  ('salads', 'vegetables', 'السلطات', '/scenes/ready.jpg', 4),
  ('fresh-fruits', 'fruits', 'فاكهة طازجة', '/noor-farm-images/red-plum.jpg', 1),
  ('cut-fruits', 'fruits', 'فاكهة متقطعة ومجهّزة', '/noor-farm-images/cantaloupe.jpg', 2),
  ('mixes', 'fruits', 'ميكسات', null, 3)
on conflict (id) do update set
  name_ar = excluded.name_ar,
  department_id = excluded.department_id,
  cover_image = excluded.cover_image,
  sort = excluded.sort;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.departments enable row level security;
alter table public.sections enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.settings enable row level security;

-- Settings: Public can read
create policy "Public can read store settings"
  on public.settings for select
  using (true);

-- Settings: Authenticated admin can manage
create policy "Authenticated admin can manage settings"
  on public.settings for all
  to authenticated
  using (true)
  with check (true);

-- Departments: Public can read
create policy "Public can read departments"
  on public.departments for select
  using (true);

-- Sections: Public can read
create policy "Public can read sections"
  on public.sections for select
  using (true);

-- Products: Public can only view published products
create policy "Public can read published products"
  on public.products for select
  using (published = true);

-- Service role / Admin bypass (Server API routes use SUPABASE_SERVICE_ROLE_KEY to bypass RLS for writes)
-- For Supabase authenticated admin users:
create policy "Authenticated admin can view all products"
  on public.products for select
  to authenticated
  using (true);

create policy "Authenticated admin can manage products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated admin can view all orders"
  on public.orders for select
  to authenticated
  using (true);

create policy "Authenticated admin can update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

-- 9. STORAGE BUCKET FOR PRODUCT IMAGES
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'noor-farm-media',
  'noor-farm-media',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Public read access to product images bucket
create policy "Public Access to product media"
  on storage.objects for select
  using (bucket_id = 'noor-farm-media');
