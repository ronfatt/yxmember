create table if not exists public.payment_accounts (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  bank_name text not null,
  account_name text not null,
  account_number text not null,
  reference_note text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists sku text,
  add column if not exists price_myr numeric,
  add column if not exists stock_on_hand integer not null default 0,
  add column if not exists track_inventory boolean not null default true,
  add column if not exists allow_backorder boolean not null default false;

create index if not exists payment_accounts_active_sort_idx
  on public.payment_accounts(is_active, sort_order, created_at desc);

create index if not exists products_sku_idx
  on public.products(sku);

alter table public.payment_accounts enable row level security;

create policy "Public active payment accounts"
on public.payment_accounts for select
using (is_active = true);
