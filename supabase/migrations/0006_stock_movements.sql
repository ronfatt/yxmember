create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  movement_type text not null check (movement_type in ('in','out','adjust')),
  quantity integer not null,
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_created_idx
  on public.stock_movements(product_id, created_at desc);

alter table public.stock_movements enable row level security;
