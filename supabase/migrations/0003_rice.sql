create table public.agent_cash_advances (
  id uuid primary key,
  agent_id uuid not null references public.profiles (id),
  amount_kobo bigint not null check (amount_kobo > 0),
  advanced_on date not null,
  notes text,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_deliveries (
  id uuid primary key,
  agent_id uuid not null references public.profiles (id),
  warehouse_id uuid not null references public.warehouses (id),
  bag_count integer not null check (bag_count > 0),
  kg_per_bag numeric(12, 3) not null check (kg_per_bag > 0),
  amount_spent_kobo bigint not null check (amount_spent_kobo > 0),
  delivered_on date not null,
  notes text,
  status text not null default 'pending',
  rejection_reason text,
  confirmed_by uuid references public.profiles (id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_deliveries_status_check check (status in ('pending', 'confirmed', 'rejected'))
);

create table public.stock_movements (
  id uuid primary key,
  warehouse_id uuid not null references public.warehouses (id),
  direction text not null,
  bag_count integer not null check (bag_count > 0),
  total_kg numeric(14, 3) not null check (total_kg > 0),
  delivery_id uuid references public.agent_deliveries (id),
  order_id uuid,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint stock_movements_direction_check check (direction in ('in', 'out'))
);

create trigger agent_cash_advances_updated_at
before update on public.agent_cash_advances
for each row execute function public.set_updated_at();

create trigger agent_deliveries_updated_at
before update on public.agent_deliveries
for each row execute function public.set_updated_at();

create index agent_cash_advances_agent_id_idx on public.agent_cash_advances (agent_id);
create index agent_deliveries_agent_id_idx on public.agent_deliveries (agent_id);
create index agent_deliveries_warehouse_id_idx on public.agent_deliveries (warehouse_id);
create index stock_movements_warehouse_id_idx on public.stock_movements (warehouse_id);
