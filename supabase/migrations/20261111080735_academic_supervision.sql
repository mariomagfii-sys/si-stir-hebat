begin;

create table public.academic_supervisions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id),
  created_by uuid not null default auth.uid() references public.profiles(id),
  scheduled_on date not null,
  stage smallint not null default 1 check (stage between 1 and 4),
  focus text not null check (char_length(btrim(focus)) between 1 and 500),
  preparation text not null default '' check (char_length(preparation) <= 4000),
  planning_score smallint check (planning_score between 1 and 4),
  instruction_score smallint check (instruction_score between 1 and 4),
  assessment_score smallint check (assessment_score between 1 and 4),
  observation_notes text not null default '' check (char_length(observation_notes) <= 4000),
  reflection text not null default '' check (char_length(reflection) <= 4000),
  feedback text not null default '' check (char_length(feedback) <= 4000),
  follow_up_plan text not null default '' check (char_length(follow_up_plan) <= 4000),
  target_on date check (target_on >= scheduled_on),
  follow_up_status text not null default 'planned' check (follow_up_status in ('planned','in_progress','complete')),
  follow_up_evaluation text not null default '' check (char_length(follow_up_evaluation) <= 4000),
  published_at timestamptz,
  revision integer not null default 0,
  updated_at timestamptz not null default now()
);

create index academic_supervisions_teacher_idx on public.academic_supervisions(teacher_id, updated_at desc, id);
create index academic_supervisions_author_idx on public.academic_supervisions(created_by);
create index academic_supervisions_updated_idx on public.academic_supervisions(updated_at desc, id);

create table public.academic_supervision_events (
  id bigint generated always as identity primary key,
  supervision_id uuid not null references public.academic_supervisions(id),
  actor_id uuid not null references public.profiles(id),
  stage smallint not null,
  follow_up_status text not null,
  published boolean not null,
  created_at timestamptz not null default now()
);
create index academic_supervision_events_session_idx on public.academic_supervision_events(supervision_id, id);
create index academic_supervision_events_actor_idx on public.academic_supervision_events(actor_id);

alter table public.academic_supervisions enable row level security;
alter table public.academic_supervision_events enable row level security;
revoke all on public.academic_supervisions, public.academic_supervision_events from public, anon, authenticated;
grant select on public.academic_supervisions, public.academic_supervision_events to authenticated;
grant insert (id, teacher_id, scheduled_on, focus, preparation) on public.academic_supervisions to authenticated;
grant update (scheduled_on, stage, focus, preparation, planning_score, instruction_score, assessment_score,
  observation_notes, reflection, feedback, follow_up_plan, target_on, follow_up_status, follow_up_evaluation, published_at)
  on public.academic_supervisions to authenticated;

create policy academic_supervisions_read on public.academic_supervisions for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (
    p.role = 'principal' or (p.role = 'teacher' and published_at is not null and exists (
      select 1 from public.teachers t where t.id = teacher_id and t.profile_id = p.id and t.is_active
    ))
  ))
);
create policy academic_supervisions_create on public.academic_supervisions for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'principal')
  and exists (select 1 from public.teachers t where t.id = teacher_id and t.is_active)
);
create policy academic_supervisions_update on public.academic_supervisions for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'principal')
);
create policy academic_supervision_events_read on public.academic_supervision_events for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'principal')
);

create function school_private.guard_academic_supervision() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if old.published_at is not null or new.stage < old.stage or new.stage > old.stage + 1 then
    raise exception 'Supervision stage transition is not permitted' using errcode = '23514';
  end if;

  if (new.stage >= 2 and new.preparation !~ '[^[:space:]]')
     or (new.stage >= 3 and (new.planning_score is null or new.instruction_score is null
       or new.assessment_score is null or new.observation_notes !~ '[^[:space:]]'))
     or (new.stage >= 4 and (new.reflection !~ '[^[:space:]]' or new.feedback !~ '[^[:space:]]'
       or new.follow_up_plan !~ '[^[:space:]]' or new.target_on is null))
     or (new.stage < 4 and new.follow_up_status <> 'planned')
     or (new.follow_up_status = 'complete' and new.follow_up_evaluation !~ '[^[:space:]]') then
    raise exception 'Supervision stage requirements are incomplete' using errcode = '23514';
  end if;

  if new.published_at is not null then
    if old.stage <> 4 or old.follow_up_status <> 'complete' or new.follow_up_status <> 'complete'
       or (to_jsonb(new) - 'published_at') is distinct from (to_jsonb(old) - 'published_at') then
      raise exception 'Save and complete follow-up before publication' using errcode = '23514';
    end if;
    new.published_at := now();
  end if;

  new.updated_at := now();
  new.revision := old.revision + 1;
  return new;
end;
$$;

create function school_private.audit_academic_supervision() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' or old.stage is distinct from new.stage or old.published_at is distinct from new.published_at
     or old.follow_up_status is distinct from new.follow_up_status or old.scheduled_on is distinct from new.scheduled_on then
    insert into public.academic_supervision_events (supervision_id, actor_id, stage, follow_up_status, published)
      values (new.id, auth.uid(), new.stage, new.follow_up_status, new.published_at is not null);
  end if;
  return new;
end;
$$;

revoke all on function school_private.guard_academic_supervision(), school_private.audit_academic_supervision()
  from public, anon, authenticated;
create trigger academic_supervision_guard before update on public.academic_supervisions
  for each row execute function school_private.guard_academic_supervision();
create trigger academic_supervision_audit after insert or update on public.academic_supervisions
  for each row execute function school_private.audit_academic_supervision();

commit;
