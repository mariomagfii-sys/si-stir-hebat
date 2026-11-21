begin;

-- One authorized server-side aggregate for the administrator/principal dashboard.
-- The function intentionally exposes only the metrics already rendered there.
create function public.dashboard_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_role text;
  actor_name text;
begin
  if actor_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select p.role, p.full_name into actor_role, actor_name
  from public.profiles p where p.id = actor_id;
  if actor_role is null or actor_role not in ('administrator', 'principal') then
    raise exception 'Dashboard overview is restricted to school administrators and principals'
      using errcode = '42501';
  end if;

  return jsonb_build_object(
    'profile', jsonb_build_object('full_name', actor_name, 'role', actor_role),
    'active', jsonb_build_object(
      'students', (select count(*) from public.students where is_active),
      'teachers', (select count(*) from public.teachers where is_active),
      'classes', (select count(*) from public.school_classes where is_active)
    ),
    'supervision_stages', jsonb_build_object(
      '1', (select count(*) from public.academic_supervisions where stage = 1),
      '2', (select count(*) from public.academic_supervisions where stage = 2),
      '3', (select count(*) from public.academic_supervisions where stage = 3),
      '4', (select count(*) from public.academic_supervisions where stage = 4)
    ),
    'teaching_modules', jsonb_build_object(
      'submitted', (select count(*) from public.teaching_modules where status = 'submitted'),
      'returned', (select count(*) from public.teaching_modules where status = 'returned')
    ),
    'announcements', jsonb_build_object(
      'published_count', (select count(*) from public.announcements where status = 'published'),
      'draft_count', (select count(*) from public.announcements where status = 'draft'),
      'recent', coalesce((
        select jsonb_agg(to_jsonb(recent) order by recent.created_at desc, recent.id desc)
        from (
          select id, title, body, status, created_at
          from public.announcements where status = 'published'
          order by created_at desc, id desc limit 3
        ) recent
      ), '[]'::jsonb)
    )
  );
end;
$$;

-- PGlite EXPLAIN ANALYZE on 50k synthetic modules selected these two sparse,
-- frequently counted states. Stage 4 and active-registry predicates stayed sequential.
create index teaching_modules_submitted_dashboard_idx on public.teaching_modules(id)
  where status = 'submitted';
create index teaching_modules_returned_dashboard_idx on public.teaching_modules(id)
  where status = 'returned';

revoke all on function public.dashboard_overview() from public, anon, authenticated;
grant execute on function public.dashboard_overview() to authenticated;

commit;
