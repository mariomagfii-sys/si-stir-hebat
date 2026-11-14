begin;
alter table public.school_classes add constraint school_classes_id_year_key unique (id, academic_year_id);
create table public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  class_id uuid not null,
  academic_year_id uuid not null references public.academic_years(id),
  is_active boolean not null default true,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (class_id, academic_year_id) references public.school_classes(id, academic_year_id)
);
create unique index enrollment_one_active_class_per_year on public.class_enrollments(student_id, academic_year_id) where is_active;
create index enrollment_class_idx on public.class_enrollments(class_id, is_active);
create index enrollment_year_idx on public.class_enrollments(academic_year_id);
create index enrollment_author_idx on public.class_enrollments(created_by);
create table public.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id),
  class_id uuid not null,
  subject_id uuid not null references public.subjects(id),
  academic_year_id uuid not null references public.academic_years(id),
  is_active boolean not null default true,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (class_id, academic_year_id) references public.school_classes(id, academic_year_id),
  unique (teacher_id, class_id, subject_id)
);
create index assignment_class_idx on public.teacher_assignments(class_id, is_active);
create index assignment_subject_idx on public.teacher_assignments(subject_id);
create index assignment_year_idx on public.teacher_assignments(academic_year_id);
create index assignment_author_idx on public.teacher_assignments(created_by);

create function public.guard_class_enrollment() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare classroom public.school_classes; used integer;
begin
  -- Serialize capacity checks with other enrollments and class edits.
  select * into classroom from public.school_classes where id = new.class_id for update;
  if classroom.id is null then raise exception 'Unknown class' using errcode='23503'; end if;
  new.academic_year_id := classroom.academic_year_id;
  if new.is_active then
    if not classroom.is_active or not exists(select 1 from public.students where id=new.student_id and is_active) then
      raise exception 'Active enrollment requires active student and class' using errcode='23514';
    end if;
    select count(*) into used from public.class_enrollments where class_id=new.class_id and is_active and id<>new.id;
    if used >= classroom.capacity then raise exception 'Class capacity exceeded' using errcode='23514'; end if;
  end if;
  return new;
end;
$$;
revoke all on function public.guard_class_enrollment() from public,anon,authenticated;
create trigger enrollment_guard before insert or update on public.class_enrollments for each row execute function public.guard_class_enrollment();

create function public.guard_teacher_assignment() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare classroom public.school_classes;
begin
  select * into classroom from public.school_classes where id=new.class_id for share;
  if classroom.id is null then raise exception 'Unknown class' using errcode='23503'; end if;
  new.academic_year_id := classroom.academic_year_id;
  if new.is_active and (not classroom.is_active
    or not exists(select 1 from public.teachers where id=new.teacher_id and is_active)
    or not exists(select 1 from public.subjects where id=new.subject_id and is_active)) then
    raise exception 'Active assignment requires active teacher, class and subject' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_teacher_assignment() from public,anon,authenticated;
create trigger assignment_guard before insert or update on public.teacher_assignments for each row execute function public.guard_teacher_assignment();

create function public.guard_class_capacity() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.capacity < (select count(*) from public.class_enrollments where class_id=new.id and is_active) then
    raise exception 'Capacity below active enrollment' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_class_capacity() from public,anon,authenticated;
create trigger class_capacity_guard before update on public.school_classes for each row execute function public.guard_class_capacity();

alter table public.class_enrollments enable row level security;
alter table public.teacher_assignments enable row level security;
revoke all on public.class_enrollments, public.teacher_assignments from public,anon,authenticated;
grant select on public.class_enrollments, public.teacher_assignments to authenticated;
grant insert (student_id,class_id,is_active), update (is_active) on public.class_enrollments to authenticated;
grant insert (teacher_id,class_id,subject_id,is_active), update (is_active) on public.teacher_assignments to authenticated;

create policy assignment_read on public.teacher_assignments for select to authenticated using (
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and (
    p.role in ('administrator','principal') or (p.role='teacher' and exists(
      select 1 from public.teachers t where t.id=teacher_id and t.profile_id=(select auth.uid())))))
);
create policy enrollment_read on public.class_enrollments for select to authenticated using (
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and (
    p.role in ('administrator','principal')
    or (p.role='student' and exists(select 1 from public.students s where s.id=student_id and s.profile_id=(select auth.uid())))
    or (p.role='teacher' and is_active and exists(select 1 from public.teacher_assignments a join public.teachers t on t.id=a.teacher_id
      join public.school_classes c on c.id=a.class_id and c.is_active
      join public.students s on s.id=class_enrollments.student_id and s.is_active
      where a.class_id=class_enrollments.class_id and a.is_active and t.is_active and t.profile_id=(select auth.uid())))))
);
do $$
declare target text;
begin
  foreach target in array array['class_enrollments','teacher_assignments'] loop
    execute format('create policy relation_insert on public.%I for insert to authenticated with check (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role=''administrator''))',target);
    execute format('create policy relation_update on public.%I for update to authenticated using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role=''administrator'')) with check (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role=''administrator''))',target);
  end loop;
end;
$$;

-- Private lookup avoids recursive students/enrollments RLS. It checks the caller
-- and current school role internally; it never accepts an arbitrary caller ID.
create schema if not exists school_private;
revoke all on schema school_private from public,anon;
grant usage on schema school_private to authenticated;
create function school_private.can_read_assigned_student(target_student uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.profiles p
    join public.teachers t on t.profile_id=p.id and t.is_active
    join public.teacher_assignments a on a.teacher_id=t.id and a.is_active
    join public.class_enrollments e on e.class_id=a.class_id and e.is_active
    join public.students s on s.id=e.student_id and s.is_active
    join public.school_classes c on c.id=a.class_id and c.is_active
    where p.id=(select auth.uid()) and p.role='teacher' and s.id=target_student
  );
$$;
revoke all on function school_private.can_read_assigned_student(uuid) from public,anon,authenticated;
grant execute on function school_private.can_read_assigned_student(uuid) to authenticated;
create policy students_assigned_teacher_read on public.students for select to authenticated
  using ((select school_private.can_read_assigned_student(students.id)));
commit;
