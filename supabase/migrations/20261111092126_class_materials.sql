begin;

create table public.class_materials (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teacher_assignments(id),
  class_id uuid not null references public.school_classes(id),
  author_id uuid not null default auth.uid() references public.profiles(id),
  class_name text not null,
  subject_name text not null,
  title text not null check (char_length(btrim(title)) between 1 and 160 and title ~ '[^[:space:]]'),
  body text not null check (char_length(btrim(body)) between 1 and 12000 and body ~ '[^[:space:]]'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  revision integer not null default 0
);

create index class_materials_assignment_idx on public.class_materials(assignment_id);
create index class_materials_author_idx on public.class_materials(author_id);
create index class_materials_class_idx on public.class_materials(class_id);
create index class_materials_updated_idx on public.class_materials(updated_at desc,id);

create function school_private.can_read_class_material(target_class uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    join public.class_enrollments e on e.class_id = target_class and e.is_active
    join public.school_classes c on c.id = e.class_id and c.is_active
    join public.students s on s.id = e.student_id and s.is_active
    where p.id = (select auth.uid()) and (
      (p.role = 'student' and s.profile_id = p.id)
      or (p.role = 'parent' and exists (
        select 1 from public.parent_student_relationships r where r.parent_profile_id = p.id and r.student_id = s.id
      ))
    )
  );
$$;
revoke all on function school_private.can_read_class_material(uuid) from public, anon, authenticated;
grant execute on function school_private.can_read_class_material(uuid) to authenticated;

alter table public.class_materials enable row level security;
revoke all on public.class_materials from public, anon, authenticated;
grant select on public.class_materials to authenticated;
grant insert (id,assignment_id,title,body) on public.class_materials to authenticated;
grant update (title,body,status) on public.class_materials to authenticated;

create policy class_materials_read on public.class_materials for select to authenticated using (
  (status = 'published' and school_private.can_read_class_material(class_id))
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and (
    (p.role in ('principal','administrator') and status <> 'draft')
    or (p.role = 'teacher' and author_id = p.id and school_private.can_write_journal(assignment_id))
  ))
);
create policy class_materials_insert on public.class_materials for insert to authenticated with check (
  author_id = (select auth.uid()) and status = 'draft' and school_private.can_write_journal(assignment_id)
);
create policy class_materials_update on public.class_materials for update to authenticated using (
  author_id = (select auth.uid()) and school_private.can_write_journal(assignment_id)
);

create function school_private.guard_class_material() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    select a.class_id, c.name, s.name into new.class_id, new.class_name, new.subject_name
    from public.teacher_assignments a
    join public.school_classes c on c.id = a.class_id
    join public.subjects s on s.id = a.subject_id
    where a.id = new.assignment_id and school_private.can_write_journal(a.id);
    if not found then
      raise exception 'Active teaching assignment required' using errcode = '42501';
    end if;
    return new;
  end if;

  if old.status = 'draft' and new.status in ('draft','published') then
    if new.status = 'published' then
      new.published_at := now();
    end if;
  elsif old.status = 'published' and new.status = 'archived'
      and (new.title,new.body) is not distinct from (old.title,old.body) then
    null;
  else
    raise exception 'Material transition is not permitted' using errcode = '23514';
  end if;
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function school_private.guard_class_material() from public, anon, authenticated;
create trigger class_material_guard before insert or update on public.class_materials
  for each row execute function school_private.guard_class_material();

commit;
