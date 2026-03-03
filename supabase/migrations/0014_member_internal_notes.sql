alter table public.users_profile
  add column if not exists internal_note text;
