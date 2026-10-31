-- A role can open Analytics only when the permission says so.
-- Admin always can. Director and accountant can until an admin turns it off.
-- Any other role can once an admin turns it on.

create or replace function public.can_read_analytics()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and (
        ur.role = 'admin'
        or (
          ur.role in ('director', 'accountant')
          and not exists (
            select 1
            from public.role_permissions rp
            where rp.role = ur.role
              and rp.feature_id = 'analytics'
              and rp.enabled = false
          )
        )
        or exists (
          select 1
          from public.role_permissions rp
          where rp.role = ur.role
            and rp.feature_id = 'analytics'
            and rp.enabled = true
        )
      )
  );
$$;

revoke all on function public.can_read_analytics() from public;
grant execute on function public.can_read_analytics() to authenticated;

create policy analytics_profiles_read on public.profiles
  for select to authenticated
  using (public.can_read_analytics());

create policy analytics_advances_read on public.agent_cash_advances
  for select to authenticated
  using (public.can_read_analytics());

create policy analytics_deliveries_read on public.agent_deliveries
  for select to authenticated
  using (public.can_read_analytics());

create policy analytics_orders_read on public.orders
  for select to authenticated
  using (public.can_read_analytics());

create policy analytics_payments_read on public.customer_payments
  for select to authenticated
  using (public.can_read_analytics());

create policy analytics_transactions_read on public.transactions
  for select to authenticated
  using (public.can_read_analytics());

create policy analytics_investments_read on public.investments
  for select to authenticated
  using (public.can_read_analytics());

create policy analytics_returns_read on public.investor_returns
  for select to authenticated
  using (public.can_read_analytics());

create policy analytics_withdrawals_read on public.withdrawal_requests
  for select to authenticated
  using (public.can_read_analytics());
