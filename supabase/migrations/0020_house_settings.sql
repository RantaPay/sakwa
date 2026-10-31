create table public.house_settings (
  id text primary key,
  weekly_interest_bps integer not null default 0 check (
    weekly_interest_bps >= 0 and weekly_interest_bps <= 10000
  ),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  constraint house_settings_id_check check (id = 'house')
);

insert into public.house_settings (id, weekly_interest_bps)
values ('house', 0);

alter table public.house_settings enable row level security;

create policy house_settings_read on public.house_settings
  for select to authenticated
  using (true);

create policy house_settings_admin_insert on public.house_settings
  for insert to authenticated
  with check (public.has_role('admin'));

create policy house_settings_admin_update on public.house_settings
  for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));
