begin;

-- Remove the isolated example table only when its rows are still empty.
lock table public.todos in access exclusive mode;
do $$
begin
  if exists (select 1 from public.todos limit 1) then
    raise exception 'Cannot drop public.todos while it contains rows' using errcode = '55000';
  end if;
end;
$$;
revoke all on table public.todos from public, anon, authenticated;
drop table public.todos;

-- Deleting an Auth profile unlinks the account but preserves the school registry snapshot.
alter table public.teachers drop constraint if exists teachers_profile_id_fkey;
alter table public.teachers add constraint teachers_profile_id_fkey
  foreign key (profile_id) references public.profiles(id) on delete set null;
alter table public.students drop constraint if exists students_profile_id_fkey;
alter table public.students add constraint students_profile_id_fkey
  foreign key (profile_id) references public.profiles(id) on delete set null;

-- This SECURITY DEFINER RPC returns only names the caller is allowed to read.
create or replace function public.habit_students() returns table(id uuid, name text)
language sql stable security definer set search_path = '' as $$
  select s.id, s.name
  from public.students s
  where school_private.can_read_habits(s.id)
  order by s.name, s.id;
$$;
revoke all on function public.habit_students() from public, anon, authenticated;
grant execute on function public.habit_students() to authenticated;

-- Draft feedback and draft audit events are visible only to their author.
drop policy task_feedback_read on public.task_feedback;
create policy task_feedback_read on public.task_feedback for select to authenticated using (
  (author_id = (select auth.uid()) and school_private.can_manage_task_feedback(submission_id))
  or (status = 'published' and (
    school_private.can_read_student_feedback(student_id)
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role in ('administrator','principal')
    )
  ))
);

drop policy task_feedback_events_read on public.task_feedback_events;
create policy task_feedback_events_read on public.task_feedback_events for select to authenticated using (
  exists (
    select 1 from public.task_feedback f
    where f.id = feedback_id and (
      (f.author_id = (select auth.uid()) and school_private.can_manage_task_feedback(f.submission_id))
      or (task_feedback_events.status = 'published' and f.status = 'published' and (
        school_private.can_read_student_feedback(f.student_id)
        or exists (
          select 1 from public.profiles p
          where p.id = (select auth.uid()) and p.role in ('administrator','principal')
        )
      ))
    )
  )
);

commit;
