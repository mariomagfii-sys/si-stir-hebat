begin;
create function school_private.can_read_habits(target uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.students s join public.profiles p on p.id=(select auth.uid())
    where s.id=target and s.is_active and (
      p.role in ('administrator','principal')
      or (p.role='parent' and exists(select 1 from public.parent_student_relationships r where r.student_id=s.id and r.parent_profile_id=p.id))
      or (p.role='teacher' and exists(select 1 from public.class_enrollments e
        join public.teacher_assignments a on a.class_id=e.class_id
        where e.student_id=s.id and e.is_active and school_private.can_write_journal(a.id)))
    ));
$$;
create function public.habit_students() returns table(id uuid,name text)
language sql stable security definer set search_path='' as $$
  select s.id,s.name from public.students s where school_private.can_read_habits(s.id) order by s.name,s.id;
$$;
create table public.habit_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  record_date date not null check(isfinite(record_date)),
  habits boolean[] not null check(array_ndims(habits)=1 and array_lower(habits,1)=1 and array_length(habits,1)=7),
  notes text not null default '' check(char_length(notes)<=1000),
  revision integer not null default 0,
  updated_by uuid not null default auth.uid() references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique(student_id,record_date)
);
create index habit_records_actor_idx on public.habit_records(updated_by);
create table public.habit_events (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.habit_records(id),
  student_id uuid not null references public.students(id),
  actor_id uuid not null default auth.uid() references public.profiles(id),
  old_values jsonb,
  new_values jsonb not null,
  created_at timestamptz not null default now()
);
create index habit_events_record_idx on public.habit_events(record_id,created_at);
create index habit_events_student_idx on public.habit_events(student_id);
create index habit_events_actor_idx on public.habit_events(actor_id);
alter table public.habit_records enable row level security;
alter table public.habit_events enable row level security;
revoke all on public.habit_records,public.habit_events from public,anon,authenticated;
grant select on public.habit_records,public.habit_events to authenticated;
grant insert(student_id,record_date,habits,notes) on public.habit_records to authenticated;
grant update(habits,notes,revision) on public.habit_records to authenticated;
create policy habits_read on public.habit_records for select to authenticated using(school_private.can_read_habits(student_id));
create policy habit_events_read on public.habit_events for select to authenticated using(school_private.can_read_habits(student_id));
create function school_private.can_write_habits(target uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p join public.parent_student_relationships r on r.parent_profile_id=p.id
    join public.students s on s.id=r.student_id and s.is_active
    where p.id=(select auth.uid()) and p.role='parent' and s.id=target);
$$;
create policy habits_insert on public.habit_records for insert to authenticated with check(school_private.can_write_habits(student_id));
create policy habits_update on public.habit_records for update to authenticated
  using(school_private.can_write_habits(student_id)) with check(school_private.can_write_habits(student_id));
create function school_private.guard_habits() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if new.record_date > (now() at time zone 'Asia/Jakarta')::date then
    raise exception 'Future observation not allowed' using errcode='23514'; end if;
  if tg_op='UPDATE' and new.revision<>old.revision+1 then raise exception 'Revision changed' using errcode='40001'; end if;
  new.updated_by=(select auth.uid()); new.updated_at=now();
  return new;
end; $$;
create trigger habits_guard before insert or update on public.habit_records for each row execute function school_private.guard_habits();
create function school_private.audit_habits() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.habit_events(record_id,student_id,old_values,new_values)
    values(new.id,new.student_id,case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
  return new;
end; $$;
create trigger habits_audit after insert or update on public.habit_records for each row execute function school_private.audit_habits();
revoke all on function school_private.can_read_habits(uuid),school_private.can_write_habits(uuid),public.habit_students(),
  school_private.guard_habits(),school_private.audit_habits() from public,anon,authenticated;
grant execute on function school_private.can_read_habits(uuid),school_private.can_write_habits(uuid),public.habit_students() to authenticated;
commit;
