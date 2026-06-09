alter table service_images add column if not exists is_cover boolean not null default false;
alter table event_images   add column if not exists is_cover boolean not null default false;
