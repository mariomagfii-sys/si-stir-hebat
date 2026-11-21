begin;

create table public.habit_catalog (
  habit_key text primary key check (habit_key in ('bangun_pagi','beribadah','berolahraga','makan_sehat','gemar_belajar','bermasyarakat','tidur_cepat')),
  label text not null check (char_length(btrim(label)) between 1 and 80),
  sort_order smallint not null unique check (sort_order between 1 and 7),
  active boolean not null default true
);
insert into public.habit_catalog(habit_key,label,sort_order) values
  ('bangun_pagi','Bangun pagi',1), ('beribadah','Beribadah',2), ('berolahraga','Berolahraga',3),
  ('makan_sehat','Makan sehat',4), ('gemar_belajar','Gemar belajar',5),
  ('bermasyarakat','Bermasyarakat',6), ('tidur_cepat','Tidur cepat',7);
alter table public.habit_catalog enable row level security;
revoke all on public.habit_catalog from public,anon,authenticated;
grant select on public.habit_catalog to authenticated;
create policy habit_catalog_read on public.habit_catalog for select to authenticated
  using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('administrator','principal','teacher','student','parent')));

create or replace function school_private.guard_habits() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if new.record_date > (now() at time zone 'Asia/Jakarta')::date then
    raise exception 'Future observation not allowed' using errcode='23514';
  end if;
  if tg_op='UPDATE' and new.revision<>old.revision+1 then
    raise exception 'Revision changed' using errcode='40001';
  end if;
  if tg_op='UPDATE' and (new.validation_status is distinct from old.validation_status or new.validation_note is distinct from old.validation_note)
     and not school_private.can_validate_habits(old.student_id) then
    raise exception 'Habit validation requires an assigned teacher' using errcode='42501';
  end if;
  if new.validation_status='validated' then
    new.validated_by=(select auth.uid()); new.validated_at=now();
  else
    new.validated_by=null; new.validated_at=null; new.validation_note='';
  end if;
  new.updated_by=(select auth.uid()); new.updated_at=now();
  return new;
end;
$$;

commit;
