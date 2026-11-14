begin;

create table public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.class_materials(id),
  student_id uuid not null references public.students(id),
  submitted_by uuid not null default auth.uid() references public.profiles(id),
  student_name text not null,
  answer text not null check (char_length(btrim(answer)) between 1 and 12000 and answer ~ '[^[:space:]]'),
  submitted_at timestamptz not null default now(),
  unique(task_id,student_id)
);

create index task_submissions_student_idx on public.task_submissions(student_id);
create index task_submissions_submitter_idx on public.task_submissions(submitted_by);
create index task_submissions_task_date_idx on public.task_submissions(task_id,submitted_at,id);
alter table public.task_submissions enable row level security;
revoke all on public.task_submissions from public, anon, authenticated;
grant select on public.task_submissions to authenticated;
grant insert (task_id, answer) on public.task_submissions to authenticated;

create policy task_submissions_read on public.task_submissions for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (
    (p.role = 'student' and submitted_by = p.id and exists (
      select 1 from public.students s where s.id = student_id and s.profile_id = p.id and s.is_active
    ))
    or (p.role = 'teacher' and exists (
      select 1 from public.class_materials task where task.id = task_id and task.author_id = p.id
        and school_private.can_write_journal(task.assignment_id)
    ))
  ))
);
create policy task_submissions_insert on public.task_submissions for insert to authenticated with check (
  submitted_by = (select auth.uid())
);

create function school_private.guard_task_submission() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  select s.id, s.name into new.student_id, new.student_name
  from public.class_materials task
  join public.school_classes c on c.id = task.class_id and c.is_active
  join public.class_enrollments e on e.class_id = c.id and e.is_active
  join public.students s on s.id = e.student_id and s.is_active
  join public.profiles p on p.id = s.profile_id and p.role = 'student'
  where p.id = (select auth.uid()) and new.submitted_by = p.id
    and task.id = new.task_id and task.kind = 'task' and task.status = 'published'
    and task.due_on >= (now() at time zone 'Asia/Jakarta')::date
  for share of task, c, e, s, p;
  if not found then
    raise exception 'Task is not open for this student' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function school_private.guard_task_submission() from public, anon, authenticated;
create trigger task_submission_guard before insert on public.task_submissions
  for each row execute function school_private.guard_task_submission();

commit;
