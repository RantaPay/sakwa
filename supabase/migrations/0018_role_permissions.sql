create table public.role_permissions (
  id text primary key,
  role text not null,
  feature_id text not null,
  enabled boolean not null,
  updated_at timestamptz not null default now(),
  unique (role, feature_id),
  constraint role_permissions_role_check check (
    role in ('director', 'accountant', 'warehouse', 'agent', 'investor', 'customer')
  )
);

create index role_permissions_role_idx on public.role_permissions (role);

alter table public.role_permissions enable row level security;

create policy role_permissions_read on public.role_permissions
  for select to authenticated
  using (true);

create policy role_permissions_admin_insert on public.role_permissions
  for insert to authenticated
  with check (public.has_role('admin'));

create policy role_permissions_admin_update on public.role_permissions
  for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy role_permissions_admin_delete on public.role_permissions
  for delete to authenticated
  using (public.has_role('admin'));
