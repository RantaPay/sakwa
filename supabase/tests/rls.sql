-- Manual RLS checks. Run against a development project after creating
-- one user per role. These statements should fail for the wrong role.

-- Investor cannot read another investor's capital.
-- set request.jwt.claim.sub = '<other-investor-id>';
-- select * from public.investments; -- expect 0 rows for foreign capital

-- Customer cannot read another customer's orders.
-- select * from public.orders; -- expect only own rows

-- Warehouse staff cannot confirm deliveries for a store they are not assigned to.
-- insert into public.stock_movements (...) -- expect policy error

-- Audit log cannot be updated.
-- update public.audit_log set action = 'insert' where id = id; -- expect policy error

select 1;
