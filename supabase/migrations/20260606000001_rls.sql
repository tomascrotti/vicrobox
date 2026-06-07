-- supabase/migrations/20260606000001_rls.sql

alter table services       enable row level security;
alter table service_images enable row level security;
alter table events         enable row level security;
alter table event_images   enable row level security;
alter table event_services enable row level security;
alter table settings       enable row level security;

-- Lectura pública para el sitio
create policy "public_read_services"       on services       for select using (true);
create policy "public_read_service_images" on service_images for select using (true);
create policy "public_read_events"         on events         for select using (true);
create policy "public_read_event_images"   on event_images   for select using (true);
create policy "public_read_event_services" on event_services for select using (true);
create policy "public_read_settings"       on settings       for select using (true);

-- Escritura solo para usuarios autenticados (admin)
create policy "auth_manage_services"       on services       for all using (auth.role() = 'authenticated');
create policy "auth_manage_service_images" on service_images for all using (auth.role() = 'authenticated');
create policy "auth_manage_events"         on events         for all using (auth.role() = 'authenticated');
create policy "auth_manage_event_images"   on event_images   for all using (auth.role() = 'authenticated');
create policy "auth_manage_event_services" on event_services for all using (auth.role() = 'authenticated');
create policy "auth_manage_settings"       on settings       for all using (auth.role() = 'authenticated');
