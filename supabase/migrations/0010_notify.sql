create or replace function public.notify_users(
  user_ids uuid[],
  title text,
  body text,
  kind text,
  entity_table text default null,
  entity_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, body, kind, entity_table, entity_id)
  select unnest(user_ids), title, body, kind, entity_table, entity_id
  where array_length(user_ids, 1) is not null;
end;
$$;

create or replace function public.role_user_ids(check_role text)
returns uuid[]
language sql
stable
as $$
  select coalesce(array_agg(user_id), '{}')
  from public.user_roles
  where role = check_role;
$$;

create or replace function public.notify_on_delivery()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify_users(
      public.role_user_ids('director') || public.role_user_ids('warehouse'),
      'Delivery recorded',
      'A field buyer recorded a delivery that is waiting for confirmation.',
      'delivery_recorded',
      'agent_deliveries',
      new.id
    );
  elsif new.status is distinct from old.status then
    perform public.notify_users(
      array[new.agent_id] || public.role_user_ids('director'),
      case when new.status = 'confirmed' then 'Delivery confirmed' else 'Delivery turned down' end,
      case
        when new.status = 'confirmed' then 'Your delivery has been confirmed and is now on the books.'
        else coalesce(new.rejection_reason, 'Your delivery was turned down.')
      end,
      case when new.status = 'confirmed' then 'delivery_confirmed' else 'delivery_rejected' end,
      'agent_deliveries',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger agent_deliveries_notify
after insert or update on public.agent_deliveries
for each row execute function public.notify_on_delivery();

create or replace function public.notify_on_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify_users(
      public.role_user_ids('accountant') || public.role_user_ids('director'),
      'Order placed',
      'A customer placed an order.',
      'order_placed',
      'orders',
      new.id
    );
  elsif new.status is distinct from old.status then
    perform public.notify_users(
      array[new.customer_id] || public.role_user_ids('director'),
      'Order updated',
      'An order status changed to ' || replace(new.status, '_', ' ') || '.',
      'order_' || new.status,
      'orders',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger orders_notify
after insert or update on public.orders
for each row execute function public.notify_on_order();

create or replace function public.notify_on_withdrawal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify_users(
      public.role_user_ids('director'),
      'Profit request',
      'An investor asked to take out profit.',
      'withdrawal_requested',
      'withdrawal_requests',
      new.id
    );
  elsif new.status is distinct from old.status then
    perform public.notify_users(
      array[new.investor_id],
      'Profit request updated',
      'Your profit request is now ' || new.status || '.',
      'withdrawal_' || new.status,
      'withdrawal_requests',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger withdrawals_notify
after insert or update on public.withdrawal_requests
for each row execute function public.notify_on_withdrawal();

create or replace function public.notify_on_enquiry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_users(
    public.role_user_ids('director'),
    'Investor enquiry',
    new.name || ' sent an enquiry.',
    'enquiry_received',
    'investor_enquiries',
    new.id
  );
  return new;
end;
$$;

create trigger enquiries_notify
after insert on public.investor_enquiries
for each row execute function public.notify_on_enquiry();
