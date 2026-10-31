alter table public.investment_requests
  add column if not exists receipt_url text,
  add column if not exists receipt_filename text,
  add column if not exists receipt_uploaded_at timestamptz,
  add column if not exists confirmed_by uuid references public.profiles (id),
  add column if not exists confirmed_at timestamptz;

alter table public.investment_requests
  drop constraint if exists investment_requests_status_check;

update public.investment_requests
set status = 'confirmed'
where status = 'approved';

alter table public.investment_requests
  add constraint investment_requests_status_check check (
    status in ('requested', 'accepted', 'receipt_sent', 'confirmed', 'rejected')
  );

alter table public.withdrawal_requests
  add column if not exists payout_bank_name text,
  add column if not exists payout_account_name text,
  add column if not exists payout_account_number text,
  add column if not exists receipt_url text,
  add column if not exists receipt_filename text,
  add column if not exists receipt_uploaded_at timestamptz,
  add column if not exists received_by uuid references public.profiles (id),
  add column if not exists received_at timestamptz;

alter table public.withdrawal_requests
  drop constraint if exists withdrawal_requests_status_check;

update public.withdrawal_requests
set status = 'accepted'
where status = 'approved';

alter table public.withdrawal_requests
  add constraint withdrawal_requests_status_check check (
    status in ('requested', 'accepted', 'receipt_sent', 'paid', 'rejected')
  );

create policy investment_requests_investor_update on public.investment_requests
  for update to authenticated
  using (investor_id = auth.uid() and public.has_role('investor'))
  with check (investor_id = auth.uid());

create policy withdrawals_investor_update on public.withdrawal_requests
  for update to authenticated
  using (investor_id = auth.uid() and public.has_role('investor'))
  with check (investor_id = auth.uid());

create or replace view public.investor_positions
with (security_invoker = true) as
select
  p.id as investor_id,
  coalesce(i.capital_kobo, 0)::bigint as capital_kobo,
  coalesce(r.returns_kobo, 0)::bigint as returns_kobo,
  coalesce(w.withdrawn_or_pending_kobo, 0)::bigint as withdrawn_or_pending_kobo,
  greatest(
    coalesce(r.returns_kobo, 0) - coalesce(w.withdrawn_or_pending_kobo, 0),
    0
  )::bigint as withdrawable_kobo
from public.profiles p
left join (
  select investor_id, sum(amount_kobo)::bigint as capital_kobo
  from public.investments
  group by investor_id
) i on i.investor_id = p.id
left join (
  select investor_id, sum(amount_kobo)::bigint as returns_kobo
  from public.investor_returns
  group by investor_id
) r on r.investor_id = p.id
left join (
  select investor_id, sum(amount_kobo)::bigint as withdrawn_or_pending_kobo
  from public.withdrawal_requests
  where status in ('requested', 'accepted', 'receipt_sent', 'paid')
  group by investor_id
) w on w.investor_id = p.id
where exists (
  select 1 from public.user_roles ur
  where ur.user_id = p.id and ur.role = 'investor'
);
