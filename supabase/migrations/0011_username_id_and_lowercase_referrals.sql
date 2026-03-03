create or replace function public.normalize_member_code(input_text text)
returns text as $$
begin
  return lower(regexp_replace(coalesce(input_text, ''), '[^a-zA-Z0-9]', '', 'g'));
end;
$$ language plpgsql immutable;

create or replace function public.generate_referral_code(seed_text text)
returns text as $$
declare
  candidate text;
begin
  candidate := public.normalize_member_code(seed_text);
  candidate := left(candidate, 8);

  if candidate = '' then
    candidate := substr(encode(gen_random_bytes(4), 'hex'), 1, 8);
  end if;

  loop
    exit when not exists (
      select 1 from public.users_profile where referral_code = candidate
    );
    candidate := left(candidate || substr(encode(gen_random_bytes(2), 'hex'), 1, 2), 10);
  end loop;

  return candidate;
end;
$$ language plpgsql;

alter table public.users_profile
  add column if not exists phone text,
  add column if not exists username_id text;

do $$
declare
  profile record;
  base_username text;
  candidate text;
begin
  for profile in
    select id, name, referral_code
    from public.users_profile
    order by created_at asc
  loop
    base_username := public.normalize_member_code(coalesce(profile.name, profile.referral_code, substr(profile.id::text, 1, 8)));

    if base_username = '' then
      base_username := substr(encode(gen_random_bytes(4), 'hex'), 1, 8);
    end if;

    candidate := left(base_username, 20);

    loop
      exit when not exists (
        select 1
        from public.users_profile
        where username_id = candidate
          and id <> profile.id
      );

      candidate := left(base_username, 16) || substr(encode(gen_random_bytes(2), 'hex'), 1, 4);
    end loop;

    update public.users_profile
    set
      username_id = candidate,
      name = candidate,
      referral_code = public.generate_referral_code(candidate)
    where id = profile.id;
  end loop;
end $$;

update public.users_profile up
set phone = u.phone
from public.users u
where u.id = up.id
  and up.phone is null
  and u.phone is not null;

alter table public.users_profile
  alter column username_id set not null;

create unique index if not exists users_profile_username_id_idx on public.users_profile(username_id);

create or replace function public.handle_new_user()
returns trigger as $$
declare
  referred_code text;
  referrer_profile_id uuid;
  seeded_username text;
begin
  referred_code := public.normalize_member_code(nullif(new.raw_user_meta_data ->> 'referred_code', ''));
  seeded_username := public.normalize_member_code(
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username_id', ''),
      nullif(new.raw_user_meta_data ->> 'name', '')
    )
  );

  if seeded_username = '' then
    seeded_username := public.generate_referral_code(coalesce(new.email, substr(new.id::text, 1, 8)));
  end if;

  if referred_code is not null and referred_code <> '' then
    select id into referrer_profile_id
    from public.users_profile
    where referral_code = referred_code
    limit 1;
  end if;

  insert into public.users (id, email, phone, name, birth_date)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), new.phone),
    seeded_username,
    nullif(new.raw_user_meta_data ->> 'birthday', '')::date
  )
  on conflict (id) do update
    set email = excluded.email,
        phone = coalesce(excluded.phone, public.users.phone),
        name = coalesce(excluded.name, public.users.name),
        birth_date = coalesce(excluded.birth_date, public.users.birth_date),
        updated_at = now();

  insert into public.users_profile (
    id,
    name,
    username_id,
    phone,
    birthday,
    referral_code,
    referred_by
  )
  values (
    new.id,
    seeded_username,
    seeded_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), new.phone),
    nullif(new.raw_user_meta_data ->> 'birthday', '')::date,
    public.generate_referral_code(coalesce(seeded_username, new.email, substr(new.id::text, 1, 8))),
    referrer_profile_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;
