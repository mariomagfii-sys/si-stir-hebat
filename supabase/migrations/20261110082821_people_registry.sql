begin;

-- Minimal school registry, not an Auth-user creation or role-management API.
create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{1,30}$'),
  name text not null check (char_length(btrim(name)) between 1 and 120 and name ~ '[^[:space:]]'),
  is_active boolean not null default true,
  profile_id uuid unique references public.profiles(id),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.students (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{1,30}$'),
  name text not null check (char_length(btrim(name)) between 1 and 120 and name ~ '[^[:space:]]'),
  is_active boolean not null default true,
  profile_id uuid unique references public.profiles(id),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);
create index teachers_created_by_idx on public.teachers(created_by);
create index students_created_by_idx on public.students(created_by);

do $$
declare registry text; self_role text;
begin
  foreach registry in array array['teachers','students'] loop
    self_role := case registry when 'teachers' then 'teacher' else 'student' end;
    execute format('alter table public.%I enable row level security', registry);
    execute format('revoke all on public.%I from public, anon, authenticated', registry);
    execute format('grant select on public.%I to authenticated', registry);
    -- Client operators may edit school records but cannot link Auth identities,
    -- forge creation metadata, change account roles, or claim another account.
    execute format('grant insert (code,name,is_active), update (code,name,is_active) on public.%I to authenticated', registry);
    execute format('create policy people_read on public.%I for select to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (p.role in (''administrator'',''principal'') or (p.role = %L and profile_id = (select auth.uid())))))', registry, self_role);
    execute format('create policy people_insert on public.%I for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = ''administrator''))', registry);
    execute format('create policy people_update on public.%I for update to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = ''administrator'')) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = ''administrator''))', registry);
  end loop;
end;
$$;

commit;
