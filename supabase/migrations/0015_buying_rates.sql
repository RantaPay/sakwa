create table public.buying_rates (
  id uuid primary key,
  price_per_bag_kobo bigint not null check (price_per_bag_kobo > 0),
  effective_on date not null,
  notes text,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index buying_rates_effective_on_idx on public.buying_rates (effective_on desc);

alter table public.buying_rates enable row level security;

create policy buying_rates_read on public.buying_rates
  for select to authenticated
  using (true);

create policy buying_rates_write on public.buying_rates
  for insert to authenticated
  with check (public.has_role('director') or public.has_role('admin'));
