import type { SupabaseClient } from '@supabase/supabase-js'

export type DashboardOverview = {
  profile: { full_name: string; role: 'administrator' | 'principal' }
  active: { students: number; teachers: number; classes: number }
  supervision_stages: Record<'1' | '2' | '3' | '4', number>
  teaching_modules: { submitted: number; returned: number }
  announcements: {
    published_count: number
    draft_count: number
    recent: { id: string; title: string; body: string; status: 'published'; created_at: string }[]
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Ringkasan dashboard tidak valid.')
  return value as Record<string, unknown>
}

function count(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new Error('Jumlah ringkasan dashboard tidak valid.')
  return value
}

export async function getDashboardOverview(client: SupabaseClient): Promise<DashboardOverview> {
  const { data, error } = await client.rpc('dashboard_overview')
  if (error) throw error

  const root = record(data)
  const profile = record(root.profile)
  const role = profile.role
  if (role !== 'administrator' && role !== 'principal') throw new Error('Peran dashboard tidak valid.')
  const active = record(root.active)
  const stages = record(root.supervision_stages)
  const modules = record(root.teaching_modules)
  const announcements = record(root.announcements)
  if (!Array.isArray(announcements.recent) || announcements.recent.length > 3) throw new Error('Daftar pengumuman dashboard tidak valid.')
  const recent = announcements.recent.map(value => {
    const item = record(value)
    if (typeof item.id !== 'string' || typeof item.title !== 'string' || typeof item.body !== 'string'
      || typeof item.created_at !== 'string' || item.status !== 'published') {
      throw new Error('Pengumuman dashboard tidak valid.')
    }
    return { id: item.id, title: item.title, body: item.body, status: 'published' as const, created_at: item.created_at }
  })

  return {
    profile: { full_name: typeof profile.full_name === 'string' ? profile.full_name : '', role },
    active: { students: count(active.students), teachers: count(active.teachers), classes: count(active.classes) },
    supervision_stages: {
      '1': count(stages['1']), '2': count(stages['2']), '3': count(stages['3']), '4': count(stages['4']),
    },
    teaching_modules: { submitted: count(modules.submitted), returned: count(modules.returned) },
    announcements: {
      published_count: count(announcements.published_count),
      draft_count: count(announcements.draft_count),
      recent,
    },
  }
}
