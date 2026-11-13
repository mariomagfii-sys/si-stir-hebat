begin;
create table public.schedule_proposals (
  id uuid primary key,
  schedule_id uuid not null references public.lesson_schedules(id),
  author_id uuid not null default auth.uid() references public.profiles(id),
  base_revision integer not null,
  original jsonb not null,
  weekday integer not null check(weekday between 1 and 7),
  start_minute integer not null check(start_minute between 0 and 1438),
  end_minute integer not null check(end_minute > start_minute and end_minute <= 1439),
  effective_from date not null check(isfinite(effective_from)),
  effective_until date not null check(isfinite(effective_until) and effective_until >= effective_from),
  reason text not null check(char_length(btrim(reason)) between 5 and 500 and reason ~ '[^[:space:]]'),
  status text not null default 'pending' check(status in ('pending','accepted','rejected')),
  decision_reason text,
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  check((status='pending' and decided_by is null and decided_at is null and decision_reason is null)
    or (status<>'pending' and decided_by is not null and decided_at is not null and char_length(btrim(decision_reason)) between 5 and 500))
);
create unique index schedule_proposals_pending_idx on public.schedule_proposals(schedule_id) where status='pending';
create index schedule_proposals_schedule_idx on public.schedule_proposals(schedule_id);
create index schedule_proposals_author_idx on public.schedule_proposals(author_id);
create index schedule_proposals_decider_idx on public.schedule_proposals(decided_by);
alter table public.schedule_proposals enable row level security;
revoke all on public.schedule_proposals from public,anon,authenticated;
grant select on public.schedule_proposals to authenticated;
create policy schedule_proposals_read on public.schedule_proposals for select to authenticated using (
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal'))
  or (author_id=(select auth.uid()) and exists(select 1 from public.lesson_schedules s
    where s.id=schedule_id and school_private.can_write_journal(s.assignment_id)))
);
create function school_private.propose_schedule(p_id uuid,p_schedule uuid,p_revision integer,p_day integer,
  p_start integer,p_end integer,p_from date,p_until date,p_reason text) returns uuid
language plpgsql security definer set search_path='' as $$
declare s public.lesson_schedules; y public.academic_years;
begin
  select * into s from public.lesson_schedules where id=p_schedule for share;
  if s.id is null or not s.is_active or not school_private.can_write_journal(s.assignment_id) then
    raise exception 'Assigned teacher required' using errcode='42501'; end if;
  if p_revision is null or p_revision<>s.revision then raise exception 'Schedule changed' using errcode='40001'; end if;
  select ay.* into y from public.school_classes c join public.academic_years ay on ay.id=c.academic_year_id where c.id=s.class_id;
  if p_day is null or p_day not between 1 and 7 or p_from is null or p_until is null
    or p_from<y.starts_on or p_until>y.ends_on or p_from+((p_day-extract(isodow from p_from)::int+7)%7)>p_until then
    raise exception 'Invalid calendar' using errcode='23514'; end if;
  insert into public.schedule_proposals(id,schedule_id,base_revision,original,weekday,start_minute,end_minute,effective_from,effective_until,reason)
    values(p_id,p_schedule,p_revision,to_jsonb(s),p_day,p_start,p_end,p_from,p_until,btrim(p_reason));
  return p_id;
end; $$;
create function public.propose_schedule(p_id uuid,p_schedule uuid,p_revision integer,p_day integer,
  p_start integer,p_end integer,p_from date,p_until date,p_reason text) returns uuid
language sql security invoker set search_path='' as $$
  select school_private.propose_schedule(p_id,p_schedule,p_revision,p_day,p_start,p_end,p_from,p_until,p_reason);
$$;
create function school_private.decide_schedule_proposal(p_id uuid,p_accept boolean,p_reason text) returns uuid
language plpgsql security definer set search_path='' as $$
declare p public.schedule_proposals; s public.lesson_schedules;
begin
  perform 1 from public.profiles where id=(select auth.uid()) and role='administrator' for share;
  if not found then raise exception 'Administrator required' using errcode='42501'; end if;
  if p_accept is null or p_reason is null or char_length(btrim(p_reason)) not between 5 and 500 or p_reason !~ '[^[:space:]]' then
    raise exception 'Decision reason required' using errcode='23514'; end if;
  -- Same serialization order as direct schedule edits.
  perform pg_advisory_xact_lock(20261112,1);
  select * into p from public.schedule_proposals where id=p_id for update;
  if p.id is null or p.status<>'pending' then raise exception 'Proposal already decided' using errcode='40001'; end if;
  if p_accept then
    select * into s from public.lesson_schedules where id=p.schedule_id for update;
    if not s.is_active then raise exception 'Schedule inactive' using errcode='23514'; end if;
    if not exists(select 1 from public.teacher_assignments a join public.teachers t on t.id=a.teacher_id
      join public.profiles pr on pr.id=t.profile_id and pr.role='teacher'
      where a.id=s.assignment_id and t.profile_id=p.author_id and a.is_active and t.is_active) then
      raise exception 'Proposer assignment revoked' using errcode='23514'; end if;
    perform school_private.save_lesson_schedule(s.id,p.base_revision,s.assignment_id,p.weekday,p.start_minute,p.end_minute,
      p.effective_from,p.effective_until,true,btrim(p_reason));
  end if;
  update public.schedule_proposals set status=case when p_accept then 'accepted' else 'rejected' end,
    decision_reason=btrim(p_reason),decided_by=(select auth.uid()),decided_at=now() where id=p_id;
  return p_id;
end; $$;
create function public.decide_schedule_proposal(p_id uuid,p_accept boolean,p_reason text) returns uuid
language sql security invoker set search_path='' as $$ select school_private.decide_schedule_proposal(p_id,p_accept,p_reason); $$;
revoke all on function school_private.propose_schedule(uuid,uuid,integer,integer,integer,integer,date,date,text),
  public.propose_schedule(uuid,uuid,integer,integer,integer,integer,date,date,text),
  school_private.decide_schedule_proposal(uuid,boolean,text),public.decide_schedule_proposal(uuid,boolean,text) from public,anon,authenticated;
grant execute on function school_private.propose_schedule(uuid,uuid,integer,integer,integer,integer,date,date,text),
  public.propose_schedule(uuid,uuid,integer,integer,integer,integer,date,date,text),
  school_private.decide_schedule_proposal(uuid,boolean,text),public.decide_schedule_proposal(uuid,boolean,text) to authenticated;
commit;
