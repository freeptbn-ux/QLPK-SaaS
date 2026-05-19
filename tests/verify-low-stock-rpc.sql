-- Verify low-stock RPC signature and security

-- 1. Function signature exists
select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as args,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'get_low_stock_medicines';

-- Expected:
-- args includes: p_clinic_id bigint
-- security_definer = true

-- 2. Function body keeps membership check
select pg_get_functiondef('public.get_low_stock_medicines(bigint)'::regprocedure);

-- Expected body contains:
-- auth.uid()
-- public.profiles
-- clinic_id = p_clinic_id
-- is_active = true
-- stock_quantity <= min_stock_level

-- 3. Grants
select grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'get_low_stock_medicines'
order by grantee;

-- Expected:
-- authenticated has EXECUTE
-- anon does not have EXECUTE
