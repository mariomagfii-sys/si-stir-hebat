begin;

create table public.school_settings (
  id boolean primary key default true check (id),
  name text not null check (char_length(btrim(name)) between 1 and 160 and name ~ '[^[:space:]]'),
  npsn text not null default '' check (npsn = '' or npsn ~ '^[0-9]{8}$'),
  address text not null default '' check (char_length(address) <= 500),
  created_at timestamptz not null default now()
);
create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) between 1 and 40 and name ~ '[^[:space:]]'),
  starts_on date not null,
  ends_on date not null check (ends_on > starts_on),
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index academic_year_one_active on public.academic_years (is_active) where is_active;
create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id),
  number smallint not null check (number in (1, 2)),
  starts_on date not null,
  ends_on date not null check (ends_on > starts_on),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (academic_year_id, number)
);
create unique index semester_one_active_per_year on public.semesters (academic_year_id) where is_active;
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{1,20}$'),
  name text not null check (char_length(btrim(name)) between 1 and 120 and name ~ '[^[:space:]]'),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.school_classes (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id),
  name text not null check (char_length(btrim(name)) between 1 and 60 and name ~ '[^[:space:]]'),
  grade smallint not null check (grade between 1 and 6),
  capacity smallint not null check (capacity between 1 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (academic_year_id, name)
);

-- Semester dates must fit their parent year. Locking the year serializes
-- semester creation against updates to its calendar.
create function public.check_semester_dates() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare year_start date; year_end date;
begin
  select starts_on, ends_on into year_start, year_end
    from public.academic_years where id = new.academic_year_id for share;
  if year_start is null or new.starts_on < year_start or new.ends_on > year_end then
    raise exception 'Semester dates must fit the academic year' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.check_semester_dates() from public, anon, authenticated;
create trigger semester_dates_guard before insert or update on public.semesters
for each row execute function public.check_semester_dates();

create function public.check_academic_year_dates() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if exists (select 1 from public.semesters where academic_year_id = new.id
    and (starts_on < new.starts_on or ends_on > new.ends_on)) then
    raise exception 'Academic year must contain existing semesters' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.check_academic_year_dates() from public, anon, authenticated;
create trigger academic_year_dates_guard before update on public.academic_years
for each row execute function public.check_academic_year_dates();

-- Provisional administrative RBAC: administrator writes; assigned school roles
-- read non-personal master data. No academic approval rights are granted.
do $$
declare table_name text;
begin
  foreach table_name in array array['school_settings', 'academic_years', 'semesters', 'subjects', 'school_classes'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert on public.%I to authenticated', table_name);
    execute format('create policy master_read on public.%I for select to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in (''administrator'', ''principal'', ''teacher'', ''student'', ''parent'')))', table_name);
    execute format('create policy master_insert on public.%I for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = ''administrator''))', table_name);
    execute format('create policy master_update on public.%I for update to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = ''administrator'')) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = ''administrator''))', table_name);
  end loop;
end;
$$;
grant update (name, npsn, address) on public.school_settings to authenticated;
grant update (name, starts_on, ends_on, is_active) on public.academic_years to authenticated;
grant update (academic_year_id, number, starts_on, ends_on, is_active) on public.semesters to authenticated;
grant update (code, name, is_active) on public.subjects to authenticated;
grant update (academic_year_id, name, grade, capacity, is_active) on public.school_classes to authenticated;

commit;
