-- Money put into the business that is not an investor's capital.
-- It counts in the house books and does not earn investor interest.

create table public.house_capital (
  id uuid primary key,
  kind text not null,
  amount_kobo bigint not null check (amount_kobo > 0),
  invested_on date not null,
  notes text,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint house_capital_kind_check check (kind in ('initial', 'other'))
);

alter table public.house_capital enable row level security;

create policy house_capital_read on public.house_capital
  for select to authenticated
  using (
    public.has_role('admin')
    or public.has_role('accountant')
    or public.has_role('director')
  );

create policy house_capital_write on public.house_capital
  for all to authenticated
  using (public.has_role('admin') or public.has_role('accountant'))
  with check (public.has_role('admin') or public.has_role('accountant'));

grant select, insert, update, delete on public.house_capital to authenticated;

alter table public.house_capital replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.house_capital;
exception
  when duplicate_object then null;
end;
$$;
