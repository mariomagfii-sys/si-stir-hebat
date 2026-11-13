begin;

create table public.teaching_modules (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teacher_assignments(id),
  author_id uuid not null default auth.uid() references public.profiles(id),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  objectives text not null check (char_length(btrim(objectives)) between 1 and 4000),
  activities text not null check (char_length(btrim(activities)) between 1 and 8000),
  status text not null default 'draft' check (status in ('draft','submitted','returned','approved','archived')),
  review_note text not null default '' check (char_length(review_note) <= 2000),
  revision integer not null default 0,
  updated_at timestamptz not null default now()
);

create index teaching_modules_assignment_idx on public.teaching_modules(assignment_id);
create index teaching_modules_author_idx on public.teaching_modules(author_id,updated_at desc,id);
create index teaching_modules_updated_idx on public.teaching_modules(updated_at desc,id);

create table public.teaching_module_events (
  id bigint generated always as identity primary key,
  module_id uuid not null references public.teaching_modules(id),
  actor_id uuid not null references public.profiles(id),
  status text not null,
  review_note text not null,
  created_at timestamptz not null default now()
);

create index teaching_module_events_module_idx on public.teaching_module_events(module_id,id);
create index teaching_module_events_actor_idx on public.teaching_module_events(actor_id);

alter table public.teaching_modules enable row level security;
alter table public.teaching_module_events enable row level security;
revoke all on public.teaching_modules, public.teaching_module_events from public, anon, authenticated;
grant select on public.teaching_modules, public.teaching_module_events to authenticated;
grant insert (id,assignment_id,title,objectives,activities) on public.teaching_modules to authenticated;
grant update (title,objectives,activities,status,review_note) on public.teaching_modules to authenticated;

create policy teaching_modules_read on public.teaching_modules for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (
    (p.role in ('administrator','principal') and teaching_modules.status <> 'draft')
    or (p.role = 'teacher' and teaching_modules.author_id = p.id
        and school_private.can_write_journal(teaching_modules.assignment_id))
  ))
);
create policy teaching_modules_insert on public.teaching_modules for insert to authenticated with check (
  author_id = (select auth.uid()) and status = 'draft'
  and school_private.can_write_journal(assignment_id)
);
create policy teaching_modules_update on public.teaching_modules for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (
    p.role = 'principal' or (p.role = 'teacher' and author_id = p.id
      and school_private.can_write_journal(assignment_id))
  ))
);
create policy teaching_module_events_read on public.teaching_module_events for select to authenticated using (
  exists (select 1 from public.teaching_modules m where m.id = module_id)
);

create function school_private.guard_teaching_module_update() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare actor_role text;
begin
  select p.role into actor_role from public.profiles p where p.id = (select auth.uid());

  if actor_role = 'teacher' and old.author_id = (select auth.uid())
      and school_private.can_write_journal(old.assignment_id)
      and old.status in ('draft','returned') and new.status in (old.status,'submitted')
      and new.review_note = old.review_note then
    null;
  elsif actor_role = 'principal'
      and (new.title,new.objectives,new.activities) is not distinct from (old.title,old.objectives,old.activities)
      and (
        (old.status = 'submitted' and new.status in ('returned','approved')
          and (new.status = 'approved' or char_length(btrim(new.review_note)) >= 5))
        or (old.status = 'approved' and new.status = 'archived' and new.review_note = old.review_note)
      ) then
    new.review_note := btrim(new.review_note);
  else
    raise exception 'Teaching module transition is not permitted' using errcode = '42501';
  end if;

  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end;
$$;

create function school_private.audit_teaching_module_status() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.status is distinct from new.status then
    insert into public.teaching_module_events (module_id, actor_id, status, review_note)
      values (new.id, auth.uid(), new.status, case when new.status in ('returned','approved') then new.review_note else '' end);
  end if;
  return new;
end;
$$;

revoke all on function school_private.guard_teaching_module_update(), school_private.audit_teaching_module_status()
  from public, anon, authenticated;
create trigger teaching_module_guard before update on public.teaching_modules
  for each row execute function school_private.guard_teaching_module_update();
create trigger teaching_module_audit after update on public.teaching_modules
  for each row execute function school_private.audit_teaching_module_status();

commit;
