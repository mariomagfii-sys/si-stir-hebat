begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('school-documents', 'school-documents', false, 10485760,
  array['application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);

create table public.school_documents (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null default auth.uid() references public.profiles(id),
  category text not null check (category in ('ksp','rkt','rkas','sk','administration','other')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  description text not null default '' check (char_length(description) <= 2000),
  file_path text not null unique check (file_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}-[A-Za-z0-9_.-]{1,100}$'),
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
  file_size integer not null check (file_size between 1 and 10485760),
  status text not null default 'draft' check (status in ('draft','submitted','approved','needs_revision','archived')),
  review_note text not null default '' check (char_length(review_note) <= 2000),
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index school_documents_status_idx on public.school_documents(status, updated_at desc, id);
create index school_documents_owner_idx on public.school_documents(owner_profile_id, updated_at desc, id);

alter table public.school_documents enable row level security;
revoke all on public.school_documents from public, anon, authenticated;
grant select on public.school_documents to authenticated;
grant insert (owner_profile_id,category,title,description,file_path,mime_type,file_size) on public.school_documents to authenticated;
grant update (category,title,description,file_path,mime_type,file_size,status,review_note) on public.school_documents to authenticated;

create function school_private.can_read_school_document(target_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.school_documents d
    join public.profiles p on p.id = (select auth.uid())
    where d.id = target_id and (
      p.role in ('administrator','principal')
      or (p.role = 'teacher' and d.owner_profile_id = p.id)
    )
  );
$$;

create function school_private.can_write_school_document(target_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.school_documents d
    join public.profiles p on p.id = (select auth.uid())
    where d.id = target_id and (
      p.role = 'administrator'
      or (p.role = 'teacher' and d.owner_profile_id = p.id and d.status in ('draft','needs_revision'))
    )
  );
$$;

create policy school_documents_read on public.school_documents for select to authenticated
  using (school_private.can_read_school_document(id));
create policy school_documents_insert on public.school_documents for insert to authenticated
  with check (owner_profile_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('administrator','teacher')));
create policy school_documents_update on public.school_documents for update to authenticated
  using (school_private.can_write_school_document(id) or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'principal'))
  with check (school_private.can_write_school_document(id) or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'principal'));

create function school_private.guard_school_document_update() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare actor_role text;
begin
  select p.role into actor_role from public.profiles p where p.id = (select auth.uid());
  if actor_role = 'teacher' and old.owner_profile_id = (select auth.uid())
     and old.status in ('draft','needs_revision') and new.status in (old.status,'submitted')
     and new.review_note = old.review_note then
    null;
  elsif actor_role = 'principal' and (new.owner_profile_id,new.category,new.title,new.description,new.file_path,new.mime_type,new.file_size)
      is not distinct from (old.owner_profile_id,old.category,old.title,old.description,old.file_path,old.mime_type,old.file_size)
      and ((old.status = 'submitted' and new.status in ('approved','needs_revision') and (new.status = 'approved' or char_length(btrim(new.review_note)) >= 5))
        or (old.status = 'approved' and new.status = 'archived' and new.review_note = old.review_note)) then
    new.review_note := btrim(new.review_note);
  elsif actor_role = 'administrator' and (new.owner_profile_id,new.category,new.title,new.description,new.file_path,new.mime_type,new.file_size)
      is not distinct from (old.owner_profile_id,old.category,old.title,old.description,old.file_path,old.mime_type,old.file_size)
      and new.status in ('approved','archived') then
    null;
  else
    raise exception 'School document transition is not permitted' using errcode = '42501';
  end if;
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end;
$$;

create function school_private.can_read_school_document_path(object_name text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
begin
  if split_part(object_name, '/', 1) !~ '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$' then return false; end if;
  return school_private.can_read_school_document(split_part(object_name, '/', 1)::uuid);
end;
$$;
create function school_private.can_write_school_document_path(object_name text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
begin
  if split_part(object_name, '/', 1) !~ '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$' then return false; end if;
  return exists (
    select 1 from public.school_documents d
    join public.profiles p on p.id = (select auth.uid())
    where d.id = split_part(object_name, '/', 1)::uuid
      and ((p.role = 'administrator') or (p.role = 'teacher' and d.owner_profile_id = p.id and d.status in ('draft','needs_revision')))
  );
end;
$$;

revoke all on function school_private.can_read_school_document(uuid), school_private.can_write_school_document(uuid), school_private.can_read_school_document_path(text), school_private.can_write_school_document_path(text), school_private.guard_school_document_update() from public, anon, authenticated;
grant execute on function school_private.can_read_school_document(uuid), school_private.can_write_school_document(uuid), school_private.can_read_school_document_path(text), school_private.can_write_school_document_path(text) to authenticated;
create trigger school_document_guard before update on public.school_documents for each row execute function school_private.guard_school_document_update();

create policy school_documents_storage_read on storage.objects for select to authenticated using (
  bucket_id = 'school-documents' and school_private.can_read_school_document_path(name)
);
create policy school_documents_storage_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'school-documents' and school_private.can_write_school_document_path(name)
);
create policy school_documents_storage_update on storage.objects for update to authenticated using (
  bucket_id = 'school-documents' and school_private.can_write_school_document_path(name)
) with check (bucket_id = 'school-documents' and school_private.can_write_school_document_path(name));
create policy school_documents_storage_delete on storage.objects for delete to authenticated using (
  bucket_id = 'school-documents' and school_private.can_write_school_document_path(name)
);

commit;
