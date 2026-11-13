begin;

create function school_private.guardian_attendance() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(
    jsonb_build_object('id', child.id, 'name', child.name, 'attendance', history.entries)
    order by child.name, child.id
  ), '[]'::jsonb)
  from public.profiles parent
  join public.parent_student_relationships link on link.parent_profile_id = parent.id
  join public.students child on child.id = link.student_id and child.is_active
  cross join lateral (
    select coalesce(jsonb_agg(
      jsonb_build_object('id', recent.id, 'date', recent.held_on, 'status', recent.status)
      order by recent.held_on desc, recent.id
    ), '[]'::jsonb) as entries
    from (
      select record.id, session.held_on, record.status
      from public.attendance_records record
      join public.attendance_sessions session on session.id = record.session_id
      where record.student_id = child.id
      order by session.held_on desc, record.id
      limit 30
    ) recent
  ) history
  where parent.id = (select auth.uid()) and parent.role = 'parent';
$$;

create function public.guardian_attendance() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select school_private.guardian_attendance();
$$;

revoke all on function school_private.guardian_attendance(), public.guardian_attendance()
  from public, anon, authenticated;
grant execute on function school_private.guardian_attendance(), public.guardian_attendance()
  to authenticated;

commit;
