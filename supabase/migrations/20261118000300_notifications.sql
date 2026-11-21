begin;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id),
  category text not null check (category in ('announcement','absence_report','supervision','assessment','system')),
  priority text not null default 'normal' check (priority in ('normal','important','urgent')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_recipient_idx on public.notifications(recipient_profile_id, created_at desc, id desc);
create index notifications_unread_idx on public.notifications(recipient_profile_id, created_at desc) where read_at is null;

alter table public.notifications enable row level security;
revoke all on public.notifications from public, anon, authenticated;
grant select on public.notifications to authenticated;

create policy notifications_read_own on public.notifications for select to authenticated
  using (recipient_profile_id=(select auth.uid()));

create function public.mark_notification_read(target_id uuid) returns public.notifications
language plpgsql security definer set search_path='' as $$
declare result public.notifications;
begin
  update public.notifications n set read_at=coalesce(n.read_at,now())
    where n.id=target_id and n.recipient_profile_id=(select auth.uid())
    returning n.* into result;
  if result.id is null then raise exception 'Notification not found' using errcode='P0002'; end if;
  return result;
end; $$;

create function school_private.create_notification(target_recipient uuid, target_category text, target_priority text, target_title text, target_body text)
returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
  if target_recipient is null or target_category not in ('announcement','absence_report','supervision','assessment','system')
     or target_priority not in ('normal','important','urgent')
     or char_length(btrim(target_title)) not between 1 and 160
     or char_length(btrim(target_body)) not between 1 and 1000 then
    raise exception 'Invalid notification payload' using errcode='22023';
  end if;
  insert into public.notifications(recipient_profile_id,category,priority,title,body)
    values(target_recipient,target_category,target_priority,btrim(target_title),btrim(target_body)) returning id into result;
  return result;
end; $$;

revoke all on function public.mark_notification_read(uuid), school_private.create_notification(uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
revoke all on function school_private.create_notification(uuid,text,text,text,text) from public, anon, authenticated;

commit;
