begin;

create function public.discard_unuploaded_school_document_draft(target_id uuid, expected_revision integer)
returns void
language plpgsql security definer set search_path='' as $$
declare draft public.school_documents;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if not exists(select 1 from public.profiles p where p.id=(select auth.uid()) and (
      p.role='administrator' or (p.role='teacher' and exists(select 1 from public.teachers t where t.profile_id=p.id and t.is_active))))
     or not school_private.can_write_school_document(target_id) then
    raise exception 'Document owner permission required' using errcode='42501';
  end if;
  select * into draft from public.school_documents d
    where d.id=target_id and d.owner_profile_id=(select auth.uid())
      and d.status in ('draft','needs_revision') and d.revision=expected_revision
    for update;
  if draft.id is null then raise exception 'Draft not found or revision changed' using errcode='40001'; end if;
  if exists(select 1 from storage.objects o where o.bucket_id='school-documents' and split_part(o.name,'/',1)=draft.id::text) then
    raise exception 'Uploaded object exists; draft cannot be discarded' using errcode='55000';
  end if;
  delete from public.school_documents d where d.id=draft.id;
end;
$$;

revoke all on function public.discard_unuploaded_school_document_draft(uuid,integer) from public,anon,authenticated;
grant execute on function public.discard_unuploaded_school_document_draft(uuid,integer) to authenticated;

commit;
