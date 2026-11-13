begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('supervision-evidence', 'supervision-evidence', false, 10485760,
  array['application/pdf','image/jpeg','image/png']);

create function school_private.can_write_supervision_evidence(object_name text) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  session_id uuid;
begin
  if object_name !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}-[A-Za-z0-9_.-]{1,100}$'
     or split_part(object_name, '/', 1) !~ '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$' then
    return false;
  end if;
  session_id := split_part(object_name, '/', 1)::uuid;

  perform 1 from public.academic_supervisions s
    join public.profiles p on p.id = (select auth.uid()) and p.role = 'principal'
    where s.id = session_id and s.stage = 4 and s.published_at is null
    for share of s, p;
  return found;
end;
$$;

revoke all on function school_private.can_write_supervision_evidence(text) from public, anon, authenticated;
grant execute on function school_private.can_write_supervision_evidence(text) to authenticated;

create policy supervision_evidence_read on storage.objects for select to authenticated using (
  bucket_id = 'supervision-evidence'
  and exists (
    select 1 from public.academic_supervisions s
    where s.id = case
      when split_part(storage.objects.name, '/', 1) ~ '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$'
      then split_part(storage.objects.name, '/', 1)::uuid
    end
    and s.stage = 4
  )
);

create policy supervision_evidence_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'supervision-evidence' and school_private.can_write_supervision_evidence(name)
);
create policy supervision_evidence_delete on storage.objects for delete to authenticated using (
  bucket_id = 'supervision-evidence' and school_private.can_write_supervision_evidence(name)
);

commit;
