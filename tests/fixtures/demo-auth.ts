import type { DemoAccount, DemoAnnouncement } from '../../src/lib/demo-auth-core'

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: 'demo-admin', email: 'admin@sdn03.sch.id', password: 'admin123', full_name: 'Admin Sekolah', role: 'administrator' },
  { id: 'demo-principal', email: 'kepsek@sdn03.sch.id', password: 'kepsek123', full_name: 'Kepala Sekolah', role: 'principal' },
  { id: 'demo-teacher', email: 'guru@sdn03.sch.id', password: 'guru123', full_name: 'Budi Santoso', role: 'teacher' },
  { id: 'demo-student', email: 'murid@sdn03.sch.id', password: 'murid123', full_name: 'Nia Ayu', role: 'student' },
  { id: 'demo-parent', email: 'ortu@sdn03.sch.id', password: 'ortu123', full_name: 'Sari Wulandari', role: 'parent' },
]

export const DEMO_ANNOUNCEMENTS: DemoAnnouncement[] = [
  {
    id: 'demo-ann-1',
    title: 'Data Contoh: Pekan Literasi',
    body: 'Contoh kegiatan membaca 15 menit sebelum pembelajaran dimulai.',
    status: 'published',
    created_at: '2026-11-05T08:00:00.000Z',
  },
  {
    id: 'demo-ann-2',
    title: 'Data Contoh: Ekstrakurikuler',
    body: 'Contoh informasi pendaftaran kegiatan ekstrakurikuler.',
    status: 'published',
    created_at: '2026-11-03T09:30:00.000Z',
  },
  {
    id: 'demo-ann-3',
    title: 'Data Contoh: Rapat Semester',
    body: 'Contoh pengumuman draf untuk rapat evaluasi semester.',
    status: 'draft',
    created_at: '2026-11-01T12:00:00.000Z',
  },
]
