-- Paste into Supabase → SQL Editor after applying migrations
-- 20260525_staff_members.sql and 20260526_sync_staff_members_from_auth.sql

-- Optional legacy seed (D. Mistry, I. Rana, T. Mabuba)
insert into staff_members (id, email, full_name, initials, role)
values
  (
    'aaaaaaaa-0001-0001-0001-000000000001',
    'dhru.mistry@buddylearning.org',
    'Dhru Mistry',
    'D. Mistry',
    'admin'
  ),
  (
    'aaaaaaaa-0001-0001-0001-000000000002',
    'ibrahim.rana@buddylearning.org',
    'Ibrahim Rana',
    'I. Rana',
    'support'
  ),
  (
    'aaaaaaaa-0001-0001-0001-000000000003',
    'thabo.mabuba@buddylearning.org',
    'Thabo Mabuba',
    'T. Mabuba',
    'reviewer'
  )
on conflict (email) do update
  set full_name = excluded.full_name,
      initials = excluded.initials,
      role = excluded.role;

-- Import every user who has already signed up via BuddyAI auth
select public.sync_staff_members_from_auth();
