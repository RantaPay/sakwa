-- The accountant needs to know who is an investor or agent: the investor_positions
-- view (security_invoker) and the investor/agent pickers filter on user_roles.
-- Without this, weekly returns wrote nothing and the Capital investor list was empty.
drop policy if exists user_roles_read on public.user_roles;
create policy user_roles_read on public.user_roles
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.has_role('admin')
    or public.has_role('director')
    or public.has_role('accountant')
  );
