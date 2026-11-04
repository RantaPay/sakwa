-- The admin approves a customer order and sends it to a store.
-- People in the house can write a notice to another person. The row is still
-- readable only by the person it is for.

drop policy orders_staff_update on public.orders;

create policy orders_staff_update on public.orders
  for update to authenticated
  using (
    public.has_role('admin')
    or public.has_role('accountant')
    or public.has_role('director')
    or (warehouse_id is not null and public.is_warehouse_staff(warehouse_id))
    or customer_id = auth.uid()
  )
  with check (
    public.has_role('admin')
    or public.has_role('accountant')
    or public.has_role('director')
    or (warehouse_id is not null and public.is_warehouse_staff(warehouse_id))
    or customer_id = auth.uid()
  );

create policy notifications_insert on public.notifications
  for insert to authenticated
  with check (auth.uid() is not null);
