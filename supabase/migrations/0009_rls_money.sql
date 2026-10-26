create policy orders_read on public.orders
  for select to authenticated
  using (
    customer_id = auth.uid()
    or public.has_role('accountant')
    or public.has_role('director')
    or public.has_role('admin')
    or (warehouse_id is not null and public.is_warehouse_staff(warehouse_id))
  );

create policy orders_customer_insert on public.orders
  for insert to authenticated
  with check (customer_id = auth.uid() and public.has_role('customer'));

create policy orders_staff_update on public.orders
  for update to authenticated
  using (
    public.has_role('accountant')
    or public.has_role('director')
    or (warehouse_id is not null and public.is_warehouse_staff(warehouse_id))
    or customer_id = auth.uid()
  );

create policy payments_read on public.customer_payments
  for select to authenticated
  using (
    public.has_role('accountant')
    or public.has_role('director')
    or public.has_role('admin')
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = auth.uid()
    )
  );

create policy payments_write on public.customer_payments
  for insert to authenticated
  with check (public.has_role('accountant') or public.has_role('admin'));

create policy payments_update on public.customer_payments
  for update to authenticated
  using (public.has_role('accountant') or public.has_role('director') or public.has_role('admin'));

create policy transactions_read on public.transactions
  for select to authenticated
  using (public.has_role('accountant') or public.has_role('director') or public.has_role('admin'));

create policy transactions_write on public.transactions
  for all to authenticated
  using (public.has_role('accountant') or public.has_role('admin'))
  with check (public.has_role('accountant') or public.has_role('admin'));

create policy investments_read on public.investments
  for select to authenticated
  using (
    investor_id = auth.uid()
    or public.has_role('director')
    or public.has_role('accountant')
    or public.has_role('admin')
  );

create policy investments_write on public.investments
  for all to authenticated
  using (public.has_role('accountant') or public.has_role('admin') or public.has_role('director'))
  with check (public.has_role('accountant') or public.has_role('admin') or public.has_role('director'));

create policy returns_read on public.investor_returns
  for select to authenticated
  using (
    investor_id = auth.uid()
    or public.has_role('director')
    or public.has_role('accountant')
    or public.has_role('admin')
  );

create policy returns_write on public.investor_returns
  for insert to authenticated
  with check (public.has_role('accountant') or public.has_role('admin'));

create policy withdrawals_read on public.withdrawal_requests
  for select to authenticated
  using (
    investor_id = auth.uid()
    or public.has_role('director')
    or public.has_role('accountant')
    or public.has_role('admin')
  );

create policy withdrawals_investor_insert on public.withdrawal_requests
  for insert to authenticated
  with check (investor_id = auth.uid() and public.has_role('investor'));

create policy withdrawals_staff_update on public.withdrawal_requests
  for update to authenticated
  using (
    public.has_role('director')
    or public.has_role('accountant')
    or public.has_role('admin')
  );

create policy enquiries_insert_anon on public.investor_enquiries
  for insert to anon, authenticated
  with check (true);

create policy enquiries_read_directors on public.investor_enquiries
  for select to authenticated
  using (public.has_role('director') or public.has_role('admin'));

create policy enquiries_update_directors on public.investor_enquiries
  for update to authenticated
  using (public.has_role('director') or public.has_role('admin'));

create policy notifications_own on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

create policy notifications_own_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy audit_read on public.audit_log
  for select to authenticated
  using (public.has_role('admin') or public.has_role('director'));

-- Audit log is append-only. No update or delete policies on purpose.
