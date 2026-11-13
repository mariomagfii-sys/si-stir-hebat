begin;

alter table public.class_materials
  add column kind text not null default 'material',
  add column due_on date,
  add constraint class_materials_kind_due_check check (
    (kind = 'material' and due_on is null)
    or (kind = 'task' and due_on is not null)
  );

grant insert (kind, due_on), update (due_on) on public.class_materials to authenticated;
create index class_materials_kind_updated_idx on public.class_materials(kind, updated_at desc, id);

create function school_private.guard_class_task_due_date() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if old.status <> 'draft' and old.due_on is distinct from new.due_on then
    raise exception 'A published task deadline cannot change' using errcode = '23514';
  end if;

  if new.kind = 'task' and old.status = 'draft' and new.status = 'published'
      and new.due_on < (now() at time zone 'Asia/Jakarta')::date then
    raise exception 'The task deadline must be today or later' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function school_private.guard_class_task_due_date() from public, anon, authenticated;

create trigger class_task_deadline_guard before update on public.class_materials
  for each row execute function school_private.guard_class_task_due_date();

commit;
