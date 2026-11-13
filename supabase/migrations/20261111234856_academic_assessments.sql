begin;

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teacher_assignments(id),
  class_id uuid not null references public.school_classes(id),
  author_id uuid not null default auth.uid() references public.profiles(id),
  title text not null check (char_length(btrim(title)) between 1 and 160 and title ~ '[^[:space:]]'),
  assessment_type text not null check (assessment_type in ('formative','summative','project','practical','character')),
  held_on date not null,
  maximum_score numeric not null check (maximum_score > 0 and maximum_score <= 100000 and scale(maximum_score) <= 2),
  class_name text not null,
  subject_name text not null,
  status text not null default 'draft' check (status in ('draft','published')),
  revision integer not null default 0,
  student_count integer not null default 0,
  graded_count integer not null default 0,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);
create index assessments_assignment_idx on public.assessments(assignment_id);
create index assessments_class_idx on public.assessments(class_id);
create index assessments_author_idx on public.assessments(author_id);
create index assessments_date_idx on public.assessments(held_on desc,id);

create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id),
  student_id uuid not null references public.students(id),
  student_code text not null,
  student_name text not null,
  score numeric check (score >= 0 and score <= 100000 and scale(score) <= 2),
  feedback text not null default '' check (char_length(feedback) <= 3000),
  change_reason text not null default '' check (char_length(change_reason) <= 1000),
  revision integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (assessment_id,student_id)
);
create index assessment_results_student_idx on public.assessment_results(student_id);
create index assessment_results_roster_idx on public.assessment_results(assessment_id,student_name,id);

create table public.assessment_result_events (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.assessment_results(id),
  actor_id uuid not null default auth.uid() references public.profiles(id),
  old_score numeric,
  score numeric,
  feedback text not null,
  change_reason text not null,
  revision integer not null,
  created_at timestamptz not null default now()
);
create index assessment_result_events_result_idx on public.assessment_result_events(result_id,revision desc);
create index assessment_result_events_actor_idx on public.assessment_result_events(actor_id);

create function school_private.can_manage_assessment(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.assessments a where a.id = target
    and a.author_id = (select auth.uid()) and school_private.can_write_journal(a.assignment_id));
$$;
create function school_private.can_read_assessment(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.assessments a where a.id = target and (
    (a.author_id = (select auth.uid()) and school_private.can_write_journal(a.assignment_id))
    or exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('administrator','principal'))
    or (a.status = 'published' and exists(select 1 from public.assessment_results r
      where r.assessment_id = a.id and school_private.can_read_student_feedback(r.student_id)))
  ));
$$;
revoke all on function school_private.can_manage_assessment(uuid), school_private.can_read_assessment(uuid) from public, anon, authenticated;
grant execute on function school_private.can_manage_assessment(uuid), school_private.can_read_assessment(uuid) to authenticated;

alter table public.assessments enable row level security;
alter table public.assessment_results enable row level security;
alter table public.assessment_result_events enable row level security;
revoke all on public.assessments, public.assessment_results, public.assessment_result_events from public, anon, authenticated;
grant select on public.assessments, public.assessment_results, public.assessment_result_events to authenticated;
grant insert (id,assignment_id,title,assessment_type,held_on,maximum_score) on public.assessments to authenticated;
grant update (title,assessment_type,held_on,maximum_score,status) on public.assessments to authenticated;
grant update (score,feedback,change_reason) on public.assessment_results to authenticated;
create policy assessments_read on public.assessments for select to authenticated using (
  (author_id = (select auth.uid()) and school_private.can_write_journal(assignment_id))
  or exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('administrator','principal'))
  or (status = 'published' and school_private.can_read_assessment(id))
);
create policy assessments_insert on public.assessments for insert to authenticated with check (
  author_id = (select auth.uid()) and status = 'draft' and school_private.can_write_journal(assignment_id)
);
create policy assessments_update on public.assessments for update to authenticated using (school_private.can_manage_assessment(id))
  with check (school_private.can_manage_assessment(id));
create policy assessment_results_read on public.assessment_results for select to authenticated using (
  school_private.can_manage_assessment(assessment_id)
  or exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('administrator','principal'))
  or (school_private.can_read_student_feedback(student_id) and exists(
    select 1 from public.assessments a where a.id = assessment_id and a.status = 'published'))
);
create policy assessment_results_update on public.assessment_results for update to authenticated
  using (school_private.can_manage_assessment(assessment_id)) with check (school_private.can_manage_assessment(assessment_id));
create policy assessment_result_events_read on public.assessment_result_events for select to authenticated using (
  exists(select 1 from public.assessment_results r where r.id = result_id and (
    school_private.can_manage_assessment(r.assessment_id)
    or exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('administrator','principal'))
  ))
);

create function school_private.guard_assessment() returns trigger
language plpgsql security definer set search_path = '' as $$
declare first_day date; last_day date;
begin
  if new.author_id is distinct from (select auth.uid()) or not school_private.can_write_journal(new.assignment_id) then
    raise exception 'Assigned teacher required' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' then
    -- Only internal triggers can write revision/count columns (no client column grants).
    if new.revision = old.revision + 1 and
      (new.title,new.assessment_type,new.held_on,new.maximum_score,new.status) is not distinct from
      (old.title,old.assessment_type,old.held_on,old.maximum_score,old.status) then
      new.updated_at := now();
      return new;
    end if;
    if old.status <> 'draft' then raise exception 'Published assessment metadata is fixed' using errcode = '23514'; end if;
    if exists(select 1 from public.assessment_results r where r.assessment_id = old.id and r.score > new.maximum_score) then
      raise exception 'Maximum score below existing results' using errcode = '23514';
    end if;
    if new.status = 'published' then
      if new.held_on > (now() at time zone 'Asia/Jakarta')::date
        or not exists(select 1 from public.assessment_results r where r.assessment_id = old.id)
        or exists(select 1 from public.assessment_results r where r.assessment_id = old.id and r.score is null) then
        raise exception 'All participants must be graded before publication' using errcode = '23514';
      end if;
      new.published_at := now();
    end if;
    new.revision := old.revision + 1;
    new.updated_at := now();
  end if;
  select c.id,c.name,s.name,y.starts_on,y.ends_on into new.class_id,new.class_name,new.subject_name,first_day,last_day
    from public.teacher_assignments a join public.school_classes c on c.id = a.class_id
    join public.subjects s on s.id = a.subject_id join public.academic_years y on y.id = c.academic_year_id
    where a.id = new.assignment_id;
  if first_day is null or new.held_on not between first_day and last_day then
    raise exception 'Assessment date must be within the academic year' using errcode = '23514';
  end if;
  return new;
end;
$$;

create function school_private.create_assessment_roster() returns trigger
language plpgsql security definer set search_path = '' as $$
declare roster_count integer;
begin
  insert into public.assessment_results(assessment_id,student_id,student_code,student_name)
    select new.id,s.id,s.code,s.name from public.class_enrollments e
    join public.students s on s.id = e.student_id and s.is_active
    where e.class_id = new.class_id and e.is_active;
  get diagnostics roster_count = row_count;
  if roster_count = 0 then raise exception 'Assessment needs active students' using errcode = '23514'; end if;
  update public.assessments set student_count = roster_count, revision = revision + 1 where id = new.id;
  return new;
end;
$$;

create function school_private.guard_assessment_result() returns trigger
language plpgsql security definer set search_path = '' as $$
declare assessment public.assessments;
begin
  select * into assessment from public.assessments where id = old.assessment_id for update;
  if not school_private.can_manage_assessment(assessment.id) then
    raise exception 'Assigned teacher required' using errcode = '42501';
  end if;
  if new.score > assessment.maximum_score then
    raise exception 'Score exceeds assessment maximum' using errcode = '23514';
  end if;
  if assessment.status = 'published' and (new.score is null or char_length(btrim(new.change_reason)) < 5 or new.change_reason !~ '[^[:space:]]') then
    raise exception 'Published correction requires a score and reason' using errcode = '23514';
  end if;
  if char_length(new.change_reason) > 1000 then
    raise exception 'Correction reason is too long' using errcode = '23514';
  end if;
  new.revision := old.revision + 1;
  new.updated_at := now();
  insert into public.assessment_result_events(result_id,old_score,score,feedback,change_reason,revision)
    values (new.id,old.score,new.score,new.feedback,new.change_reason,new.revision);
  -- This column is an input for this mutation only; a later correction must
  -- supply its own reason instead of silently reusing an earlier explanation.
  new.change_reason := '';
  return new;
end;
$$;

create function school_private.audit_assessment_result() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.assessments set revision = revision + 1,
    graded_count = graded_count + case when old.score is null and new.score is not null then 1
      when old.score is not null and new.score is null then -1 else 0 end
    where id = new.assessment_id;
  return new;
end;
$$;
revoke all on function school_private.guard_assessment(), school_private.create_assessment_roster(),
  school_private.guard_assessment_result(), school_private.audit_assessment_result() from public, anon, authenticated;
create trigger assessment_guard before insert or update on public.assessments for each row execute function school_private.guard_assessment();
create trigger assessment_roster after insert on public.assessments for each row execute function school_private.create_assessment_roster();
create trigger assessment_result_guard before update on public.assessment_results for each row execute function school_private.guard_assessment_result();
create trigger assessment_result_audit after update on public.assessment_results for each row execute function school_private.audit_assessment_result();

commit;
