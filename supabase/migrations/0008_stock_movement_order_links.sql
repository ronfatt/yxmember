alter table public.stock_movements
  add column if not exists order_id uuid references public.orders(id) on delete set null;

create index if not exists stock_movements_order_idx
  on public.stock_movements(order_id);
