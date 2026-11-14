begin;
create table public.attendance_imports (
  id uuid primary key,
  session_id uuid not null references public.attendance_sessions(id),
  source_name text not null check(char_length(btrim(source_name)) between 1 and 120),
  source_sha256 text not null check(source_sha256 ~ '^[a-f0-9]{64}$'),
  changes_sha256 text not null check(changes_sha256 ~ '^[a-f0-9]{64}$'),
  row_count integer not null check(row_count between 1 and 100),
  changed_count integer not null check(changed_count between 0 and row_count),
  actor_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create index attendance_import_session_idx on public.attendance_imports(session_id,created_at desc);
create index attendance_import_actor_idx on public.attendance_imports(actor_id);
alter table public.attendance_imports enable row level security;
revoke all on public.attendance_imports from public,anon,authenticated;
grant select on public.attendance_imports to authenticated;
create policy attendance_imports_read on public.attendance_imports for select to authenticated using (
  (select school_private.can_read_attendance_session(session_id))
  and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal','teacher')));

create function school_private.import_attendance(target_session uuid, changes jsonb, request_id uuid, source_name text, source_sha256 text, source_rows integer) returns integer
language plpgsql security definer set search_path='' as $$
declare target_class uuid; existing public.attendance_imports; changed integer; fingerprint text;
begin
  select class_id into target_class from public.attendance_sessions where id=target_session for update;
  if (select auth.uid()) is null or target_class is null or not school_private.can_manage_attendance(target_class) then
    raise exception 'Attendance import requires an assigned teacher' using errcode='42501';
  end if;
  if request_id is null or source_rows is null or source_rows not between 1 and 100
    or source_name is null or char_length(btrim(source_name)) not between 1 and 120
    or position('/' in source_name)>0 or position(chr(92) in source_name)>0 or source_name ~ '[[:cntrl:]]'
    or source_sha256 is null or source_sha256 !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(changes) is distinct from 'array' then
    raise exception 'Invalid import metadata' using errcode='23514';
  end if;
  if jsonb_array_length(changes) not between 1 and source_rows then
    raise exception 'Import changes exceed declared rows' using errcode='23514';
  end if;
  fingerprint:=encode(sha256(convert_to(changes::text,'UTF8')),'hex');
  select * into existing from public.attendance_imports where id=request_id;
  if found then
    if existing.session_id=target_session and existing.actor_id=(select auth.uid())
      and existing.source_name=btrim(source_name) and existing.source_sha256=source_sha256
      and existing.changes_sha256=fingerprint and existing.row_count=source_rows then
      return existing.changed_count;
    end if;
    raise exception 'Import request identifier already used' using errcode='23505';
  end if;
  changed:=school_private.save_attendance(target_session,changes);
  insert into public.attendance_imports(id,session_id,source_name,source_sha256,changes_sha256,row_count,changed_count,actor_id)
    values(request_id,target_session,btrim(source_name),source_sha256,fingerprint,source_rows,changed,(select auth.uid()));
  return changed;
end;
$$;
revoke all on function school_private.import_attendance(uuid,jsonb,uuid,text,text,integer) from public,anon,authenticated;
grant execute on function school_private.import_attendance(uuid,jsonb,uuid,text,text,integer) to authenticated;
create function public.import_attendance(target_session uuid, changes jsonb, request_id uuid, source_name text, source_sha256 text, source_rows integer) returns integer
language sql security invoker set search_path='' as $$
  select school_private.import_attendance(target_session,changes,request_id,source_name,source_sha256,source_rows);
$$;
revoke all on function public.import_attendance(uuid,jsonb,uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.import_attendance(uuid,jsonb,uuid,text,text,integer) to authenticated;
commit;
