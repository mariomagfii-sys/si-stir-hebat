import type { SupabaseClient } from '@supabase/supabase-js'

export type Notification = {
  id: string
  recipient_profile_id: string
  category: 'announcement' | 'absence_report' | 'supervision' | 'assessment' | 'document' | 'teaching_module' | 'communication' | 'system'
  priority: 'normal' | 'important' | 'urgent'
  title: string
  body: string
  read_at: string | null
  created_at: string
  reference_type: 'announcement' | 'absence_report' | 'supervision' | 'document' | 'teaching_module' | 'communication' | 'assessment' | null
  reference_id: string | null
  event_key: string
}

const columns = 'id,recipient_profile_id,category,priority,title,body,read_at,created_at,reference_type,reference_id,event_key'

export function validateNotificationPage(page: number): void {
  if (!Number.isSafeInteger(page) || page < 0 || page > 10000) throw new Error('Halaman notifikasi tidak valid.')
}

export async function daftarNotifikasi(client: SupabaseClient, page = 0): Promise<{ items: Notification[]; hasMore: boolean }> {
  validateNotificationPage(page)
  const { data, error } = await client.from('notifications').select(columns).order('created_at', { ascending: false }).order('id', { ascending: false }).range(page * 25, page * 25 + 25)
  if (error) throw error
  const rows = (data ?? []) as Notification[]
  return { items: rows.slice(0, 25), hasMore: rows.length > 25 }
}

export async function tandaiNotifikasiDibaca(client: SupabaseClient, id: string): Promise<Notification> {
  if (!id.trim()) throw new Error('Identitas notifikasi tidak valid.')
  const { data, error } = await client.rpc('mark_notification_read', { target_id: id })
  if (error) throw error
  return data as Notification
}
