begin;

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 160 and title ~ '[^[:space:]]'),
  body text not null check (char_length(btrim(body)) between 1 and 10000 and body ~ '[^[:space:]]'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);

create index announcements_feed_idx on public.announcements (created_at desc, id desc);
create index announcements_author_idx on public.announcements (created_by);
alter table public.announcements enable row level security;
revoke all on public.announcements from public, anon, authenticated;
grant select, insert on public.announcements to authenticated;
grant update (title, body, status) on public.announcements to authenticated;

-- The existing profile policies restrict this lookup to the caller's profile.
-- No privileged function or user-editable JWT metadata is used for school roles.
create policy announcements_read on public.announcements
for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid())
    and (p.role in ('administrator', 'principal')
      or (p.role in ('teacher', 'student', 'parent') and status = 'published')))
);

create policy announcements_create on public.announcements
for insert to authenticated with check (
  created_by = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid())
      and p.role in ('administrator', 'principal'))
);

create policy announcements_edit on public.announcements
for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid())
    and p.role in ('administrator', 'principal'))
) with check (
  exists (select 1 from public.profiles p where p.id = (select auth.uid())
    and p.role in ('administrator', 'principal'))
);

commit;
