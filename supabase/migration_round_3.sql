-- ==============================================================================
-- NOOR FARM: ROUND 3 SQL MIGRATION
-- Adds payment methods, manual transfer settings, and payment status tracking
-- ==============================================================================

-- 1. SETTINGS: Add wallet and InstaPay manual transfer settings
alter table public.settings
  add column if not exists wallet_number text default '',
  add column if not exists wallet_label text default '',
  add column if not exists instapay_address text default '';

-- 2. ORDERS: Add payment method and payment received status
alter table public.orders
  add column if not exists payment_method text not null default 'cod' check (payment_method in ('cod', 'wallet', 'instapay')),
  add column if not exists payment_status text not null default 'pending' check (payment_status in ('pending', 'received'));

-- Index for payment queries
create index if not exists idx_orders_payment_status on public.orders(payment_status);
