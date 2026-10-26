create policy user_roles_self_customer_insert on public.user_roles
  for insert to authenticated
  with check (user_id = auth.uid() and role = 'customer');
