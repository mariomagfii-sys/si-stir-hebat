begin;

alter table public.assessments add column subject_id uuid references public.subjects(id);
-- This transaction holds the table lock while adding the derived identity.
-- Existing academic content is unchanged; the normal author guard is restored
-- before any other transaction can write to the table.
alter table public.assessments disable trigger assessment_guard;
update public.assessments a set subject_id = t.subject_id
  from public.teacher_assignments t where t.id = a.assignment_id;
alter table public.assessments enable trigger assessment_guard;
alter table public.assessments alter column subject_id set not null;
create index assessments_subject_idx on public.assessments(subject_id);

create function school_private.set_assessment_subject() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  select subject_id into new.subject_id from public.teacher_assignments where id = new.assignment_id;
  return new;
end;
$$;
revoke all on function school_private.set_assessment_subject() from public, anon, authenticated;
create trigger assessment_subject_guard before insert on public.assessments
  for each row execute function school_private.set_assessment_subject();

commit;
