begin;

-- Immutable messages are the history. No client can edit or delete them.
create table public.communication_messages (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teacher_assignments(id),
  student_id uuid not null references public.students(id),
  parent_profile_id uuid not null references public.profiles(id),
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  author_id uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);
create index communication_messages_assignment_idx on public.communication_messages(assignment_id, created_at desc, id);
create index communication_messages_parent_idx on public.communication_messages(parent_profile_id, created_at desc, id);
create index communication_messages_student_idx on public.communication_messages(student_id);
create index communication_messages_author_idx on public.communication_messages(author_id);

-- Recheck roles and relationships on every request; revocation closes access.
create function school_private.can_communicate(target_assignment uuid, target_student uuid, target_parent uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.teacher_assignments a
    join public.teachers t on t.id = a.teacher_id and t.is_active
    join public.profiles teacher on teacher.id = t.profile_id and teacher.role = 'teacher'
    join public.school_classes c on c.id = a.class_id and c.is_active
    join public.subjects sub on sub.id = a.subject_id and sub.is_active
    join public.class_enrollments e on e.class_id = c.id and e.student_id = target_student and e.is_active
    join public.students s on s.id = e.student_id and s.is_active
    join public.parent_student_relationships link on link.student_id = s.id and link.parent_profile_id = target_parent
    join public.profiles parent on parent.id = link.parent_profile_id and parent.role = 'parent'
    where a.id = target_assignment and a.is_active
      and (teacher.id = (select auth.uid()) or parent.id = (select auth.uid()))
  );
$$;
revoke all on function school_private.can_communicate(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function school_private.can_communicate(uuid, uuid, uuid) to authenticated;

alter table public.communication_messages enable row level security;
revoke all on public.communication_messages from public, anon, authenticated;
grant select on public.communication_messages to authenticated;
grant insert (id, assignment_id, student_id, parent_profile_id, body) on public.communication_messages to authenticated;
create policy communication_messages_read on public.communication_messages for select to authenticated
  using (school_private.can_communicate(assignment_id, student_id, parent_profile_id));
create policy communication_messages_insert on public.communication_messages for insert to authenticated
  with check (author_id = (select auth.uid()) and school_private.can_communicate(assignment_id, student_id, parent_profile_id));

-- Recipient discovery returns only currently authorized pairs, in bounded pages.
create function school_private.communication_recipients(page_number integer)
returns table (assignment_id uuid, student_id uuid, parent_profile_id uuid, teacher_name text, student_name text, parent_name text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if page_number is null or page_number < 0 or page_number > 10000 then
    raise exception 'Invalid page' using errcode = '22023';
  end if;
  return query
    select a.id, s.id, parent.id, t.name, s.name, parent.full_name
    from public.teacher_assignments a
    join public.teachers t on t.id = a.teacher_id
    join public.class_enrollments e on e.class_id = a.class_id
    join public.students s on s.id = e.student_id
    join public.parent_student_relationships link on link.student_id = s.id
    join public.profiles parent on parent.id = link.parent_profile_id
    where school_private.can_communicate(a.id, s.id, parent.id)
    order by s.name, s.id, t.name, a.id, parent.id
    limit 26 offset page_number * 25;
end;
$$;
create function public.communication_recipients(page_number integer default 0)
returns table (assignment_id uuid, student_id uuid, parent_profile_id uuid, teacher_name text, student_name text, parent_name text)
language sql stable security invoker set search_path = '' as $$
  select * from school_private.communication_recipients(page_number);
$$;
revoke all on function school_private.communication_recipients(integer), public.communication_recipients(integer) from public, anon, authenticated;
grant execute on function school_private.communication_recipients(integer), public.communication_recipients(integer) to authenticated;

commit;
