alter table public.payment_accounts
  add column if not exists opening_balance numeric not null default 0;

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.expense_categories(id) on delete set null,
  payment_account_id uuid references public.payment_accounts(id) on delete set null,
  amount_total numeric not null,
  spent_on date not null,
  note text,
  receipt_url text,
  status text not null default 'paid' check (status in ('draft','paid')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manual_income_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  payment_account_id uuid references public.payment_accounts(id) on delete set null,
  amount_total numeric not null,
  received_on date not null,
  note text,
  source_type text not null default 'other' check (source_type in ('adjustment','offline_sale','other')),
  status text not null default 'received' check (status in ('draft','received')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expense_categories_sort_idx
  on public.expense_categories(is_active, sort_order, created_at desc);

create index if not exists expenses_spent_on_idx
  on public.expenses(spent_on desc, status);

create index if not exists expenses_account_idx
  on public.expenses(payment_account_id, spent_on desc);

create index if not exists manual_income_received_on_idx
  on public.manual_income_entries(received_on desc, status);

create index if not exists manual_income_account_idx
  on public.manual_income_entries(payment_account_id, received_on desc);

alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.manual_income_entries enable row level security;
