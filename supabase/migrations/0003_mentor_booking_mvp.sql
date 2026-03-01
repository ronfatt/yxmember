create extension if not exists "btree_gist";

alter table public.mentors
  add column if not exists headline text,
  add column if not exists suitable_for text,
  add column if not exists location_type text not null default 'both',
  add column if not exists location_note text,
  add column if not exists languages jsonb not null default '[]'::jsonb;

alter table public.mentors
  drop constraint if exists mentors_location_type_check;

alter table public.mentors
  add constraint mentors_location_type_check
  check (location_type in ('online', 'offline', 'both'));

create table if not exists public.mentor_services (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  name text not null,
  duration_min integer not null check (duration_min in (30, 60, 90)),
  price_total numeric not null,
  deposit_amount numeric not null default 0,
  allow_points boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.mentor_availability_rules (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_interval_min integer not null default 30,
  timezone text not null default 'Asia/Kuala_Lumpur',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.mentor_availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  date date not null,
  is_available boolean not null default false,
  start_time time,
  end_time time,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  service_id uuid not null references public.mentor_services(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text not null default 'Asia/Kuala_Lumpur',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  session_mode text not null check (session_mode in ('online', 'offline')),
  intake_json jsonb not null default '{}'::jsonb,
  price_total numeric not null,
  deposit_amount numeric not null default 0,
  points_used integer not null default 0,
  cash_due numeric not null,
  deposit_paid boolean not null default false,
  balance_paid boolean not null default false,
  payment_note text,
  order_id uuid unique references public.orders(id) on delete set null,
  meeting_link text,
  location_note text,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointment_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  mentor_note text,
  followup_suggestions text,
  created_at timestamptz not null default now()
);

create index if not exists mentor_services_mentor_active_idx on public.mentor_services(mentor_id, active);
create index if not exists mentor_availability_rules_mentor_weekday_idx on public.mentor_availability_rules(mentor_id, weekday);
create index if not exists mentor_availability_exceptions_mentor_date_idx on public.mentor_availability_exceptions(mentor_id, date);
create index if not exists appointments_user_start_idx on public.appointments(user_id, start_at desc);
create index if not exists appointments_mentor_start_idx on public.appointments(mentor_id, start_at);
create index if not exists appointments_status_start_idx on public.appointments(status, start_at);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_no_overlap'
  ) then
    alter table public.appointments
      add constraint appointments_no_overlap
      exclude using gist (
        mentor_id with =,
        tstzrange(start_at, end_at, '[)') with &&
      )
      where (status in ('pending', 'confirmed', 'completed'));
  end if;
end $$;

alter table public.mentor_services enable row level security;
alter table public.mentor_availability_rules enable row level security;
alter table public.mentor_availability_exceptions enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_notes enable row level security;

drop policy if exists "Public mentor services" on public.mentor_services;
create policy "Public mentor services"
on public.mentor_services for select
using (
  active = true
  and exists (
    select 1
    from public.mentors
    where mentors.id = mentor_services.mentor_id
      and mentors.is_active = true
  )
);

drop policy if exists "Public mentor availability rules" on public.mentor_availability_rules;
create policy "Public mentor availability rules"
on public.mentor_availability_rules for select
using (
  active = true
  and exists (
    select 1
    from public.mentors
    where mentors.id = mentor_availability_rules.mentor_id
      and mentors.is_active = true
  )
);

drop policy if exists "Public mentor availability exceptions" on public.mentor_availability_exceptions;
create policy "Public mentor availability exceptions"
on public.mentor_availability_exceptions for select
using (
  exists (
    select 1
    from public.mentors
    where mentors.id = mentor_availability_exceptions.mentor_id
      and mentors.is_active = true
  )
);

drop policy if exists "Members view own appointments" on public.appointments;
create policy "Members view own appointments"
on public.appointments for select
using (auth.uid() = user_id);

drop policy if exists "Members insert own appointments" on public.appointments;
create policy "Members insert own appointments"
on public.appointments for insert
with check (auth.uid() = user_id);

drop policy if exists "Members view own appointment notes" on public.appointment_notes;
create policy "Members view own appointment notes"
on public.appointment_notes for select
using (
  exists (
    select 1
    from public.appointments
    where appointments.id = appointment_notes.appointment_id
      and appointments.user_id = auth.uid()
  )
);
