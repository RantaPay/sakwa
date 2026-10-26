create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  email text not null unique,
  is_active boolean not null default true,
  primary_role text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_primary_role_check check (
    primary_role in ('admin', 'director', 'accountant', 'warehouse', 'agent', 'investor', 'customer')
  )
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  unique (user_id, role),
  constraint user_roles_role_check check (
    role in ('admin', 'director', 'accountant', 'warehouse', 'agent', 'investor', 'customer')
  )
);

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.warehouse_staff (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (warehouse_id, user_id)
);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger warehouses_updated_at
before update on public.warehouses
for each row execute function public.set_updated_at();

create index user_roles_user_id_idx on public.user_roles (user_id);
create index warehouse_staff_user_id_idx on public.warehouse_staff (user_id);
