alter table public.orders
  add column price_per_kg_kobo bigint not null default 0 check (price_per_kg_kobo >= 0);

update public.orders
set price_per_kg_kobo = round(price_per_bag_kobo / kg_per_bag)::bigint
where price_per_bag_kobo > 0
  and kg_per_bag > 0;

create table public.market_prices (
  id uuid primary key,
  buying_price_per_kg_kobo bigint not null check (buying_price_per_kg_kobo > 0),
  selling_price_per_kg_kobo bigint not null check (selling_price_per_kg_kobo > 0),
  effective_on date not null,
  notes text,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index market_prices_effective_on_idx
  on public.market_prices (effective_on desc, created_at desc);

alter table public.market_prices enable row level security;

create policy market_prices_read on public.market_prices
  for select to authenticated
  using (true);

create policy market_prices_admin_insert on public.market_prices
  for insert to authenticated
  with check (public.has_role('admin'));
