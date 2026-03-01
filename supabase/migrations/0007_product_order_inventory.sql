alter table public.orders
  add column if not exists product_id uuid references public.products(id) on delete set null,
  add column if not exists quantity integer not null default 1;

create index if not exists orders_product_created_idx
  on public.orders(product_id, created_at desc);
