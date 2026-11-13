begin;

create table public.parent_student_relationships (
  parent_profile_id uuid not null references public.profiles(id),
  student_id uuid not null references public.students(id),
  verified_at timestamptz not null default now(),
  verified_by uuid not null references public.profiles(id),
  primary key (parent_profile_id, student_id)
);

create index parent_student_relationships_student_idx on public.parent_student_relationships(student_id);
create index parent_student_relationships_verifier_idx on public.parent_student_relationships(verified_by);

create table public.account_relationship_events (
  id bigint generated always as identity primary key,
  relationship_kind text not null check (relationship_kind in ('teacher', 'student', 'parent')),
  registry_id uuid not null,
  profile_id uuid not null,
  active boolean not null,
  actor_id uuid not null,
  reason text not null check (char_length(btrim(reason)) between 5 and 300),
  created_at timestamptz not null default now()
);

alter table public.parent_student_relationships enable row level security;
alter table public.account_relationship_events enable row level security;

revoke all on public.parent_student_relationships, public.account_relationship_events
  from public, anon, authenticated;
grant select on public.parent_student_relationships, public.account_relationship_events to authenticated;

create policy parent_relationships_admin_read on public.parent_student_relationships
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'administrator')
  );

create policy account_relationship_events_admin_read on public.account_relationship_events
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'administrator')
  );

create function school_private.set_account_relationship(
  relationship_kind text, registry_id uuid, profile_id uuid, active boolean, reason text
) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  target_role text;
  existing_profile uuid;
  registry_active boolean;
  changed integer;
begin
  perform 1 from public.profiles p where p.id = actor and p.role = 'administrator' for share;
  if not found then
    raise exception 'Administrator required' using errcode = '42501';
  end if;

  if relationship_kind is null or relationship_kind not in ('teacher', 'student', 'parent')
     or registry_id is null or profile_id is null or active is null
     or reason is null or char_length(btrim(reason)) not between 5 and 300 then
    raise exception 'Invalid relationship or reason' using errcode = '22023';
  end if;

  select p.role into target_role from public.profiles p
    where p.id = set_account_relationship.profile_id for share;
  if active and target_role is distinct from relationship_kind then
    raise exception 'Account role does not match the relationship' using errcode = '23514';
  end if;

  if relationship_kind = 'teacher' then
    select t.profile_id, t.is_active into existing_profile, registry_active
      from public.teachers t where t.id = registry_id for update;
  else
    select s.profile_id, s.is_active into existing_profile, registry_active
      from public.students s where s.id = registry_id for update;
  end if;

  if not found or (active and not registry_active) then
    raise exception 'Registry entry is unavailable' using errcode = '23514';
  end if;

  if relationship_kind = 'parent' then
    if active then
      insert into public.parent_student_relationships (parent_profile_id, student_id, verified_by)
        values (profile_id, registry_id, actor) on conflict do nothing;
    else
      delete from public.parent_student_relationships r
        where r.parent_profile_id = set_account_relationship.profile_id and r.student_id = registry_id;
    end if;
  else
    if existing_profile is not null and existing_profile <> profile_id then
      raise exception 'Registry entry is linked to a different account' using errcode = '23514';
    end if;
    if (active and existing_profile = profile_id) or (not active and existing_profile is null) then
      return false;
    end if;

    if relationship_kind = 'teacher' then
      update public.teachers t set profile_id = case when active then set_account_relationship.profile_id end
        where t.id = registry_id;
    else
      update public.students s set profile_id = case when active then set_account_relationship.profile_id end
        where s.id = registry_id;
    end if;
  end if;

  get diagnostics changed = row_count;
  if changed = 0 then
    return false;
  end if;

  insert into public.account_relationship_events (relationship_kind, registry_id, profile_id, active, actor_id, reason)
    values (relationship_kind, registry_id, profile_id, active, actor, btrim(reason));
  return true;
end;
$$;

create function public.set_account_relationship(
  relationship_kind text, registry_id uuid, profile_id uuid, active boolean, reason text
) returns boolean
language sql security invoker set search_path = '' as $$
  select school_private.set_account_relationship(relationship_kind, registry_id, profile_id, active, reason);
$$;

revoke all on function school_private.set_account_relationship(text, uuid, uuid, boolean, text)
  from public, anon, authenticated;
revoke all on function public.set_account_relationship(text, uuid, uuid, boolean, text)
  from public, anon, authenticated;
grant execute on function school_private.set_account_relationship(text, uuid, uuid, boolean, text) to authenticated;
grant execute on function public.set_account_relationship(text, uuid, uuid, boolean, text) to authenticated;

commit;
