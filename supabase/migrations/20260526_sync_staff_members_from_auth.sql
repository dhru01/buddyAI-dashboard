-- Backfill staff_members from every existing auth user (signed up before the trigger existed).

create or replace function public.sync_staff_members_from_auth()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.staff_members (auth_user_id, email, full_name, initials, role)
  select
    u.id,
    u.email,
    trim(
      coalesce(
        nullif(u.raw_user_meta_data ->> 'full_name', ''),
        nullif(
          trim(
            coalesce(u.raw_user_meta_data ->> 'first_name', '')
            || ' '
            || coalesce(u.raw_user_meta_data ->> 'last_name', '')
          ),
          ''
        ),
        split_part(u.email, '@', 1)
      )
    ) as full_name,
    public.format_staff_initials(
      coalesce(u.raw_user_meta_data ->> 'first_name', ''),
      coalesce(u.raw_user_meta_data ->> 'last_name', ''),
      coalesce(u.raw_user_meta_data ->> 'full_name', '')
    ) as initials,
    'staff'
  from auth.users u
  where u.email is not null
  on conflict (email) do update
    set auth_user_id = excluded.auth_user_id,
        full_name = excluded.full_name,
        initials = excluded.initials;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.sync_staff_members_from_auth() from public;
grant execute on function public.sync_staff_members_from_auth() to authenticated;
