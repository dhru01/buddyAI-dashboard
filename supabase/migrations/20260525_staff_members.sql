-- Staff members for dynamic assignment in the issues queue.
-- Linked to Supabase Auth; initials are generated from full_name.

create table if not exists staff_members (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  initials text not null,
  role text not null default 'staff'
    check (role in ('admin', 'support', 'tutor', 'reviewer', 'staff')),
  created_at timestamptz not null default now()
);

create index if not exists idx_staff_members_auth_user_id on staff_members (auth_user_id);
create index if not exists idx_staff_members_email on staff_members (email);

alter table staff_members enable row level security;

-- Any signed-in dashboard user can list staff for assignment dropdowns.
create policy "authenticated read staff_members"
on staff_members
for select
to authenticated
using (true);

-- Allow a user to create their own staff profile (signup fallback if trigger missed).
create policy "users insert own staff_member"
on staff_members
for insert
to authenticated
with check (auth_user_id = auth.uid());

create policy "users update own staff_member"
on staff_members
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create or replace function public.format_staff_initials(
  p_first_name text,
  p_last_name text,
  p_full_name text default null
)
returns text
language plpgsql
immutable
as $$
declare
  v_first text;
  v_last text;
  v_full text;
  v_parts text[];
begin
  v_first := trim(coalesce(p_first_name, ''));
  v_last := trim(coalesce(p_last_name, ''));
  v_full := trim(coalesce(p_full_name, ''));

  if v_first = '' and v_last = '' and v_full <> '' then
    v_parts := regexp_split_to_array(v_full, '\s+');
    if array_length(v_parts, 1) >= 1 then
      v_first := v_parts[1];
    end if;
    if array_length(v_parts, 1) >= 2 then
      v_last := array_to_string(v_parts[2:array_length(v_parts, 1)], ' ');
    end if;
  end if;

  if v_first = '' and v_last = '' then
    return 'Staff';
  end if;

  if v_last = '' then
    return upper(left(v_first, 1)) || '.';
  end if;

  return upper(left(v_first, 1)) || '. ' || v_last;
end;
$$;

create or replace function public.handle_new_auth_user_staff_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first text;
  v_last text;
  v_full text;
  v_initials text;
begin
  v_first := coalesce(new.raw_user_meta_data ->> 'first_name', '');
  v_last := coalesce(new.raw_user_meta_data ->> 'last_name', '');
  v_full := trim(coalesce(new.raw_user_meta_data ->> 'full_name', v_first || ' ' || v_last));

  if v_full = '' then
    v_full := split_part(new.email, '@', 1);
  end if;

  v_initials := public.format_staff_initials(v_first, v_last, v_full);

  insert into public.staff_members (auth_user_id, email, full_name, initials, role)
  values (new.id, new.email, v_full, v_initials, 'staff')
  on conflict (email) do update
    set auth_user_id = excluded.auth_user_id,
        full_name = excluded.full_name,
        initials = excluded.initials;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_staff_member on auth.users;

create trigger on_auth_user_created_staff_member
after insert on auth.users
for each row
execute function public.handle_new_auth_user_staff_member();

-- Point issue assignments at staff_members instead of admin_users.
alter table error_logs drop constraint if exists error_logs_assigned_staff_fkey;

alter table error_logs
  add constraint error_logs_assigned_staff_fkey
  foreign key (assigned_staff) references staff_members (id) on delete set null;
