create table if not exists public.frequency_commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  week_start date not null,
  commitment_text text not null,
  confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table if not exists public.frequency_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  week_start date not null,
  response_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists frequency_commitments_user_week_idx
  on public.frequency_commitments(user_id, week_start desc);

create index if not exists frequency_journal_entries_user_week_idx
  on public.frequency_journal_entries(user_id, week_start desc);

alter table public.frequency_commitments enable row level security;
alter table public.frequency_journal_entries enable row level security;

drop policy if exists "Users can view own frequency commitments" on public.frequency_commitments;
create policy "Users can view own frequency commitments"
on public.frequency_commitments for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own frequency commitments" on public.frequency_commitments;
create policy "Users can insert own frequency commitments"
on public.frequency_commitments for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own frequency commitments" on public.frequency_commitments;
create policy "Users can update own frequency commitments"
on public.frequency_commitments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view own frequency journals" on public.frequency_journal_entries;
create policy "Users can view own frequency journals"
on public.frequency_journal_entries for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own frequency journals" on public.frequency_journal_entries;
create policy "Users can insert own frequency journals"
on public.frequency_journal_entries for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own frequency journals" on public.frequency_journal_entries;
create policy "Users can update own frequency journals"
on public.frequency_journal_entries for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
