begin;

create function school_private.habit_weekly_summary(requested_week date, page_number integer, target_student uuid)
returns table (
  student_id uuid, student_name text, days_expected integer, days_filled integer, days_missing integer,
  bangun_pagi integer, beribadah integer, berolahraga integer, makan_sehat integer,
  gemar_belajar integer, bermasyarakat integer, tidur_cepat integer
)
language plpgsql stable security definer set search_path='' as $$
declare
  today_local date := (now() at time zone 'Asia/Jakarta')::date;
  last_expected date;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if requested_week is null or extract(isodow from requested_week) <> 1 or requested_week > today_local then
    raise exception 'Week must start on a Monday no later than today' using errcode='22023';
  end if;
  if page_number is null or page_number < 0 or page_number > 10000 then
    raise exception 'Invalid page' using errcode='22023';
  end if;
  last_expected := least(requested_week + 6, today_local);

  return query
    select s.id, s.name,
      (last_expected-requested_week+1)::integer,
      count(h.id)::integer,
      ((last_expected-requested_week+1)-count(h.id))::integer,
      (count(h.id) filter (where coalesce(h.habits[1],false)))::integer,
      (count(h.id) filter (where coalesce(h.habits[2],false)))::integer,
      (count(h.id) filter (where coalesce(h.habits[3],false)))::integer,
      (count(h.id) filter (where coalesce(h.habits[4],false)))::integer,
      (count(h.id) filter (where coalesce(h.habits[5],false)))::integer,
      (count(h.id) filter (where coalesce(h.habits[6],false)))::integer,
      (count(h.id) filter (where coalesce(h.habits[7],false)))::integer
    from public.students s
    left join public.habit_records h on h.student_id=s.id and h.record_date between requested_week and last_expected
    where school_private.can_read_habits(s.id) and (target_student is null or s.id=target_student)
    group by s.id,s.name
    order by s.name,s.id
    limit 26 offset page_number*25;
end;
$$;

create function public.habit_weekly_summary(requested_week date, page_number integer default 0, target_student uuid default null)
returns table (
  student_id uuid, student_name text, days_expected integer, days_filled integer, days_missing integer,
  bangun_pagi integer, beribadah integer, berolahraga integer, makan_sehat integer,
  gemar_belajar integer, bermasyarakat integer, tidur_cepat integer
)
language sql stable security invoker set search_path='' as $$
  select * from school_private.habit_weekly_summary(requested_week,page_number,target_student);
$$;

revoke all on function school_private.habit_weekly_summary(date,integer,uuid), public.habit_weekly_summary(date,integer,uuid) from public,anon,authenticated;
grant execute on function school_private.habit_weekly_summary(date,integer,uuid), public.habit_weekly_summary(date,integer,uuid) to authenticated;

commit;
