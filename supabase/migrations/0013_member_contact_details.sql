alter table public.users_profile
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text,
  add column if not exists country text default 'Malaysia';

update public.users_profile up
set phone = u.phone
from public.users u
where up.id = u.id
  and coalesce(up.phone, '') = ''
  and coalesce(u.phone, '') <> '';
