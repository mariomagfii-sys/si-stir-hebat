export type AnnouncementStatus = 'draft' | 'published' | 'archived'
export type Announcement = {
  id: string; title: string; body: string; status: AnnouncementStatus; created_at: string
}
export const announcementStatuses: Record<AnnouncementStatus, string> = {
  draft: 'Draf', published: 'Terbit', archived: 'Arsip',
}
export function canManageAnnouncements(role: string | null) {
  return role === 'administrator' || role === 'principal'
}
export function canReadAnnouncements(role: string | null) {
  return canManageAnnouncements(role) || ['teacher', 'student', 'parent'].includes(role ?? '')
}
export function validateAnnouncement(title: string, body: string): string {
  if (!title.trim() || title.trim().length > 160) return 'Isi judul antara 1 dan 160 karakter.'
  if (!body.trim() || body.trim().length > 10000) return 'Isi pengumuman antara 1 dan 10.000 karakter.'
  return ''
}
