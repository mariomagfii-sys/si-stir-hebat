begin;
create table public.lesson_schedules (
  id uuid primary key,
  assignment_id uuid not null references public.teacher_assignments(id),
  teacher_id uuid not null references public.teachers(id),
  class_id uuid not null references public.school_classes(id),
  class_name text not null,
  teacher_name text not null,
  subject_name text not null,
  weekday integer not null check (weekday between 1 and 7),
  start_minute integer not null check (start_minute between 0 and 1438),
  end_minute integer not null check (end_minute between 1 and 1439 and end_minute > start_minute),
  effective_from date not null,
  effective_until date not null check (effective_until >= effective_from),
  is_active boolean not null default true,
  revision integer not null default 0,
  updated_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references public.profiles(id)
);
create index lesson_schedules_assignment_idx on public.lesson_schedules(assignment_id);
create index lesson_schedules_teacher_idx on public.lesson_schedules(teacher_id,weekday) where is_active;
create index lesson_schedules_class_idx on public.lesson_schedules(class_id,weekday) where is_active;
create index lesson_schedules_day_idx on public.lesson_schedules(weekday,effective_from,effective_until);
create index lesson_schedules_author_idx on public.lesson_schedules(created_by);
create table public.lesson_schedule_events (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.lesson_schedules(id),
  actor_id uuid not null default auth.uid() references public.profiles(id),
  old_values jsonb,
  new_values jsonb not null,
  reason text not null check (char_length(btrim(reason)) between 5 and 500 and reason ~ '[^[:space:]]'),
  created_at timestamptz not null default now()
);
create index lesson_schedule_events_schedule_idx on public.lesson_schedule_events(schedule_id,created_at);
create index lesson_schedule_events_actor_idx on public.lesson_schedule_events(actor_id);

create function school_private.schedule_assignment_active(target uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select (select auth.uid()) is not null and exists(select 1 from public.teacher_assignments a
    join public.teachers t on t.id=a.teacher_id and t.is_active
    join public.school_classes c on c.id=a.class_id and c.is_active
    join public.subjects s on s.id=a.subject_id and s.is_active
    where a.id=target and a.is_active);
$$;
revoke all on function school_private.schedule_assignment_active(uuid) from public,anon,authenticated;
grant execute on function school_private.schedule_assignment_active(uuid) to authenticated;
alter table public.lesson_schedules enable row level security;
alter table public.lesson_schedule_events enable row level security;
revoke all on public.lesson_schedules,public.lesson_schedule_events from public,anon,authenticated;
grant select on public.lesson_schedules,public.lesson_schedule_events to authenticated;
create policy lesson_schedules_read on public.lesson_schedules for select to authenticated using (
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal'))
  or (is_active and school_private.schedule_assignment_active(assignment_id) and (
    school_private.can_write_journal(assignment_id) or school_private.can_read_class_material(class_id)
  ))
);
create policy lesson_schedule_events_read on public.lesson_schedule_events for select to authenticated using (
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal'))
);

create function school_private.save_lesson_schedule(
  p_id uuid,p_revision integer,p_assignment uuid,p_weekday integer,p_start integer,p_end integer,
  p_from date,p_until date,p_active boolean,p_reason text
) returns uuid language plpgsql security definer set search_path='' as $$
declare old_row public.lesson_schedules; new_row public.lesson_schedules; chosen record;
begin
  perform 1 from public.profiles where id=(select auth.uid()) and role='administrator' for share;
  if not found then raise exception 'Schedule administrator required' using errcode='42501'; end if;
  if p_id is null or p_assignment is null or p_weekday is null or p_weekday not between 1 and 7
    or p_start is null or p_end is null or p_start < 0 or p_end > 1439 or p_start >= p_end
    or p_from is null or p_until is null or not isfinite(p_from) or not isfinite(p_until) or p_until < p_from
    or p_active is null or p_reason is null or char_length(btrim(p_reason)) not between 5 and 500 or p_reason !~ '[^[:space:]]' then
    raise exception 'Invalid schedule fields or reason' using errcode='23514';
  end if;
  -- Schedule writes are infrequent. Serialize their short transactions so two
  -- administrators cannot both pass the conflict check before inserting.
  perform pg_advisory_xact_lock(20261112, 1);
  select * into old_row from public.lesson_schedules where id=p_id for update;
  if p_revision is null and found then raise exception 'Schedule already exists' using errcode='23505'; end if;
  if p_revision is not null and (old_row.id is null or old_row.revision<>p_revision) then
    raise exception 'Schedule revision changed' using errcode='40001';
  end if;
  if old_row.id is not null and old_row.assignment_id<>p_assignment then
    raise exception 'Schedule assignment is immutable' using errcode='23514';
  end if;
  select a.teacher_id,a.class_id,c.name as class_name,t.name as teacher_name,s.name as subject_name,
    y.starts_on,y.ends_on,(a.is_active and t.is_active and c.is_active and s.is_active) as active
    into chosen from public.teacher_assignments a join public.teachers t on t.id=a.teacher_id
    join public.school_classes c on c.id=a.class_id join public.subjects s on s.id=a.subject_id
    join public.academic_years y on y.id=c.academic_year_id where a.id=p_assignment for share of a,t,c,s,y;
  if not found or (p_active and not chosen.active) then
    raise exception 'Active assignment required' using errcode='23514';
  end if;
  if p_from < chosen.starts_on or p_until > chosen.ends_on
    or p_from + ((p_weekday-extract(isodow from p_from)::int+7)%7) > p_until then
    raise exception 'Date range must contain the selected weekday within the school year' using errcode='23514';
  end if;
  if p_active and exists(select 1 from public.lesson_schedules other
    where other.id<>p_id and other.is_active and other.weekday=p_weekday
      and (other.class_id=chosen.class_id or other.teacher_id=chosen.teacher_id)
      and other.start_minute<p_end and p_start<other.end_minute
      and greatest(other.effective_from,p_from) + ((p_weekday-extract(isodow from greatest(other.effective_from,p_from))::int+7)%7)
        <= least(other.effective_until,p_until)) then
    raise exception 'Teacher or class has an overlapping lesson' using errcode='23P01';
  end if;
  if old_row.id is null then
    insert into public.lesson_schedules(id,assignment_id,teacher_id,class_id,class_name,teacher_name,subject_name,
      weekday,start_minute,end_minute,effective_from,effective_until,is_active)
    values(p_id,p_assignment,chosen.teacher_id,chosen.class_id,chosen.class_name,chosen.teacher_name,chosen.subject_name,
      p_weekday,p_start,p_end,p_from,p_until,p_active) returning * into new_row;
  else
    update public.lesson_schedules set weekday=p_weekday,start_minute=p_start,end_minute=p_end,
      effective_from=p_from,effective_until=p_until,is_active=p_active,revision=revision+1,updated_at=now()
      where id=p_id returning * into new_row;
  end if;
  insert into public.lesson_schedule_events(schedule_id,old_values,new_values,reason)
    values(p_id,case when old_row.id is null then null else to_jsonb(old_row) end,to_jsonb(new_row),btrim(p_reason));
  return p_id;
end;
$$;
create function public.save_lesson_schedule(
  p_id uuid,p_revision integer,p_assignment uuid,p_weekday integer,p_start integer,p_end integer,
  p_from date,p_until date,p_active boolean,p_reason text
) returns uuid language sql security invoker set search_path='' as $$
  select school_private.save_lesson_schedule(p_id,p_revision,p_assignment,p_weekday,p_start,p_end,p_from,p_until,p_active,p_reason);
$$;
revoke all on function school_private.save_lesson_schedule(uuid,integer,uuid,integer,integer,integer,date,date,boolean,text),
  public.save_lesson_schedule(uuid,integer,uuid,integer,integer,integer,date,date,boolean,text) from public,anon,authenticated;
grant execute on function school_private.save_lesson_schedule(uuid,integer,uuid,integer,integer,integer,date,date,boolean,text),
  public.save_lesson_schedule(uuid,integer,uuid,integer,integer,integer,date,date,boolean,text) to authenticated;
commit;
