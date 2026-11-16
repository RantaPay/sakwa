-- Per-store rates, hand-entered and imported trade lines, and the kilogram rule.

alter table public.house_settings
  add column default_kg_per_bag numeric not null default 50
    check (default_kg_per_bag > 0);

create table public.warehouse_prices (
  id uuid primary key,
  warehouse_id uuid not null references public.warehouses (id),
  buying_price_per_kg_kobo bigint not null check (buying_price_per_kg_kobo > 0),
  selling_price_per_kg_kobo bigint not null check (selling_price_per_kg_kobo > 0),
  effective_on date not null,
  notes text,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (warehouse_id, effective_on)
);

create table public.store_entries (
  id uuid primary key,
  warehouse_id uuid not null references public.warehouses (id),
  entry_on date not null,
  bags_sold integer check (bags_sold is null or bags_sold >= 0),
  kg_sold numeric check (kg_sold is null or kg_sold >= 0),
  bags_bought integer check (bags_bought is null or bags_bought >= 0),
  kg_bought numeric check (kg_bought is null or kg_bought >= 0),
  source text not null check (source in ('manual', 'import')),
  fingerprint text,
  buying_price_per_kg_kobo bigint not null,
  selling_price_per_kg_kobo bigint not null,
  sales_kobo bigint not null,
  expense_kobo bigint not null,
  profit_kobo bigint not null,
  notes text,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create unique index store_entries_fingerprint_key
  on public.store_entries (fingerprint)
  where fingerprint is not null;

create table public.import_layouts (
  id uuid primary key,
  signature text not null unique,
  mapping jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.warehouse_prices enable row level security;
alter table public.store_entries enable row level security;
alter table public.import_layouts enable row level security;

create policy warehouse_prices_read on public.warehouse_prices
  for select to authenticated using (true);

create policy warehouse_prices_write on public.warehouse_prices
  for all to authenticated
  using (public.has_role('admin') or public.has_role('accountant'))
  with check (public.has_role('admin') or public.has_role('accountant'));

create policy store_entries_read on public.store_entries
  for select to authenticated using (true);

create policy store_entries_write on public.store_entries
  for all to authenticated
  using (public.has_role('admin') or public.has_role('accountant'))
  with check (public.has_role('admin') or public.has_role('accountant'));

create policy import_layouts_read on public.import_layouts
  for select to authenticated using (true);

create policy import_layouts_write on public.import_layouts
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

grant select, insert, update, delete on public.warehouse_prices to authenticated;
grant select, insert, update, delete on public.store_entries to authenticated;
grant select, insert, update, delete on public.import_layouts to authenticated;
