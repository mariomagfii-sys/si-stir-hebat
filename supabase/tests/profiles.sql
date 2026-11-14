-- Run against a development Supabase database after applying migrations.
-- Every fixture and change is rolled back.
begin;
insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');

do $$
begin
  if (select count(*) from public.profiles where id in (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222') and role = 'pending') <> 2 then
    raise exception 'New users must receive pending profiles';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

do $$
declare affected integer;
begin
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'Users must only see their own profile';
  end if;
  update public.profiles set full_name = 'Nama Uji'
    where id = '11111111-1111-4111-8111-111111111111';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Own name update failed'; end if;

  update public.profiles set full_name = 'Tidak diizinkan'
    where id = '22222222-2222-4222-8222-222222222222';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Another profile was modified'; end if;

  begin
    update public.profiles set role = 'administrator'
      where id = '11111111-1111-4111-8111-111111111111';
    raise exception 'Role escalation was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.profiles where id = '11111111-1111-4111-8111-111111111111';
    raise exception 'Profile deletion was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.profiles (id) values ('33333333-3333-4333-8333-333333333333');
    raise exception 'Profile insertion was allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

set local role anon;
do $$
begin
  begin
    perform * from public.profiles;
    raise exception 'Anonymous profile access was allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;
rollback;
