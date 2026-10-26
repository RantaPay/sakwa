-- Removes the seven local demo accounts and rows they own.
-- Does not touch production. Run: pnpm demo:clear

begin;

create temporary table demo_ids (id uuid primary key) on commit drop;

insert into demo_ids (id)
values
  ('a0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000002'),
  ('a0000000-0000-4000-8000-000000000003'),
  ('a0000000-0000-4000-8000-000000000004'),
  ('a0000000-0000-4000-8000-000000000005'),
  ('a0000000-0000-4000-8000-000000000006'),
  ('a0000000-0000-4000-8000-000000000007');

delete from public.customer_payments
where recorded_by in (select id from demo_ids)
   or confirmed_by in (select id from demo_ids)
   or order_id in (select id from public.orders where customer_id in (select id from demo_ids));

delete from public.stock_movements
where recorded_by in (select id from demo_ids)
   or delivery_id in (select id from public.agent_deliveries where agent_id in (select id from demo_ids) or confirmed_by in (select id from demo_ids))
   or order_id in (select id from public.orders where customer_id in (select id from demo_ids));

delete from public.agent_deliveries
where agent_id in (select id from demo_ids)
   or confirmed_by in (select id from demo_ids);

delete from public.agent_cash_advances
where agent_id in (select id from demo_ids)
   or recorded_by in (select id from demo_ids);

delete from public.withdrawal_requests
where investor_id in (select id from demo_ids)
   or reviewed_by in (select id from demo_ids)
   or paid_by in (select id from demo_ids);

delete from public.investor_returns
where investor_id in (select id from demo_ids);

delete from public.investments
where investor_id in (select id from demo_ids)
   or recorded_by in (select id from demo_ids);

delete from public.transactions
where recorded_by in (select id from demo_ids);

delete from public.orders
where customer_id in (select id from demo_ids);

delete from public.warehouse_staff
where user_id in (select id from demo_ids);

delete from public.notifications
where user_id in (select id from demo_ids);

delete from public.user_roles
where user_id in (select id from demo_ids);

delete from public.audit_log
where actor_id in (select id from demo_ids)
   or row_id in (select id from demo_ids);

delete from public.profiles
where id in (select id from demo_ids);

delete from auth.identities
where user_id in (select id from demo_ids);

delete from auth.users
where id in (select id from demo_ids);

commit;
