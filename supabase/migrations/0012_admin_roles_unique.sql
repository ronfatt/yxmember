delete from public.admin_roles a
using public.admin_roles b
where a.user_id = b.user_id
  and a.id < b.id;

create unique index if not exists admin_roles_user_id_idx
on public.admin_roles(user_id);
