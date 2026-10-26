create or replace function public.notify_on_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  customer uuid;
begin
  select customer_id into customer from public.orders where id = new.order_id;
  if tg_op = 'INSERT' then
    perform public.notify_users(
      public.role_user_ids('accountant') || public.role_user_ids('director') || array[customer],
      'Payment written in',
      'A customer payment has been written in.',
      'payment_recorded',
      'customer_payments',
      new.id
    );
  elsif new.confirmed_at is distinct from old.confirmed_at and new.confirmed_at is not null then
    perform public.notify_users(
      public.role_user_ids('warehouse') || public.role_user_ids('director') || array[customer],
      'Payment confirmed',
      'A payment has been confirmed. Rice can now be released.',
      'payment_confirmed',
      'customer_payments',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger customer_payments_notify
after insert or update on public.customer_payments
for each row execute function public.notify_on_payment();

create or replace function public.notify_on_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_users(
    public.role_user_ids('admin') || public.role_user_ids('director'),
    'Account created',
    new.full_name || ' was added.',
    'account_created',
    'profiles',
    new.id
  );
  return new;
end;
$$;

create trigger profiles_notify
after insert on public.profiles
for each row execute function public.notify_on_account();
