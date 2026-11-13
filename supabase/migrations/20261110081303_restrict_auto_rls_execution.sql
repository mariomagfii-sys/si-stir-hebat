begin;
-- Supabase may install this event-trigger function with default PUBLIC execute.
-- Preserve its body and event trigger; restrict only client execution grants.
-- A fresh local database without the managed function needs no change.
do $$
begin
  if exists (
    select 1 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
      and p.pronargs = 0 and p.prorettype = 'pg_catalog.event_trigger'::regtype
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
commit;
