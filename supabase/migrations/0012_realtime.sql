alter table public.profiles replica identity full;
alter table public.user_roles replica identity full;
alter table public.warehouses replica identity full;
alter table public.warehouse_staff replica identity full;
alter table public.agent_cash_advances replica identity full;
alter table public.agent_deliveries replica identity full;
alter table public.stock_movements replica identity full;
alter table public.orders replica identity full;
alter table public.customer_payments replica identity full;
alter table public.transactions replica identity full;
alter table public.investments replica identity full;
alter table public.investor_returns replica identity full;
alter table public.withdrawal_requests replica identity full;
alter table public.investor_enquiries replica identity full;
alter table public.notifications replica identity full;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles',
    'user_roles',
    'warehouses',
    'warehouse_staff',
    'agent_cash_advances',
    'agent_deliveries',
    'stock_movements',
    'orders',
    'customer_payments',
    'transactions',
    'investments',
    'investor_returns',
    'withdrawal_requests',
    'investor_enquiries',
    'notifications'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception
      when duplicate_object then null;
    end;
  end loop;
end;
$$;
