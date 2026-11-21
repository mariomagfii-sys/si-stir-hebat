begin;

create table public.grading_settings (
 id boolean primary key default true check(id), kkm numeric(5,2) not null default 75 check(kkm between 0 and 100),
 updated_at timestamptz not null default now(), updated_by uuid references public.profiles(id) on delete set null
);
insert into public.grading_settings(id,kkm) values(true,75);
alter table public.grading_settings enable row level security;
revoke all on public.grading_settings from public,anon,authenticated;
grant select on public.grading_settings to authenticated;
grant update(kkm) on public.grading_settings to authenticated;
create policy grading_settings_read on public.grading_settings for select to authenticated using (
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal','teacher','student','parent'))
);
create policy grading_settings_admin_update on public.grading_settings for update to authenticated
 using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator'))
 with check(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator'));

create table public.retention_policies (
 category text primary key check(category in ('registry','attendance','grades','journals','audit','communications','supervision_evidence')),
 retention_years integer not null check(retention_years between 0 and 100),
 retention_unit text not null default 'academic_years' check(retention_unit in ('academic_years','calendar_years')),
 action text not null default 'delete' check(action in ('delete','archive','retain')),
 updated_at timestamptz not null default now(), updated_by uuid references public.profiles(id) on delete set null
);
insert into public.retention_policies(category,retention_years,retention_unit,action) values
 ('registry',5,'academic_years','delete'),('attendance',5,'academic_years','delete'),('grades',5,'academic_years','delete'),
 ('journals',5,'academic_years','delete'),('audit',5,'calendar_years','delete'),('communications',1,'academic_years','delete'),
 ('supervision_evidence',1,'academic_years','delete');
alter table public.retention_policies enable row level security;
revoke all on public.retention_policies from public,anon,authenticated;
grant select on public.retention_policies to authenticated;
grant update(retention_years,retention_unit,action) on public.retention_policies to authenticated;
create policy retention_admin_read on public.retention_policies for select to authenticated using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator'));
create policy retention_principal_read on public.retention_policies for select to authenticated using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='principal'));
create policy retention_admin_update on public.retention_policies for update to authenticated
 using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator'))
 with check(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator'));

create table public.teacher_attendance_status_types (
 code text primary key check(code ~ '^[a-z][a-z0-9_]{0,39}$'), label text not null check(char_length(btrim(label)) between 1 and 80),
 is_active boolean not null default true, created_at timestamptz not null default now()
);
insert into public.teacher_attendance_status_types(code,label) values
 ('present','Hadir'),('late','Terlambat'),('sick','Sakit'),('leave','Izin'),('absent','Tidak hadir');
alter table public.teacher_attendance_status_types enable row level security;
revoke all on public.teacher_attendance_status_types from public,anon,authenticated;
grant select on public.teacher_attendance_status_types to authenticated;
grant insert(code,label,is_active) on public.teacher_attendance_status_types to authenticated;
create policy teacher_attendance_status_school_read on public.teacher_attendance_status_types for select to authenticated
 using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal','teacher','parent')));
create policy teacher_attendance_status_admin_insert on public.teacher_attendance_status_types for insert to authenticated
 with check(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator'));

create table public.teacher_document_types (
 id uuid primary key default gen_random_uuid(), name text not null check(char_length(btrim(name)) between 1 and 120),
 category text not null check(category in ('perencanaan','pembelajaran','penilaian','administrasi','lainnya')),
 is_active boolean not null default true, created_at timestamptz not null default now()
);
create unique index teacher_document_types_name_lower_uq on public.teacher_document_types(lower(name));
alter table public.teacher_document_types enable row level security;
revoke all on public.teacher_document_types from public,anon,authenticated;
grant select on public.teacher_document_types to authenticated;
grant insert(name,category,is_active) on public.teacher_document_types to authenticated;
create policy teacher_document_types_school_read on public.teacher_document_types for select to authenticated using(
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal','teacher')));
create policy teacher_document_types_admin_insert on public.teacher_document_types for insert to authenticated
 with check(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator'));

create table public.school_calendar_events (
 id uuid primary key default gen_random_uuid(), event_date date not null check(isfinite(event_date)), end_date date check(end_date is null or isfinite(end_date)),
 kind text not null check(kind in ('hari_besar','libur','kegiatan','akademik','lainnya')),
 title text not null check(char_length(btrim(title)) between 1 and 160), description text not null default '' check(char_length(description)<=2000),
 created_by uuid not null default auth.uid() references public.profiles(id), created_at timestamptz not null default now(),
 check(end_date is null or end_date>=event_date)
);
create index school_calendar_events_date_idx on public.school_calendar_events(event_date,end_date,id);
alter table public.school_calendar_events enable row level security;
revoke all on public.school_calendar_events from public,anon,authenticated;
grant select on public.school_calendar_events to authenticated;
grant insert(event_date,end_date,kind,title,description) on public.school_calendar_events to authenticated;
create policy school_calendar_events_school_read on public.school_calendar_events for select to authenticated using(
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal','teacher','student','parent')));
create policy school_calendar_events_admin_insert on public.school_calendar_events for insert to authenticated with check(
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator') and created_by=(select auth.uid()));

create table public.deletion_requests (
 id uuid primary key default gen_random_uuid(), requester_name text not null check(char_length(btrim(requester_name)) between 1 and 160),
 subject_type text not null check(subject_type in ('student','teacher','parent','other')),
 subject_description text not null check(char_length(btrim(subject_description)) between 1 and 1000),
 reason text not null check(char_length(btrim(reason)) between 1 and 2000),
 status text not null default 'pending' check(status in ('pending','approved','rejected','executed')),
 decision_note text not null default '' check(char_length(decision_note)<=2000), execution_note text not null default '' check(char_length(execution_note)<=2000),
 decided_by uuid references public.profiles(id), decided_at timestamptz, executed_by uuid references public.profiles(id), executed_at timestamptz,
 created_by uuid not null default auth.uid() references public.profiles(id), created_at timestamptz not null default now(),
 check((status='pending' and decided_by is null and decided_at is null and executed_by is null and executed_at is null)
 or (status in ('approved','rejected') and decided_by is not null and decided_at is not null and executed_by is null and executed_at is null)
 or (status='executed' and decided_by is not null and decided_at is not null and executed_by is not null and executed_at is not null))
);
create index deletion_requests_queue_idx on public.deletion_requests(status,created_at,id);
alter table public.deletion_requests enable row level security;
revoke all on public.deletion_requests from public,anon,authenticated;
grant select on public.deletion_requests to authenticated;
grant insert(requester_name,subject_type,subject_description,reason) on public.deletion_requests to authenticated;
create policy deletion_requests_admin_read on public.deletion_requests for select to authenticated using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator'));
create policy deletion_requests_principal_read on public.deletion_requests for select to authenticated using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='principal'));
create policy deletion_requests_admin_insert on public.deletion_requests for insert to authenticated with check(
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator') and created_by=(select auth.uid()));

create function public.decide_deletion_request(target_id uuid, approved boolean, note text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='principal') then raise exception 'Hanya kepala sekolah dapat memutuskan permintaan' using errcode='42501'; end if;
 if approved is null or char_length(btrim(coalesce(note,''))) not between 3 and 2000 then raise exception 'Catatan keputusan tidak valid' using errcode='22023'; end if;
 update public.deletion_requests set status=case when approved then 'approved' else 'rejected' end, decision_note=btrim(note),decided_by=(select auth.uid()),decided_at=now()
 where id=target_id and status='pending';
 if not found then raise exception 'Permintaan tidak ditemukan atau sudah diputuskan' using errcode='40001'; end if;
end;
$$;
create function public.execute_deletion_request(target_id uuid, note text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator') then raise exception 'Hanya administrator dapat mencatat pelaksanaan' using errcode='42501'; end if;
 if char_length(btrim(coalesce(note,''))) not between 3 and 2000 then raise exception 'Catatan pelaksanaan tidak valid' using errcode='22023'; end if;
 update public.deletion_requests set status='executed',execution_note=btrim(note),executed_by=(select auth.uid()),executed_at=now()
 where id=target_id and status='approved';
 if not found then raise exception 'Permintaan belum disetujui atau sudah dilaksanakan' using errcode='40001'; end if;
end;
$$;
revoke all on function public.decide_deletion_request(uuid,boolean,text),public.execute_deletion_request(uuid,text) from public,anon,authenticated;
grant execute on function public.decide_deletion_request(uuid,boolean,text),public.execute_deletion_request(uuid,text) to authenticated;

commit;
