begin;
create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.school_classes(id),
  held_on date not null,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(class_id,held_on)
);
create index attendance_sessions_author_idx on public.attendance_sessions(created_by);
create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id),
  enrollment_id uuid not null references public.class_enrollments(id),
  student_id uuid not null references public.students(id),
  student_code text not null,
  student_name text not null,
  status text check(status in ('present','sick','excused','absent')),
  revision integer not null default 0 check(revision>=0),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz,
  unique(session_id,enrollment_id)
);
create index attendance_records_enrollment_idx on public.attendance_records(enrollment_id);
create index attendance_records_student_idx on public.attendance_records(student_id);
create index attendance_records_actor_idx on public.attendance_records(updated_by);
create table public.attendance_changes (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.attendance_records(id),
  old_status text check(old_status in ('present','sick','excused','absent')),
  new_status text not null check(new_status in ('present','sick','excused','absent')),
  reason text not null default '' check(char_length(reason)<=300),
  actor_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create index attendance_changes_record_idx on public.attendance_changes(record_id,created_at);
create index attendance_changes_actor_idx on public.attendance_changes(actor_id);

create function school_private.can_manage_attendance(target_class uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select (select auth.uid()) is not null and exists(
    select 1 from public.profiles p join public.teachers t on t.profile_id=p.id and t.is_active
    join public.teacher_assignments a on a.teacher_id=t.id and a.is_active
    join public.school_classes c on c.id=a.class_id and c.is_active
    join public.subjects s on s.id=a.subject_id and s.is_active
    where p.id=(select auth.uid()) and p.role='teacher' and c.id=target_class);
$$;
create function school_private.can_read_attendance_session(target_session uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select (select auth.uid()) is not null and exists(
    select 1 from public.attendance_sessions s join public.profiles p on p.id=(select auth.uid())
    where s.id=target_session and (p.role in ('administrator','principal')
      or school_private.can_manage_attendance(s.class_id)
      or (p.role='student' and exists(select 1 from public.attendance_records r join public.students st on st.id=r.student_id
        where r.session_id=s.id and st.profile_id=p.id))));
$$;
create function school_private.can_read_attendance_record(target_record uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select (select auth.uid()) is not null and exists(
    select 1 from public.attendance_records r join public.attendance_sessions s on s.id=r.session_id
    join public.profiles p on p.id=(select auth.uid()) join public.students st on st.id=r.student_id
    where r.id=target_record and (p.role in ('administrator','principal')
      or school_private.can_manage_attendance(s.class_id)
      or (p.role='student' and st.profile_id=p.id)));
$$;
revoke all on function school_private.can_manage_attendance(uuid), school_private.can_read_attendance_session(uuid), school_private.can_read_attendance_record(uuid) from public,anon,authenticated;
grant execute on function school_private.can_manage_attendance(uuid), school_private.can_read_attendance_session(uuid), school_private.can_read_attendance_record(uuid) to authenticated;

create function school_private.guard_attendance_session() returns trigger
language plpgsql security definer set search_path='' as $$
declare first_day date; last_day date;
begin
  if (select auth.uid()) is null or new.created_by is distinct from (select auth.uid())
    or not school_private.can_manage_attendance(new.class_id) then
    raise exception 'Attendance requires an assigned teacher' using errcode='42501';
  end if;
  select y.starts_on,y.ends_on into first_day,last_day from public.school_classes c
    join public.academic_years y on y.id=c.academic_year_id where c.id=new.class_id for share of c;
  -- Enrollment history has no effective-date intervals yet. Do not infer old
  -- rosters by backdating a snapshot of today's active class membership.
  if new.held_on <> (now() at time zone 'Asia/Jakarta')::date or new.held_on not between first_day and last_day then
    raise exception 'New attendance sessions must be today within the class academic year' using errcode='23514';
  end if;
  return new;
end;
$$;
create function school_private.snapshot_attendance_roster() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if (select auth.uid()) is null or not school_private.can_manage_attendance(new.class_id) then
    raise exception 'Attendance requires an assigned teacher' using errcode='42501';
  end if;
  insert into public.attendance_records(session_id,enrollment_id,student_id,student_code,student_name)
    select new.id,e.id,st.id,st.code,st.name from public.class_enrollments e join public.students st on st.id=e.student_id
    where e.class_id=new.class_id and e.is_active and st.is_active;
  if not found then raise exception 'Class has no active pupils' using errcode='23514'; end if;
  return new;
end;
$$;
revoke all on function school_private.guard_attendance_session(), school_private.snapshot_attendance_roster() from public,anon,authenticated;
create trigger attendance_session_guard before insert on public.attendance_sessions for each row execute function school_private.guard_attendance_session();
create trigger attendance_roster_snapshot after insert on public.attendance_sessions for each row execute function school_private.snapshot_attendance_roster();

alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.attendance_changes enable row level security;
revoke all on public.attendance_sessions, public.attendance_records, public.attendance_changes from public,anon,authenticated;
grant select on public.attendance_sessions, public.attendance_records, public.attendance_changes to authenticated;
grant insert(class_id,held_on) on public.attendance_sessions to authenticated;
-- Use the new row's class directly for INSERT RETURNING. A stable helper that
-- re-queries the sessions table cannot yet see that row in the INSERT snapshot.
create policy attendance_sessions_read on public.attendance_sessions for select to authenticated using (
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and (
    p.role in ('administrator','principal') or (select school_private.can_manage_attendance(attendance_sessions.class_id))
    or (p.role='student' and (select school_private.can_read_attendance_session(attendance_sessions.id))))));
create policy attendance_sessions_insert on public.attendance_sessions for insert to authenticated with check ((select school_private.can_manage_attendance(class_id)));
create policy attendance_records_read on public.attendance_records for select to authenticated using ((select school_private.can_read_attendance_record(id)));
create policy attendance_changes_read on public.attendance_changes for select to authenticated using (
  (select school_private.can_read_attendance_record(record_id)) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal','teacher')));

create function school_private.save_attendance(target_session uuid, changes jsonb) returns integer
language plpgsql security definer set search_path='' as $$
declare target_class uuid; item jsonb; current_record public.attendance_records; next_status text; why text; saved integer:=0;
begin
  select class_id into target_class from public.attendance_sessions where id=target_session for update;
  if (select auth.uid()) is null or target_class is null or not school_private.can_manage_attendance(target_class) then
    raise exception 'Attendance requires an assigned teacher' using errcode='42501';
  end if;
  if jsonb_typeof(changes) is distinct from 'array' then raise exception 'Expected a list of changes' using errcode='23514'; end if;
  if jsonb_array_length(changes) not between 1 and 100 then raise exception 'Invalid batch size' using errcode='23514'; end if;
  if (select count(distinct value->>'id') from jsonb_array_elements(changes)) <> jsonb_array_length(changes) then
    raise exception 'Duplicate record identifiers' using errcode='23514';
  end if;
  for item in select value from jsonb_array_elements(changes) loop
    if jsonb_typeof(item) <> 'object' or jsonb_typeof(item->'revision') is distinct from 'number'
      or jsonb_typeof(item->'id') is distinct from 'string' or jsonb_typeof(item->'status') is distinct from 'string'
      or (item ? 'reason' and jsonb_typeof(item->'reason') is distinct from 'string') then
      raise exception 'Invalid change format' using errcode='23514';
    end if;
    select * into current_record from public.attendance_records where id=(item->>'id')::uuid and session_id=target_session for update;
    if not found then raise exception 'Record does not belong to this session' using errcode='42501'; end if;
    if current_record.revision <> (item->>'revision')::integer then raise exception 'Attendance was modified by another request' using errcode='40001'; end if;
    next_status:=item->>'status'; why:=btrim(coalesce(item->>'reason',''));
    if next_status is null or next_status not in ('present','sick','excused','absent') or char_length(why)>300 then
      raise exception 'Invalid attendance status or reason' using errcode='23514';
    end if;
    if current_record.status is not distinct from next_status then continue; end if;
    if current_record.status is not null and (char_length(why)<5 or why !~ '[^[:space:]]') then
      raise exception 'Correction requires a reason of at least five characters' using errcode='23514';
    end if;
    update public.attendance_records set status=next_status, revision=revision+1,updated_by=(select auth.uid()),updated_at=now() where id=current_record.id;
    insert into public.attendance_changes(record_id,old_status,new_status,reason,actor_id)
      values(current_record.id,current_record.status,next_status,why,(select auth.uid()));
    saved:=saved+1;
  end loop;
  return saved;
end;
$$;
revoke all on function school_private.save_attendance(uuid,jsonb) from public,anon,authenticated;
grant execute on function school_private.save_attendance(uuid,jsonb) to authenticated;
create function public.record_attendance(target_session uuid, changes jsonb) returns integer
language sql security invoker set search_path='' as $$ select school_private.save_attendance(target_session,changes); $$;
revoke all on function public.record_attendance(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.record_attendance(uuid,jsonb) to authenticated;
commit;
