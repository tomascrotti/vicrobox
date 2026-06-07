-- supabase/migrations/20260606000000_schema.sql

create table services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text not null,
  icon        text not null default 'camera',
  color       text not null default '#F07820',
  active      boolean not null default true,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

create table service_images (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references services(id) on delete cascade,
  url         text not null,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

create table events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  event_type  text not null check (event_type in ('casamiento','cumpleaños','corporativo','otro')),
  description text not null default '',
  date        date,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table event_images (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  url         text not null,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

create table event_services (
  event_id    uuid not null references events(id) on delete cascade,
  service_id  uuid not null references services(id) on delete cascade,
  primary key (event_id, service_id)
);

create table settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

-- Seed: configuración inicial
insert into settings (key, value) values
  ('whatsapp_number', '5491100000000'),
  ('active_theme',    'default');

-- Seed: primer servicio
insert into services (name, slug, description, icon, color, active, "order") values
  (
    'Fotocabina',
    'fotocabina',
    'Capturá los mejores momentos con nuestra cabina fotográfica profesional de alta resolución y accesorios divertidos.',
    'camera',
    '#F07820',
    true,
    0
  );
