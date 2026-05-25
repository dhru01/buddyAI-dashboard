-- Staff profile avatar uploads (Settings → Account)

insert into storage.buckets (id, name, public)
values ('staff-avatars', 'staff-avatars', true)
on conflict (id) do nothing;

create policy "Staff avatars are publicly readable"
on storage.objects for select
using (bucket_id = 'staff-avatars');

create policy "Staff can upload own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'staff-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Staff can update own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'staff-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Staff can delete own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'staff-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
