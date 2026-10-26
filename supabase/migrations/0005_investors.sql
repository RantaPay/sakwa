create table public.investments (
  id uuid primary key,
  investor_id uuid not null references public.profiles (id),
  amount_kobo bigint not null check (amount_kobo > 0),
  invested_on date not null,
  notes text,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investor_returns (
  id uuid primary key,
  investor_id uuid not null references public.profiles (id),
  cycle_start date not null,
  cycle_end date not null,
  amount_kobo bigint not null check (amount_kobo >= 0),
  formula_kind text not null,
  created_at timestamptz not null default now(),
  unique (investor_id, cycle_start)
);

create table public.withdrawal_requests (
  id uuid primary key,
  investor_id uuid not null references public.profiles (id),
  amount_kobo bigint not null check (amount_kobo > 0),
  cycle_start date not null,
  status text not null default 'requested',
  rejection_reason text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  paid_by uuid references public.profiles (id),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint withdrawal_requests_status_check check (
    status in ('requested', 'approved', 'rejected', 'paid')
  )
);

create unique index withdrawal_one_per_cycle
  on public.withdrawal_requests (investor_id, cycle_start)
  where status in ('requested', 'approved', 'paid');

create table public.investor_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  intended_amount_naira text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint investor_enquiries_status_check check (status in ('new', 'contacted', 'closed'))
);

create trigger investments_updated_at
before update on public.investments
for each row execute function public.set_updated_at();

create trigger withdrawal_requests_updated_at
before update on public.withdrawal_requests
for each row execute function public.set_updated_at();

create trigger investor_enquiries_updated_at
before update on public.investor_enquiries
for each row execute function public.set_updated_at();

create index investments_investor_id_idx on public.investments (investor_id);
create index withdrawal_requests_investor_id_idx on public.withdrawal_requests (investor_id);
