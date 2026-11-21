begin;

create table public.teacher_attendance (
  id uuid primary key default gen_random_uuid(),
  teacher_profile_id uuid not null references public.profiles(id),
  attendance_on date not null check (isfinite(attendance_on)),
  check_in_at timestamptz,
  check_out_at timestamptz,
  check_in_request_id uuid not null unique,
  check_out_request_id uuid unique,
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(teacher_profile_id,attendance_on),
  check (check_out_at is null or check_in_at is not null),
  check (check_out_at is null or check_out_at >= check_in_at)
);
create index teacher_attendance_day_idx on public.teacher_attendance(attendance_on desc,teacher_profile_id);

create table public.teacher_attendance_corrections (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  attendance_id uuid not null references public.teacher_attendance(id),
  requester_profile_id uuid not null default auth.uid() references public.profiles(id),
  proposed_check_in_at timestamptz,
  proposed_check_out_at timestamptz,
  reason text not null check (char_length(btrim(reason)) between 5 and 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_note text not null default '' check (char_length(review_note) <= 1000),
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  check (proposed_check_in_at is not null or proposed_check_out_at is not null),
  check (proposed_check_out_at is null or proposed_check_in_at is not null and proposed_check_out_at >= proposed_check_in_at),
  check ((status='pending' and reviewed_by is null and reviewed_at is null)
    or (status in ('approved','rejected') and reviewed_by is not null and reviewed_at is not null))
);
create index teacher_attendance_corrections_queue_idx on public.teacher_attendance_corrections(status,created_at desc,id);
create index teacher_attendance_corrections_owner_idx on public.teacher_attendance_corrections(requester_profile_id,created_at desc,id);

create table public.teacher_attendance_events (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid references public.teacher_attendance(id),
  correction_id uuid references public.teacher_attendance_corrections(id),
  actor_profile_id uuid not null default auth.uid() references public.profiles(id),
  event_type text not null check (event_type in ('check_in','check_out','corrected','correction_submitted','correction_approved','correction_rejected')),
  old_check_in_at timestamptz,
  new_check_in_at timestamptz,
  old_check_out_at timestamptz,
  new_check_out_at timestamptz,
  reason text not null default '' check (char_length(reason) <= 1000),
  created_at timestamptz not null default now(),
  check ((attendance_id is not null) or (correction_id is not null))
);
create index teacher_attendance_events_record_idx on public.teacher_attendance_events(attendance_id,created_at desc,id);

alter table public.teacher_attendance enable row level security;
alter table public.teacher_attendance_corrections enable row level security;
alter table public.teacher_attendance_events enable row level security;
revoke all on public.teacher_attendance,public.teacher_attendance_corrections,public.teacher_attendance_events from public,anon,authenticated;
grant select on public.teacher_attendance,public.teacher_attendance_corrections,public.teacher_attendance_events to authenticated;

create function school_private.can_read_teacher_attendance(target_profile uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p where p.id=(select auth.uid()) and (
    p.role in ('administrator','principal')
    or (p.role='teacher' and p.id=target_profile and exists(select 1 from public.teachers t where t.profile_id=p.id and t.is_active))
  ));
$$;
create policy teacher_attendance_read on public.teacher_attendance for select to authenticated
  using(school_private.can_read_teacher_attendance(teacher_profile_id));
create policy teacher_attendance_corrections_read on public.teacher_attendance_corrections for select to authenticated
  using(school_private.can_read_teacher_attendance(requester_profile_id));
create policy teacher_attendance_events_read on public.teacher_attendance_events for select to authenticated
  using(exists(select 1 from public.teacher_attendance a where a.id=attendance_id and school_private.can_read_teacher_attendance(a.teacher_profile_id))
    or exists(select 1 from public.teacher_attendance_corrections c where c.id=correction_id and school_private.can_read_teacher_attendance(c.requester_profile_id)));

create function school_private.audit_teacher_attendance() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='INSERT' then
    insert into public.teacher_attendance_events(attendance_id,event_type,new_check_in_at)
      values(new.id,'check_in',new.check_in_at);
  elsif old.check_in_at is distinct from new.check_in_at or old.check_out_at is distinct from new.check_out_at then
    insert into public.teacher_attendance_events(attendance_id,event_type,old_check_in_at,new_check_in_at,old_check_out_at,new_check_out_at)
      values(new.id,case when old.check_out_at is null and new.check_out_at is not null then 'check_out' else 'corrected' end,
        old.check_in_at,new.check_in_at,old.check_out_at,new.check_out_at);
  end if;
  return new;
end;
$$;
create trigger teacher_attendance_audit after insert or update on public.teacher_attendance
  for each row execute function school_private.audit_teacher_attendance();

create function public.record_teacher_attendance(requested_action text, requested_id uuid)
returns public.teacher_attendance
language plpgsql security definer set search_path='' as $$
declare
  actor uuid := (select auth.uid());
  today_local date := (now() at time zone 'Asia/Jakarta')::date;
  result public.teacher_attendance;
  existing public.teacher_attendance;
begin
  if actor is null or not exists(select 1 from public.profiles p join public.teachers t on t.profile_id=p.id and t.is_active where p.id=actor and p.role='teacher') then
    raise exception 'Active teacher profile required' using errcode='42501';
  end if;
  if requested_action not in ('check_in','check_out') or requested_id is null then
    raise exception 'Invalid attendance request' using errcode='22023';
  end if;
  select * into existing from public.teacher_attendance a where a.check_in_request_id=requested_id or a.check_out_request_id=requested_id;
  if existing.id is not null then
    if existing.teacher_profile_id=actor and ((requested_action='check_in' and existing.check_in_request_id=requested_id) or (requested_action='check_out' and existing.check_out_request_id=requested_id)) then return existing; end if;
    raise exception 'Request ID already used' using errcode='23505';
  end if;
  if requested_action='check_in' then
    insert into public.teacher_attendance(teacher_profile_id,attendance_on,check_in_at,check_in_request_id)
      values(actor,today_local,now(),requested_id) returning * into result;
  else
    update public.teacher_attendance a set check_out_at=now(),check_out_request_id=requested_id,revision=a.revision+1,updated_at=now()
      where a.teacher_profile_id=actor and a.attendance_on=today_local and a.check_in_at is not null and a.check_out_at is null
      returning * into result;
    if result.id is null then raise exception 'Check-in record not found or already closed' using errcode='P0002'; end if;
  end if;
  return result;
end;
$$;

create function public.request_teacher_attendance_correction(
  requested_id uuid, requested_day date, proposed_check_in timestamptz,
  proposed_check_out timestamptz, requested_reason text
) returns public.teacher_attendance_corrections
language plpgsql security definer set search_path='' as $$
declare
  actor uuid := (select auth.uid());
  attendance_row public.teacher_attendance;
  result public.teacher_attendance_corrections;
begin
  if actor is null or not exists(select 1 from public.profiles p join public.teachers t on t.profile_id=p.id and t.is_active where p.id=actor and p.role='teacher') then
    raise exception 'Active teacher profile required' using errcode='42501';
  end if;
  if requested_id is null or requested_day is null or requested_day>(now() at time zone 'Asia/Jakarta')::date
     or char_length(btrim(coalesce(requested_reason,''))) not between 5 and 1000
     or (proposed_check_in is null and proposed_check_out is null)
     or (proposed_check_out is not null and (proposed_check_in is null or proposed_check_out<proposed_check_in))
     or (proposed_check_in is not null and (proposed_check_in at time zone 'Asia/Jakarta')::date<>requested_day)
     or (proposed_check_out is not null and (proposed_check_out at time zone 'Asia/Jakarta')::date<>requested_day) then
    raise exception 'Invalid correction request' using errcode='22023';
  end if;
  select * into result from public.teacher_attendance_corrections c where c.request_id=requested_id;
  if result.id is not null then
    if result.requester_profile_id=actor then return result; end if;
    raise exception 'Request ID already used' using errcode='23505';
  end if;
  select * into attendance_row from public.teacher_attendance a where a.teacher_profile_id=actor and a.attendance_on=requested_day for update;
  if attendance_row.id is null then raise exception 'Teacher attendance record not found' using errcode='P0002'; end if;
  insert into public.teacher_attendance_corrections(request_id,attendance_id,requester_profile_id,proposed_check_in_at,proposed_check_out_at,reason)
    values(requested_id,attendance_row.id,actor,proposed_check_in,proposed_check_out,btrim(requested_reason)) returning * into result;
  insert into public.teacher_attendance_events(attendance_id,correction_id,event_type,old_check_in_at,new_check_in_at,old_check_out_at,new_check_out_at,reason)
    values(attendance_row.id,result.id,'correction_submitted',attendance_row.check_in_at,proposed_check_in,attendance_row.check_out_at,proposed_check_out,btrim(requested_reason));
  return result;
end;
$$;

create function public.review_teacher_attendance_correction(target_id uuid,expected_revision integer,decision text,note text)
returns public.teacher_attendance_corrections
language plpgsql security definer set search_path='' as $$
declare
  actor uuid := (select auth.uid());
  correction public.teacher_attendance_corrections;
  attendance_row public.teacher_attendance;
  result public.teacher_attendance_corrections;
begin
  if actor is null or not exists(select 1 from public.profiles p where p.id=actor and p.role='principal') then
    raise exception 'Principal approval required' using errcode='42501';
  end if;
  if decision not in ('approved','rejected') or char_length(btrim(coalesce(note,'')))>1000 then
    raise exception 'Invalid correction review' using errcode='22023';
  end if;
  select * into correction from public.teacher_attendance_corrections c where c.id=target_id and c.status='pending' and c.revision=expected_revision for update;
  if correction.id is null then raise exception 'Correction revision changed' using errcode='40001'; end if;
  if decision='approved' then
    select * into attendance_row from public.teacher_attendance a where a.id=correction.attendance_id for update;
    update public.teacher_attendance a set check_in_at=coalesce(correction.proposed_check_in_at,a.check_in_at),
      check_out_at=coalesce(correction.proposed_check_out_at,a.check_out_at),revision=a.revision+1,updated_at=now()
      where a.id=attendance_row.id;
  end if;
  update public.teacher_attendance_corrections c set status=decision,reviewed_by=actor,reviewed_at=now(),review_note=btrim(coalesce(note,'')),revision=c.revision+1
    where c.id=target_id returning * into result;
  insert into public.teacher_attendance_events(attendance_id,correction_id,event_type,old_check_in_at,new_check_in_at,old_check_out_at,new_check_out_at,reason)
    values(correction.attendance_id,correction.id,case when decision='approved' then 'correction_approved' else 'correction_rejected' end,
      attendance_row.check_in_at,coalesce(correction.proposed_check_in_at,attendance_row.check_in_at),
      attendance_row.check_out_at,coalesce(correction.proposed_check_out_at,attendance_row.check_out_at),correction.reason);
  return result;
end;
$$;

revoke all on function school_private.can_read_teacher_attendance(uuid),public.record_teacher_attendance(text,uuid),
  public.request_teacher_attendance_correction(uuid,date,timestamptz,timestamptz,text),
  public.review_teacher_attendance_correction(uuid,integer,text,text),school_private.audit_teacher_attendance() from public,anon,authenticated;
grant execute on function school_private.can_read_teacher_attendance(uuid),public.record_teacher_attendance(text,uuid),
  public.request_teacher_attendance_correction(uuid,date,timestamptz,timestamptz,text),
  public.review_teacher_attendance_correction(uuid,integer,text,text) to authenticated;

commit;
