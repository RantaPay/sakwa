-- Publish the remaining tables that dashboard figures read, so prices,
-- settings, rates, requests, permissions, and history update live too.

do $$
declare
  t text;
begin
  foreach t in array array[
    'market_prices',
    'house_settings',
    'buying_rates',
    'investment_requests',
    'role_permissions',
    'audit_log'
  ]
  loop
    execute format('alter table public.%I replica identity full', t);
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception
      when duplicate_object then null;
    end;
  end loop;
end;
$$;
