begin;

create table public.task_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.task_submissions(id),
  task_id uuid not null references public.class_materials(id),
  student_id uuid not null references public.students(id),
  student_name text not null,
  author_id uuid not null default auth.uid() references public.profiles(id),
  feedback text not null check (char_length(btrim(feedback)) between 1 and 6000 and feedback ~ '[^[:space:]]'),
  status text not null default 'draft' check (status in ('draft','published')),
  revision integer not null default 0,
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create index task_feedback_task_idx on public.task_feedback(task_id,id);
create index task_feedback_student_idx on public.task_feedback(student_id);
create index task_feedback_author_idx on public.task_feedback(author_id);

create function school_private.can_manage_task_feedback(target_submission uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.task_submissions s
    join public.class_materials t on t.id = s.task_id
    where s.id = target_submission and t.author_id = (select auth.uid())
      and school_private.can_write_journal(t.assignment_id)
  );
$$;
create function school_private.can_read_student_feedback(target_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.students s join public.profiles p on p.id = (select auth.uid())
    where s.id = target_student and s.is_active and (
      (p.role = 'student' and s.profile_id = p.id)
      or (p.role = 'parent' and exists (
        select 1 from public.parent_student_relationships r
        where r.parent_profile_id = p.id and r.student_id = s.id
      ))
    )
  );
$$;
revoke all on function school_private.can_manage_task_feedback(uuid), school_private.can_read_student_feedback(uuid) from public, anon, authenticated;
grant execute on function school_private.can_manage_task_feedback(uuid), school_private.can_read_student_feedback(uuid) to authenticated;

alter table public.task_feedback enable row level security;
revoke all on public.task_feedback from public, anon, authenticated;
grant select on public.task_feedback to authenticated;
grant insert (submission_id,feedback) on public.task_feedback to authenticated;
grant update (feedback,status) on public.task_feedback to authenticated;
create policy task_feedback_read on public.task_feedback for select to authenticated using (
  school_private.can_manage_task_feedback(submission_id)
  or (status = 'published' and school_private.can_read_student_feedback(student_id))
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('administrator','principal'))
);
create policy task_feedback_insert on public.task_feedback for insert to authenticated with check (
  author_id = (select auth.uid()) and status = 'draft' and school_private.can_manage_task_feedback(submission_id)
);
create policy task_feedback_update on public.task_feedback for update to authenticated using (
  author_id = (select auth.uid()) and school_private.can_manage_task_feedback(submission_id)
) with check (author_id = (select auth.uid()) and school_private.can_manage_task_feedback(submission_id));

create table public.task_feedback_events (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.task_feedback(id),
  actor_id uuid not null default auth.uid() references public.profiles(id),
  feedback text not null,
  status text not null,
  revision integer not null,
  created_at timestamptz not null default now()
);
create index task_feedback_events_feedback_idx on public.task_feedback_events(feedback_id,revision);
create index task_feedback_events_actor_idx on public.task_feedback_events(actor_id);
alter table public.task_feedback_events enable row level security;
revoke all on public.task_feedback_events from public, anon, authenticated;
grant select on public.task_feedback_events to authenticated;
create policy task_feedback_events_read on public.task_feedback_events for select to authenticated using (
  exists (select 1 from public.task_feedback f where f.id = feedback_id and (
    school_private.can_manage_task_feedback(f.submission_id)
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('administrator','principal'))
  ))
);

create function school_private.guard_task_feedback() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not school_private.can_manage_task_feedback(new.submission_id) then
    raise exception 'Active task assignment required' using errcode = '42501';
  end if;
  if tg_op = 'INSERT' then
    select s.task_id,s.student_id,s.student_name into new.task_id,new.student_id,new.student_name
      from public.task_submissions s where s.id = new.submission_id;
  else
    if old.status <> 'draft' then
      raise exception 'Published feedback is immutable' using errcode = '23514';
    end if;
    new.revision := old.revision + 1;
    new.updated_at := now();
    if new.status = 'published' then new.published_at := now(); end if;
  end if;
  return new;
end;
$$;
create function school_private.audit_task_feedback() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.task_feedback_events(feedback_id,feedback,status,revision)
    values (new.id,new.feedback,new.status,new.revision);
  return new;
end;
$$;
revoke all on function school_private.guard_task_feedback(), school_private.audit_task_feedback() from public, anon, authenticated;
create trigger task_feedback_guard before insert or update on public.task_feedback
  for each row execute function school_private.guard_task_feedback();
create trigger task_feedback_audit after insert or update on public.task_feedback
  for each row execute function school_private.audit_task_feedback();
commit;
