-- The delivery notice used to say "field buyer". People in that role are agents.

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
      'An agent recorded a delivery that is waiting for confirmation.',
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
