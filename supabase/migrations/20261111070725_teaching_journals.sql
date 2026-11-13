begin;

create table public.teaching_journals (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teacher_assignments(id),
  held_on date not null,
  topic text not null check(char_length(topic) between 1 and 160 and topic ~ '[^[:space:]]'),
  activities text not null check(char_length(activities) between 1 and 4000 and activities ~ '[^[:space:]]'),
  reflection text not null default '' check(char_length(reflection)<=2000),
  class_name text not null,
  subject_name text not null,
  teacher_name text not null,
  academic_year_name text not null,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);
create index teaching_journals_author_date_idx on public.teaching_journals(created_by,held_on desc,id);
create index teaching_journals_assignment_idx on public.teaching_journals(assignment_id);
create index teaching_journals_date_idx on public.teaching_journals(held_on desc,created_at desc,id);

create function school_private.can_write_journal(target_assignment uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select (select auth.uid()) is not null and exists(
    select 1 from public.teacher_assignments a
    join public.teachers t on t.id=a.teacher_id and t.is_active
    join public.profiles p on p.id=t.profile_id and p.role='teacher'
    join public.school_classes c on c.id=a.class_id and c.is_active
    join public.subjects s on s.id=a.subject_id and s.is_active
    where a.id=target_assignment and a.is_active and p.id=(select auth.uid()));
$$;
revoke all on function school_private.can_write_journal(uuid) from public,anon,authenticated;
grant execute on function school_private.can_write_journal(uuid) to authenticated;

create function school_private.guard_teaching_journal() returns trigger
language plpgsql security invoker set search_path='' as $$
declare first_day date; last_day date;
begin
  if new.created_by is distinct from (select auth.uid()) or not school_private.can_write_journal(new.assignment_id) then
    raise exception 'Journal requires its assigned teacher' using errcode='42501';
  end if;
  select y.starts_on,y.ends_on,c.name,s.name,t.name,y.name
    into first_day,last_day,new.class_name,new.subject_name,new.teacher_name,new.academic_year_name
    from public.teacher_assignments a join public.school_classes c on c.id=a.class_id
    join public.academic_years y on y.id=c.academic_year_id
    join public.subjects s on s.id=a.subject_id join public.teachers t on t.id=a.teacher_id
    where a.id=new.assignment_id;
  if first_day is null or new.held_on<>(now() at time zone 'Asia/Jakarta')::date or new.held_on not between first_day and last_day then
    raise exception 'Journal must be today within the class academic year' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function school_private.guard_teaching_journal() from public,anon,authenticated;
create trigger teaching_journal_guard before insert on public.teaching_journals for each row execute function school_private.guard_teaching_journal();

alter table public.teaching_journals enable row level security;
revoke all on public.teaching_journals from public,anon,authenticated;
grant select on public.teaching_journals to authenticated;
grant insert(id,assignment_id,held_on,topic,activities,reflection) on public.teaching_journals to authenticated;
create policy journal_read on public.teaching_journals for select to authenticated using (
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and (
    p.role in ('administrator','principal') or (p.role='teacher' and created_by=(select auth.uid()) and school_private.can_write_journal(assignment_id))))
);
create policy journal_insert on public.teaching_journals for insert to authenticated with check (
  created_by=(select auth.uid()) and school_private.can_write_journal(assignment_id)
);

commit;
