begin;

create or replace function public.review_guardian_absence_report(
  target_id uuid, expected_revision integer, decision text, note text
)
returns public.guardian_absence_reports
language plpgsql security definer set search_path='' as $$
declare
  report public.guardian_absence_reports;
  result public.guardian_absence_reports;
  target_session uuid;
  target_record uuid;
  attendance_revision integer;
  matching_records integer;
begin
  if decision is null or decision not in ('confirmed','rejected')
    or char_length(btrim(coalesce(note,''))) not between 1 and 1000 then
    raise exception 'Invalid review decision' using errcode='22023';
  end if;
  if not school_private.can_review_guardian_absence(target_id) then
    raise exception 'Teacher assignment required' using errcode='42501';
  end if;

  select r.* into report
  from public.guardian_absence_reports r
  where r.id=target_id
  for update;
  if report.id is null or report.revision <> expected_revision
    or report.status <> 'submitted' then
    raise exception 'Revision changed or report is not reviewable' using errcode='40001';
  end if;

  if decision='confirmed' then
    select count(*)::integer into matching_records
    from public.attendance_sessions s
    join public.attendance_records ar on ar.session_id=s.id and ar.student_id=report.student_id
    join public.school_classes c on c.id=s.class_id and c.is_active
    join public.class_enrollments e on e.id=ar.enrollment_id and e.student_id=report.student_id and e.class_id=s.class_id
    join public.teacher_assignments a on a.class_id=c.id and a.is_active
    join public.subjects sub on sub.id=a.subject_id and sub.is_active
    join public.teachers t on t.id=a.teacher_id and t.is_active and t.profile_id=(select auth.uid())
    where s.held_on=report.report_date;

    if matching_records=0 then
      raise exception 'An attendance session and roster are required for this report date'
        using errcode='55000';
    end if;
    if matching_records<>1 then
      raise exception 'Attendance session is ambiguous for this student and report date'
        using errcode='55000';
    end if;

    select s.id, ar.id, ar.revision into target_session, target_record, attendance_revision
    from public.attendance_sessions s
    join public.attendance_records ar on ar.session_id=s.id and ar.student_id=report.student_id
    join public.school_classes c on c.id=s.class_id and c.is_active
    join public.class_enrollments e on e.id=ar.enrollment_id and e.student_id=report.student_id and e.class_id=s.class_id
    join public.teacher_assignments a on a.class_id=c.id and a.is_active
    join public.subjects sub on sub.id=a.subject_id and sub.is_active
    join public.teachers t on t.id=a.teacher_id and t.is_active and t.profile_id=(select auth.uid())
    where s.held_on=report.report_date;

    perform school_private.save_attendance(
      target_session,
      jsonb_build_array(jsonb_build_object(
        'id',target_record,
        'revision',attendance_revision,
        'status','absent',
        'reason',left('Verifikasi laporan wali: ' || btrim(note),300)
      ))
    );
  end if;

  update public.guardian_absence_reports r
    set status=decision, teacher_note=btrim(note), teacher_id=t.id,
        revision=r.revision+1, updated_at=now()
    from public.teachers t
    where r.id=target_id and r.revision=expected_revision
      and r.status='submitted'
      and t.profile_id=(select auth.uid()) and t.is_active
    returning r.* into result;
  if result.id is null then raise exception 'Revision changed' using errcode='40001'; end if;
  return result;
end;
$$;

revoke all on function public.review_guardian_absence_report(uuid,integer,text,text) from public, anon, authenticated;
grant execute on function public.review_guardian_absence_report(uuid,integer,text,text) to authenticated;

commit;
