import type { Session } from '@supabase/supabase-js'

export type DemoRole = 'administrator' | 'principal' | 'teacher' | 'student' | 'parent'

export type DemoAccount = {
  id: string
  email: string
  password: string
  full_name: string
  role: DemoRole
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: 'demo-admin', email: 'admin@sdn03.sch.id', password: 'admin123', full_name: 'Admin Sekolah', role: 'administrator' },
  { id: 'demo-principal', email: 'kepsek@sdn03.sch.id', password: 'kepsek123', full_name: 'Kepala Sekolah', role: 'principal' },
  { id: 'demo-teacher', email: 'guru@sdn03.sch.id', password: 'guru123', full_name: 'Budi Santoso', role: 'teacher' },
  { id: 'demo-student', email: 'murid@sdn03.sch.id', password: 'murid123', full_name: 'Nia Ayu', role: 'student' },
  { id: 'demo-parent', email: 'ortu@sdn03.sch.id', password: 'ortu123', full_name: 'Sari Wulandari', role: 'parent' },
]

const SESSION_KEY = 'si-stir-hebat-demo-session'
const PROFILE_KEY = 'si-stir-hebat-demo-profiles'

function readProfiles(): DemoAccount[] {
  if (typeof window === 'undefined') return DEMO_ACCOUNTS
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY)
    if (!raw) return DEMO_ACCOUNTS
    const parsed = JSON.parse(raw) as DemoAccount[]
    return Array.isArray(parsed) && parsed.length ? parsed : DEMO_ACCOUNTS
  } catch {
    return DEMO_ACCOUNTS
  }
}

function writeProfiles(profiles: DemoAccount[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles))
}

export function getDemoProfiles() {
  return readProfiles()
}

export function getDemoProfile(userId: string) {
  return getDemoProfiles().find((account) => account.id === userId) ?? null
}

export function signInDemo(email: string, password: string) {
  const account = getDemoProfiles().find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password)
  if (!account) return null
  const session: Session = {
    access_token: `demo-access-${account.id}`,
    refresh_token: `demo-refresh-${account.id}`,
    expires_in: 3600,
    expires_at: Math.floor((Date.now() + 60 * 60 * 1000) / 1000),
    token_type: 'bearer',
    user: {
      id: account.id,
      email: account.email,
      app_metadata: {},
      user_metadata: { full_name: account.full_name, role: account.role },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      role: 'authenticated',
    },
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: account.id }))
  }

  return session
}

export function getDemoSession(): Session | null {
  if (typeof window === 'undefined') return null
  const saved = window.localStorage.getItem(SESSION_KEY)
  if (!saved) return null

  try {
    const parsed = JSON.parse(saved) as { userId?: string }
    const account = parsed.userId ? getDemoProfile(parsed.userId) : null
    if (!account) return null
    return signInDemo(account.email, account.password)
  } catch {
    return null
  }
}

export function clearDemoSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_KEY)
}

export function updateDemoProfile(userId: string, fullName: string) {
  const profiles = getDemoProfiles()
  const next = profiles.map((profile) => profile.id === userId ? { ...profile, full_name: fullName } : profile)
  writeProfiles(next)
}

export function updateDemoPassword(userId: string, newPassword: string) {
  const profiles = getDemoProfiles()
  const next = profiles.map((profile) => profile.id === userId ? { ...profile, password: newPassword } : profile)
  writeProfiles(next)
}

export function getDemoAnnouncements() {
  return [
    {
      id: 'demo-ann-1',
      title: 'Pekan Literasi SDN 03 Wonosari',
      body: 'Pada minggu depan, seluruh siswa akan mengikuti kegiatan literasi membaca 15 menit sebelum pembelajaran dimulai. Guru dan orang tua diharapkan mendukung kebiasaan membaca di rumah.',
      status: 'published',
      created_at: '2026-11-05T08:00:00.000Z',
    },
    {
      id: 'demo-ann-2',
      title: 'Pendaftaran ekstrakurikuler dibuka',
      body: 'Ekstrakurikuler musik, pramuka, dan robotika dibuka untuk siswa kelas IV–VI. Formulir pendaftaran dapat diunduh di ruang guru atau dikirim melalui wali kelas.',
      status: 'published',
      created_at: '2026-11-03T09:30:00.000Z',
    },
    {
      id: 'demo-ann-3',
      title: 'Rapat evaluasi semester',
      body: 'Rapat evaluasi semester akan dilaksanakan pada hari Jumat pukul 14.00 di ruang guru. Semua wali kelas diharapkan hadir.',
      status: 'draft',
      created_at: '2026-11-01T12:00:00.000Z',
    },
  ]
}
