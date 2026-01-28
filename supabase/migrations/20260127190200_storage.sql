-- Create storage bucket for avatars and backgrounds
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

insert into storage.buckets (id, name, public)
values ('backgrounds', 'backgrounds', true);

-- Storage policies for avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for backgrounds
create policy "Background images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'backgrounds');

create policy "Users can upload their own background"
  on storage.objects for insert
  with check (
    bucket_id = 'backgrounds' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own background"
  on storage.objects for update
  using (
    bucket_id = 'backgrounds' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own background"
  on storage.objects for delete
  using (
    bucket_id = 'backgrounds' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage bucket for link thumbnails
insert into storage.buckets (id, name, public)
values ('link-thumbnails', 'link-thumbnails', true);

-- Storage policies for link thumbnails
create policy "Link thumbnails are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'link-thumbnails');

create policy "Users can upload their own link thumbnails"
  on storage.objects for insert
  with check (
    bucket_id = 'link-thumbnails' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own link thumbnails"
  on storage.objects for update
  using (
    bucket_id = 'link-thumbnails' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own link thumbnails"
  on storage.objects for delete
  using (
    bucket_id = 'link-thumbnails' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
