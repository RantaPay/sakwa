create table public.orders (
  id uuid primary key,
  customer_id uuid not null references public.profiles (id),
  warehouse_id uuid references public.warehouses (id),
  bag_count integer not null check (bag_count > 0),
  kg_per_bag numeric(12, 3) not null check (kg_per_bag > 0),
  price_per_bag_kobo bigint not null default 0 check (price_per_bag_kobo >= 0),
  status text not null default 'placed',
  delivery_details text not null,
  notes text,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (
    status in ('placed', 'payment_recorded', 'payment_confirmed', 'dispatched', 'delivered')
  )
);

alter table public.stock_movements
  add constraint stock_movements_order_id_fkey
  foreign key (order_id) references public.orders (id);

create table public.customer_payments (
  id uuid primary key,
  order_id uuid not null references public.orders (id),
  amount_kobo bigint not null check (amount_kobo > 0),
  recorded_by uuid not null references public.profiles (id),
  confirmed_by uuid references public.profiles (id),
  confirmed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key,
  direction text not null,
  amount_kobo bigint not null check (amount_kobo > 0),
  occurred_on date not null,
  category text not null,
  description text not null,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_direction_check check (direction in ('incoming', 'outgoing'))
);

create trigger orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger customer_payments_updated_at
before update on public.customer_payments
for each row execute function public.set_updated_at();

create trigger transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

create index orders_customer_id_idx on public.orders (customer_id);
create index customer_payments_order_id_idx on public.customer_payments (order_id);
create index transactions_occurred_on_idx on public.transactions (occurred_on);
