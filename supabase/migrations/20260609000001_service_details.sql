alter table services
  add column if not exists base_price  text,
  add column if not exists duration    text,
  add column if not exists capacity    text,
  add column if not exists space_needed text;

create table if not exists service_features (
  id         uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  emoji      text not null default '✦',
  title      text not null,
  description text not null default '',
  "order"    integer not null default 0,
  created_at timestamptz not null default now()
);

alter table service_features enable row level security;
create policy "public read service_features"  on service_features for select using (true);
create policy "auth write service_features"   on service_features for all    using (auth.role() = 'authenticated');
