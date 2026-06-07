-- supabase/migrations/20260606000002_storage.sql

insert into storage.buckets (id, name, public) values
  ('services-images', 'services-images', true),
  ('events-images',   'events-images',   true);

-- Lectura pública
create policy "public_read_services_images" on storage.objects
  for select using (bucket_id = 'services-images');

create policy "public_read_events_images" on storage.objects
  for select using (bucket_id = 'events-images');

-- Upload solo autenticados
create policy "auth_upload_services_images" on storage.objects
  for insert with check (bucket_id = 'services-images' and auth.role() = 'authenticated');

create policy "auth_upload_events_images" on storage.objects
  for insert with check (bucket_id = 'events-images' and auth.role() = 'authenticated');

-- Delete solo autenticados
create policy "auth_delete_services_images" on storage.objects
  for delete using (bucket_id = 'services-images' and auth.role() = 'authenticated');

create policy "auth_delete_events_images" on storage.objects
  for delete using (bucket_id = 'events-images' and auth.role() = 'authenticated');
