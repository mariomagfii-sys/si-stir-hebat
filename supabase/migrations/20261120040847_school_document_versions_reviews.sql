begin;

create table public.document_categories (
  key text primary key check (key in ('ksp','rkt','rkas','sk','administration','other')),
  label text not null check (char_length(btrim(label)) between 1 and 80),
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.document_categories(key,label) values
  ('ksp','Kurikulum Satuan Pendidikan'), ('rkt','Rencana Kerja Tahunan'),
  ('rkas','Rencana Kegiatan dan Anggaran Sekolah'), ('sk','Surat Keputusan'),
  ('administration','Administrasi'), ('other','Lainnya');
alter table public.school_documents add constraint school_documents_category_fk
  foreign key (category) references public.document_categories(key);
alter table public.school_documents add constraint school_documents_file_folder_matches_id
  check (split_part(file_path,'/',1)=id::text);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.school_documents(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  file_path text not null unique check (file_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}-[A-Za-z0-9_.-]{1,100}$'),
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
  file_size integer not null check (file_size between 1 and 10485760),
  uploaded_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(document_id,version_number)
);

create table public.document_reviews (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.school_documents(id) on delete cascade,
  reviewer_profile_id uuid not null default auth.uid() references public.profiles(id),
  from_status text not null check (from_status in ('draft','submitted','approved','needs_revision','archived')),
  to_status text not null check (to_status in ('draft','submitted','approved','needs_revision','archived')),
  note text not null default '' check (char_length(note) <= 2000),
  created_at timestamptz not null default now()
);

create table public.school_document_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.school_documents(id) on delete cascade,
  actor_profile_id uuid not null default auth.uid() references public.profiles(id),
  event_type text not null check (event_type in ('created','metadata_updated','version_added','submitted','approved','needs_revision','archived')),
  from_status text,
  to_status text,
  version_number integer,
  created_at timestamptz not null default now()
);

create index document_versions_document_idx on public.document_versions(document_id,version_number desc);
create index document_reviews_document_idx on public.document_reviews(document_id,created_at desc,id desc);
create index school_document_events_document_idx on public.school_document_events(document_id,created_at desc,id desc);
alter table public.document_versions add constraint document_versions_path_matches_document
  check (split_part(file_path,'/',1)=document_id::text);
insert into public.document_versions(document_id,version_number,file_path,mime_type,file_size,uploaded_by,created_at)
select d.id,1,d.file_path,d.mime_type,d.file_size,d.owner_profile_id,d.created_at
from public.school_documents d
where not exists(select 1 from public.document_versions v where v.document_id=d.id);
insert into public.school_document_events(document_id,actor_profile_id,event_type,to_status,version_number,created_at)
select d.id,d.owner_profile_id,'created',d.status,1,d.created_at
from public.school_documents d
where not exists(select 1 from public.school_document_events e where e.document_id=d.id);

alter table public.document_categories enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_reviews enable row level security;
alter table public.school_document_events enable row level security;
revoke all on public.document_categories,public.document_versions,public.document_reviews,public.school_document_events from public,anon,authenticated;
grant select on public.document_categories,public.document_versions,public.document_reviews,public.school_document_events to authenticated;
grant update(label,is_active) on public.document_categories to authenticated;

create policy document_categories_read on public.document_categories for select to authenticated
  using (is_active or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal')));
create policy document_categories_admin_update on public.document_categories for update to authenticated
  using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator'))
  with check (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='administrator'));

create policy document_versions_read on public.document_versions for select to authenticated
  using (school_private.can_read_school_document(document_id));
create policy document_reviews_read on public.document_reviews for select to authenticated
  using (school_private.can_read_school_document(document_id));
create policy school_document_events_read on public.school_document_events for select to authenticated
  using (school_private.can_read_school_document(document_id));

create or replace function school_private.guard_school_document_update() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare actor_role text;
begin
  select p.role into actor_role from public.profiles p where p.id=(select auth.uid());
  if actor_role='teacher' and old.owner_profile_id=(select auth.uid())
     and old.status in ('draft','needs_revision') and new.status in (old.status,'submitted')
     and new.review_note=old.review_note then
    null;
  elsif actor_role='principal' and (new.owner_profile_id,new.category,new.title,new.description,new.file_path,new.mime_type,new.file_size)
      is not distinct from (old.owner_profile_id,old.category,old.title,old.description,old.file_path,old.mime_type,old.file_size)
      and ((old.status='submitted' and new.status in ('approved','needs_revision') and (new.status='approved' or char_length(btrim(new.review_note))>=5))
        or (old.status='approved' and new.status='archived' and new.review_note=old.review_note)) then
    new.review_note:=btrim(new.review_note);
  elsif actor_role='administrator' and new.status=old.status then
    null;
  else
    raise exception 'School document transition is not permitted' using errcode='42501';
  end if;
  new.revision:=old.revision+1;
  new.updated_at:=now();
  return new;
end;
$$;

create function school_private.audit_school_document() returns trigger
language plpgsql security definer set search_path='' as $$
declare next_version integer;
begin
  if tg_op='INSERT' then
    insert into public.document_versions(document_id,version_number,file_path,mime_type,file_size,uploaded_by)
      values(new.id,1,new.file_path,new.mime_type,new.file_size,(select auth.uid()));
    insert into public.school_document_events(document_id,event_type,to_status,version_number)
      values(new.id,'created',new.status,1);
    return new;
  end if;
  if new.file_path is distinct from old.file_path then
    select coalesce(max(v.version_number),0)+1 into next_version from public.document_versions v where v.document_id=new.id;
    insert into public.document_versions(document_id,version_number,file_path,mime_type,file_size,uploaded_by)
      values(new.id,next_version,new.file_path,new.mime_type,new.file_size,(select auth.uid()));
    insert into public.school_document_events(document_id,event_type,from_status,to_status,version_number)
      values(new.id,'version_added',old.status,new.status,next_version);
  elsif (new.status,new.review_note) is distinct from (old.status,old.review_note) then
    insert into public.document_reviews(document_id,from_status,to_status,note)
      values(new.id,old.status,new.status,new.review_note);
    insert into public.school_document_events(document_id,event_type,from_status,to_status)
      values(new.id,new.status,old.status,new.status);
  else
    insert into public.school_document_events(document_id,event_type,from_status,to_status)
      values(new.id,'metadata_updated',old.status,new.status);
  end if;
  return new;
end;
$$;
create trigger school_document_audit after insert or update on public.school_documents
  for each row execute function school_private.audit_school_document();

revoke all on function school_private.audit_school_document() from public,anon,authenticated;

commit;
