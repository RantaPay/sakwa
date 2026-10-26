create or replace view public.agent_balances
with (security_invoker = true) as
select
  p.id as agent_id,
  coalesce(a.advanced_kobo, 0)::bigint as advanced_kobo,
  coalesce(d.spent_kobo, 0)::bigint as spent_kobo,
  (coalesce(a.advanced_kobo, 0) - coalesce(d.spent_kobo, 0))::bigint as balance_kobo
from public.profiles p
left join (
  select agent_id, sum(amount_kobo)::bigint as advanced_kobo
  from public.agent_cash_advances
  group by agent_id
) a on a.agent_id = p.id
left join (
  select agent_id, sum(amount_spent_kobo)::bigint as spent_kobo
  from public.agent_deliveries
  where status = 'confirmed'
  group by agent_id
) d on d.agent_id = p.id
where exists (
  select 1 from public.user_roles r
  where r.user_id = p.id and r.role = 'agent'
);

create or replace view public.warehouse_stock
with (security_invoker = true) as
select
  w.id as warehouse_id,
  coalesce(sum(case when m.direction = 'in' then m.bag_count else 0 end), 0) as bags_in,
  coalesce(sum(case when m.direction = 'out' then m.bag_count else 0 end), 0) as bags_out,
  coalesce(sum(case when m.direction = 'in' then m.bag_count else -m.bag_count end), 0) as bags_on_hand,
  coalesce(sum(case when m.direction = 'in' then m.total_kg else 0 end), 0)::numeric as kg_in,
  coalesce(sum(case when m.direction = 'out' then m.total_kg else 0 end), 0)::numeric as kg_out,
  coalesce(sum(case when m.direction = 'in' then m.total_kg else -m.total_kg end), 0)::numeric as kg_on_hand
from public.warehouses w
left join public.stock_movements m on m.warehouse_id = w.id
group by w.id;

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
  where status in ('requested', 'approved', 'paid')
  group by investor_id
) w on w.investor_id = p.id
where exists (
  select 1 from public.user_roles ur
  where ur.user_id = p.id and ur.role = 'investor'
);
