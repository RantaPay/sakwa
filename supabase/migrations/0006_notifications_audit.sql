create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null,
  entity_table text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id uuid not null,
  action text not null,
  actor_id uuid,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now(),
  constraint audit_log_action_check check (action in ('insert', 'update', 'delete'))
);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);
create index audit_log_row_idx on public.audit_log (table_name, row_id, created_at desc);

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_uuid uuid;
begin
  if tg_op = 'INSERT' then
    row_uuid := new.id;
    insert into public.audit_log (table_name, row_id, action, actor_id, after_value)
    values (tg_table_name, row_uuid, 'insert', auth.uid(), to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    row_uuid := new.id;
    insert into public.audit_log (table_name, row_id, action, actor_id, before_value, after_value)
    values (tg_table_name, row_uuid, 'update', auth.uid(), to_jsonb(old), to_jsonb(new));
    return new;
  else
    row_uuid := old.id;
    insert into public.audit_log (table_name, row_id, action, actor_id, before_value)
    values (tg_table_name, row_uuid, 'delete', auth.uid(), to_jsonb(old));
    return old;
  end if;
end;
$$;

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
    'investor_enquiries'
  ]
  loop
    execute format(
      'create trigger %I_audit after insert or update or delete on public.%I
       for each row execute function public.write_audit_log()',
      t, t
    );
  end loop;
end;
$$;
