alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.warehouses enable row level security;
alter table public.warehouse_staff enable row level security;
alter table public.agent_cash_advances enable row level security;
alter table public.agent_deliveries enable row level security;
alter table public.stock_movements enable row level security;
alter table public.orders enable row level security;
alter table public.customer_payments enable row level security;
alter table public.transactions enable row level security;
alter table public.investments enable row level security;
alter table public.investor_returns enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.investor_enquiries enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_self_or_staff on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.has_role('admin')
    or public.has_role('director')
    or public.has_role('accountant')
  );

create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.has_role('admin'))
  with check (id = auth.uid() or public.has_role('admin'));

create policy profiles_admin_insert on public.profiles
  for insert to authenticated
  with check (public.has_role('admin') or id = auth.uid());

create policy user_roles_read on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role('admin') or public.has_role('director'));

create policy user_roles_admin on public.user_roles
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy warehouses_read on public.warehouses
  for select to authenticated
  using (true);

create policy warehouses_admin on public.warehouses
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy warehouse_staff_read on public.warehouse_staff
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.has_role('admin')
    or public.has_role('director')
  );

create policy warehouse_staff_admin on public.warehouse_staff
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy advances_read on public.agent_cash_advances
  for select to authenticated
  using (
    agent_id = auth.uid()
    or public.has_role('accountant')
    or public.has_role('director')
    or public.has_role('admin')
  );

create policy advances_write on public.agent_cash_advances
  for insert to authenticated
  with check (public.has_role('accountant') or public.has_role('admin'));

create policy advances_update on public.agent_cash_advances
  for update to authenticated
  using (public.has_role('accountant') or public.has_role('admin'));

create policy deliveries_read on public.agent_deliveries
  for select to authenticated
  using (
    agent_id = auth.uid()
    or public.is_warehouse_staff(warehouse_id)
    or public.has_role('director')
    or public.has_role('accountant')
    or public.has_role('admin')
  );

create policy deliveries_agent_write on public.agent_deliveries
  for insert to authenticated
  with check (agent_id = auth.uid() and public.has_role('agent'));

create policy deliveries_agent_update on public.agent_deliveries
  for update to authenticated
  using (agent_id = auth.uid() or public.is_warehouse_staff(warehouse_id) or public.has_role('director'));

create policy stock_read on public.stock_movements
  for select to authenticated
  using (
    public.is_warehouse_staff(warehouse_id)
    or public.has_role('director')
    or public.has_role('accountant')
    or public.has_role('admin')
  );

create policy stock_write on public.stock_movements
  for insert to authenticated
  with check (
    public.is_warehouse_staff(warehouse_id)
    or public.has_role('director')
  );
