alter table public.manual_income_entries
  add column if not exists receipt_url text;
