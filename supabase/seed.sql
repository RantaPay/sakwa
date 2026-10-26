-- Demo seed for local and development projects.
-- Creates one sign-in per role. Password for every account: SakwaDemo2026!
-- See demo.md.

create extension if not exists pgcrypto;

insert into public.warehouses (id, name, location)
values
  ('11111111-1111-1111-1111-111111111111', 'Main store', '[Warehouse location 1]'),
  ('22222222-2222-2222-2222-222222222222', 'Second store', '[Warehouse location 2]')
on conflict (id) do nothing;

do $$
declare
  demo_password text := crypt('SakwaDemo2026!', gen_salt('bf'));
  rec record;
begin
  for rec in
    select *
    from (
      values
        (
          'a0000000-0000-4000-8000-000000000001'::uuid,
          'admin@sakwaagro.com',
          'Demo Admin',
          '08000000001',
          'admin'
        ),
        (
          'a0000000-0000-4000-8000-000000000002'::uuid,
          'director@sakwaagro.com',
          'Demo Director',
          '08000000002',
          'director'
        ),
        (
          'a0000000-0000-4000-8000-000000000003'::uuid,
          'accountant@sakwaagro.com',
          'Demo Accountant',
          '08000000003',
          'accountant'
        ),
        (
          'a0000000-0000-4000-8000-000000000004'::uuid,
          'store@sakwaagro.com',
          'Demo Store',
          '08000000004',
          'warehouse'
        ),
        (
          'a0000000-0000-4000-8000-000000000005'::uuid,
          'buyer@sakwaagro.com',
          'Demo Field Buyer',
          '08000000005',
          'agent'
        ),
        (
          'a0000000-0000-4000-8000-000000000006'::uuid,
          'investor@sakwaagro.com',
          'Demo Investor',
          '08000000006',
          'investor'
        ),
        (
          'a0000000-0000-4000-8000-000000000007'::uuid,
          'customer@sakwaagro.com',
          'Demo Customer',
          '08000000007',
          'customer'
        )
    ) as t(id, email, full_name, phone, role)
  loop
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      rec.id,
      'authenticated',
      'authenticated',
      rec.email,
      demo_password,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    on conflict (id) do nothing;

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      rec.id,
      rec.id,
      jsonb_build_object('sub', rec.id::text, 'email', rec.email),
      'email',
      rec.id::text,
      now(),
      now(),
      now()
    )
    on conflict (provider, provider_id) do nothing;

    insert into public.profiles (id, full_name, phone, email, primary_role)
    values (rec.id, rec.full_name, rec.phone, rec.email, rec.role)
    on conflict (id) do nothing;

    insert into public.user_roles (user_id, role)
    values (rec.id, rec.role)
    on conflict (user_id, role) do nothing;
  end loop;
end;
$$;

insert into public.warehouse_staff (warehouse_id, user_id)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'a0000000-0000-4000-8000-000000000004'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'a0000000-0000-4000-8000-000000000004'
  )
on conflict (warehouse_id, user_id) do nothing;
