begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  role text not null default 'pending'
    check (role in ('pending', 'administrator', 'principal', 'teacher', 'student', 'parent')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Accounts can only read their own profile. Role assignment is performed by
-- a trusted operator in SQL Editor, never from user-editable auth metadata.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;

create policy profiles_read_self on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_self on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.create_school_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke all on function public.create_school_profile() from public, anon, authenticated;

create trigger on_school_user_created
  after insert on auth.users
  for each row execute function public.create_school_profile();

-- Include users created before this migration without granting a school role.
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

commit;
