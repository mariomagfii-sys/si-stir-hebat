begin;

alter table public.notifications drop constraint notifications_category_check;
alter table public.notifications add constraint notifications_category_check
  check (category in ('announcement','absence_report','supervision','assessment','document','teaching_module','communication','system'));
alter table public.notifications
  add column reference_type text check (reference_type in ('announcement','absence_report','supervision','document','teaching_module','communication','assessment')),
  add column reference_id uuid,
  add column event_key text not null default gen_random_uuid()::text,
  add constraint notifications_reference_pair check ((reference_type is null)=(reference_id is null)),
  add constraint notifications_recipient_event_unique unique(recipient_profile_id,event_key);

create function school_private.emit_notification(
  target_recipient uuid, target_category text, target_priority text,
  target_title text, target_body text, target_reference_type text,
  target_reference_id uuid, target_event_key text
) returns void
language plpgsql security definer set search_path='' as $$
begin
  if target_recipient is null or target_reference_id is null then return; end if;
  insert into public.notifications(recipient_profile_id,category,priority,title,body,reference_type,reference_id,event_key)
    values(target_recipient,target_category,target_priority,target_title,target_body,target_reference_type,target_reference_id,target_event_key)
    on conflict(recipient_profile_id,event_key) do nothing;
end;
$$;

create function school_private.notify_school_event() returns trigger
language plpgsql security definer set search_path='' as $$
declare
  recipient uuid;
  teacher_profile uuid;
  event_key_value text;
begin
  if tg_table_name='announcements' then
    if new.status='published' and (tg_op='INSERT' or old.status is distinct from new.status) then
      for recipient in select p.id from public.profiles p where p.role in ('administrator','principal','teacher','student','parent') and p.id<>new.created_by loop
        perform school_private.emit_notification(recipient,'announcement','normal','Pengumuman baru','Ada pengumuman sekolah yang telah diterbitkan.','announcement',new.id,'announcement:'||new.id::text||':published');
      end loop;
    end if;
  elsif tg_table_name='school_documents' then
    if old.status is distinct from new.status and new.status in ('submitted','approved','needs_revision') then
      event_key_value:='document:'||new.id::text||':'||new.status||':'||new.revision::text;
      if new.status='submitted' then
        for recipient in select p.id from public.profiles p where p.role='principal' loop
          perform school_private.emit_notification(recipient,'document','important','Dokumen menunggu tinjauan','Ada dokumen sekolah yang menunggu tinjauan.','document',new.id,event_key_value);
        end loop;
      else
        perform school_private.emit_notification(new.owner_profile_id,'document','normal','Status dokumen diperbarui','Status dokumen sekolah Anda telah diperbarui.','document',new.id,event_key_value);
      end if;
    end if;
  elsif tg_table_name='teaching_modules' then
    if old.status is distinct from new.status and new.status in ('submitted','approved','returned') then
      event_key_value:='teaching_module:'||new.id::text||':'||new.status||':'||new.revision::text;
      if new.status='submitted' then
        for recipient in select p.id from public.profiles p where p.role='principal' loop
          perform school_private.emit_notification(recipient,'teaching_module','important','Modul ajar menunggu tinjauan','Ada modul ajar yang menunggu tinjauan.','teaching_module',new.id,event_key_value);
        end loop;
      else
        perform school_private.emit_notification(new.author_id,'teaching_module','normal','Status modul ajar diperbarui','Status modul ajar Anda telah diperbarui.','teaching_module',new.id,event_key_value);
      end if;
    end if;
  elsif tg_table_name='academic_supervisions' then
    if old.published_at is null and new.published_at is not null then
      select t.profile_id into teacher_profile from public.teachers t where t.id=new.teacher_id;
      perform school_private.emit_notification(teacher_profile,'supervision','important','Hasil supervisi tersedia','Hasil supervisi akademik telah diterbitkan.','supervision',new.id,'supervision:'||new.id::text||':published');
    end if;
  elsif tg_table_name='guardian_absence_reports' then
    if tg_op='INSERT' then
      event_key_value:='absence_report:'||new.id::text||':submitted:'||new.revision::text;
      for recipient in
        select distinct t.profile_id from public.class_enrollments e
        join public.teacher_assignments a on a.class_id=e.class_id and a.is_active
        join public.teachers t on t.id=a.teacher_id and t.is_active
        where e.student_id=new.student_id and e.is_active and t.profile_id is not null
      loop
        perform school_private.emit_notification(recipient,'absence_report','important','Laporan ketidakhadiran baru','Ada laporan ketidakhadiran wali yang perlu diperiksa.','absence_report',new.id,event_key_value);
      end loop;
    end if;
  elsif tg_table_name='communication_messages' then
    if tg_op='INSERT' then
      if new.author_id=new.parent_profile_id then
        select t.profile_id into teacher_profile from public.teacher_assignments a
        join public.teachers t on t.id=a.teacher_id where a.id=new.assignment_id and a.is_active and t.is_active;
        recipient:=teacher_profile;
      else
        recipient:=new.parent_profile_id;
      end if;
      perform school_private.emit_notification(recipient,'communication','normal','Pesan baru','Anda menerima pesan baru dari warga sekolah.','communication',new.id,'communication:'||new.id::text);
    end if;
  end if;
  return new;
end;
$$;

create trigger announcement_notification after insert or update of status on public.announcements
  for each row execute function school_private.notify_school_event();
create trigger school_document_notification after update of status on public.school_documents
  for each row execute function school_private.notify_school_event();
create trigger teaching_module_notification after update of status on public.teaching_modules
  for each row execute function school_private.notify_school_event();
create trigger supervision_notification after update of published_at on public.academic_supervisions
  for each row execute function school_private.notify_school_event();
create trigger absence_report_notification after insert on public.guardian_absence_reports
  for each row execute function school_private.notify_school_event();
create trigger communication_notification after insert on public.communication_messages
  for each row execute function school_private.notify_school_event();

revoke all on function school_private.emit_notification(uuid,text,text,text,text,text,uuid,text),school_private.notify_school_event() from public,anon,authenticated;
grant select(reference_type,reference_id,event_key) on public.notifications to authenticated;

commit;
