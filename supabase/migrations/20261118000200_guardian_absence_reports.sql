begin;

create table public.guardian_absence_reports (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  student_id uuid not null references public.students(id),
  parent_profile_id uuid not null default auth.uid() references public.profiles(id),
  report_date date not null check (isfinite(report_date)),
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  status text not null default 'submitted' check (status in ('submitted','confirmed','rejected')),
  teacher_id uuid references public.teachers(id),
  teacher_note text not null default '' check (char_length(teacher_note) <= 1000),
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index guardian_absence_one_open_day_idx
  on public.guardian_absence_reports(parent_profile_id, student_id, report_date)
  where status = 'submitted';
create index guardian_absence_teacher_idx on public.guardian_absence_reports(student_id, status, report_date desc);
create index guardian_absence_parent_idx on public.guardian_absence_reports(parent_profile_id, report_date desc);

alter table public.guardian_absence_reports enable row level security;
revoke all on public.guardian_absence_reports from public, anon, authenticated;
grant select on public.guardian_absence_reports to authenticated;
grant insert(student_id, request_id, report_date, reason) on public.guardian_absence_reports to authenticated;

create function school_private.can_read_guardian_absence(target_student uuid, target_parent uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p where p.id=(select auth.uid()) and (
    (p.role='parent' and p.id=target_parent and exists(select 1 from public.parent_student_relationships r where r.parent_profile_id=p.id and r.student_id=target_student))
    or (p.role in ('administrator','principal'))
    or (p.role='teacher' and exists(select 1 from public.class_enrollments e
      join public.teacher_assignments a on a.class_id=e.class_id
      join public.teachers t on t.id=a.teacher_id
      where e.student_id=target_student and e.is_active and a.is_active and t.profile_id=p.id and t.is_active))
  ));
$$;

create function school_private.can_submit_guardian_absence(target_student uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p
    join public.parent_student_relationships r on r.parent_profile_id=p.id and r.student_id=target_student
    join public.students s on s.id=r.student_id and s.is_active
    where p.id=(select auth.uid()) and p.role='parent');
$$;

create function school_private.can_review_guardian_absence(target_report uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.guardian_absence_reports r
    join public.class_enrollments e on e.student_id=r.student_id and e.is_active
    join public.teacher_assignments a on a.class_id=e.class_id and a.is_active
    join public.teachers t on t.id=a.teacher_id and t.is_active
    join public.profiles p on p.id=(select auth.uid()) and p.role='teacher' and t.profile_id=p.id
    where r.id=target_report);
$$;

create policy guardian_absence_read on public.guardian_absence_reports for select to authenticated
  using (school_private.can_read_guardian_absence(student_id, parent_profile_id));
create policy guardian_absence_insert on public.guardian_absence_reports for insert to authenticated
  with check (parent_profile_id=(select auth.uid()) and school_private.can_submit_guardian_absence(student_id));

create function public.review_guardian_absence_report(target_id uuid, expected_revision integer, decision text, note text)
returns public.guardian_absence_reports
language plpgsql security definer set search_path='' as $$
declare result public.guardian_absence_reports;
begin
  if decision not in ('confirmed','rejected') or char_length(btrim(coalesce(note,''))) not between 1 and 1000 then
    raise exception 'Invalid review decision' using errcode='22023';
  end if;
  if not school_private.can_review_guardian_absence(target_id) then
    raise exception 'Teacher assignment required' using errcode='42501';
  end if;
  update public.guardian_absence_reports r
    set status=decision, teacher_note=btrim(note), teacher_id=t.id,
        revision=r.revision+1, updated_at=now()
    from public.teachers t
    where r.id=target_id and r.revision=expected_revision and t.profile_id=(select auth.uid()) and t.is_active
    returning r.* into result;
  if result.id is null then raise exception 'Revision changed' using errcode='40001'; end if;
  return result;
end; $$;

create function school_private.guardian_absence_defaults() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  new.reason=btrim(new.reason); new.updated_at=now();
  if new.report_date > (now() at time zone 'Asia/Jakarta')::date then
    raise exception 'Future report not allowed' using errcode='23514';
  end if;
  return new;
end; $$;
create trigger guardian_absence_defaults before insert on public.guardian_absence_reports
  for each row execute function school_private.guardian_absence_defaults();

revoke all on function school_private.can_read_guardian_absence(uuid,uuid), school_private.can_submit_guardian_absence(uuid), school_private.can_review_guardian_absence(uuid), public.review_guardian_absence_report(uuid,integer,text,text) from public, anon, authenticated;
grant execute on function school_private.can_read_guardian_absence(uuid,uuid), school_private.can_submit_guardian_absence(uuid), school_private.can_review_guardian_absence(uuid), public.review_guardian_absence_report(uuid,integer,text,text) to authenticated;

commit;
