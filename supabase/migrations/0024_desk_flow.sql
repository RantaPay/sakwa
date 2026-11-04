-- Admin pay requests, store counts, and customer order checks.
-- Existing cash rows stay paid. Existing orders stay unpaid until a customer chooses.

alter table public.agent_cash_advances
  add column warehouse_id uuid references public.warehouses (id),
  add column purpose text,
  add column expected_bag_count integer,
  add column expected_kg numeric,
  add column status text not null default 'paid',
  add column requested_by uuid,
  add column paid_by uuid,
  add column paid_at timestamptz;

alter table public.agent_cash_advances
  add constraint agent_cash_advances_status_check check (status in ('requested', 'paid'));

alter table public.agent_deliveries
  add column advance_id uuid references public.agent_cash_advances (id),
  add column bags_received integer,
  add column bags_damaged integer not null default 0;

alter table public.orders drop constraint orders_status_check;

alter table public.orders
  add constraint orders_status_check check (
    status in (
      'placed',
      'approved',
      'payment_recorded',
      'payment_confirmed',
      'dispatched',
      'delivered'
    )
  );

alter table public.orders
  add column payment_choice text not null default 'unpaid',
  add column approved_by uuid,
  add column approved_at timestamptz,
  add column released_bag_count integer,
  add column released_to text,
  add column released_by uuid,
  add column received_bag_count integer,
  add column received_at timestamptz;

alter table public.orders
  add constraint orders_payment_choice_check check (payment_choice in ('paid', 'unpaid'));
