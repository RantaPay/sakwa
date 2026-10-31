create table public.investment_requests (
  id uuid primary key,
  investor_id uuid not null references public.profiles (id),
  amount_kobo bigint not null check (amount_kobo > 0),
  notes text,
  status text not null default 'requested',
  rejection_reason text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint investment_requests_status_check check (
    status in ('requested', 'approved', 'rejected')
  )
);

create trigger investment_requests_updated_at
before update on public.investment_requests
for each row execute function public.set_updated_at();

create index investment_requests_investor_id_idx on public.investment_requests (investor_id);
create index investment_requests_status_idx on public.investment_requests (status);

alter table public.investment_requests enable row level security;

create policy investment_requests_read on public.investment_requests
  for select to authenticated
  using (
    investor_id = auth.uid()
    or public.has_role('director')
    or public.has_role('accountant')
    or public.has_role('admin')
  );

create policy investment_requests_investor_insert on public.investment_requests
  for insert to authenticated
  with check (investor_id = auth.uid() and public.has_role('investor'));

create policy investment_requests_staff_update on public.investment_requests
  for update to authenticated
  using (
    public.has_role('director')
    or public.has_role('accountant')
    or public.has_role('admin')
  );
