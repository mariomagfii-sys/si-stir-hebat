import type { Session } from '@supabase/supabase-js'

export type DemoRole = 'administrator' | 'principal' | 'teacher' | 'student' | 'parent'

export type DemoAccount = {
  id: string
  email: string
  password: string
  full_name: string
  role: DemoRole
}

export type DemoStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type DemoAnnouncement = {
  id: string
  title: string
  body: string
  status: 'published' | 'draft'
  created_at: string
}

const SESSION_KEY = 'si-stir-hebat-demo-session'
const PROFILE_KEY = 'si-stir-hebat-demo-profiles'

export function createDemoAuth(enabled: boolean, storage: DemoStorage | undefined, accounts: DemoAccount[], announcements: DemoAnnouncement[]) {
  function readProfiles(): DemoAccount[] {
    if (!enabled) return []
    if (!storage) return accounts
    try {
      const raw = storage.getItem(PROFILE_KEY)
      if (!raw) return accounts
      const parsed = JSON.parse(raw) as DemoAccount[]
      return Array.isArray(parsed) && parsed.length ? parsed : accounts
    } catch {
      return accounts
    }
  }

  function writeProfiles(profiles: DemoAccount[]) {
    if (!enabled || !storage) return
    storage.setItem(PROFILE_KEY, JSON.stringify(profiles))
  }

  function getDemoProfiles() {
    return enabled ? readProfiles() : []
  }

  function getDemoProfile(userId: string) {
    if (!enabled) return null
    return getDemoProfiles().find((account) => account.id === userId) ?? null
  }

  function getDemoProfileByEmail(email: string) {
    if (!enabled) return null
    const normalized = email.trim().toLowerCase()
    return getDemoProfiles().find((account) => account.email.toLowerCase() === normalized) ?? null
  }

  function signInDemo(email: string, password: string): Session | null {
    if (!enabled) return null
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

    storage?.setItem(SESSION_KEY, JSON.stringify({ userId: account.id }))
    return session
  }

  function getDemoSession(): Session | null {
    if (!enabled || !storage) return null
    const saved = storage.getItem(SESSION_KEY)
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

  function clearDemoSession() {
    if (!enabled || !storage) return
    storage.removeItem(SESSION_KEY)
  }

  function updateDemoProfile(userId: string, fullName: string) {
    if (!enabled) return
    const profiles = getDemoProfiles()
    const next = profiles.map((profile) => profile.id === userId ? { ...profile, full_name: fullName } : profile)
    writeProfiles(next)
  }

  function updateDemoPassword(userId: string, newPassword: string) {
    if (!enabled) return
    const profiles = getDemoProfiles()
    const next = profiles.map((profile) => profile.id === userId ? { ...profile, password: newPassword } : profile)
    writeProfiles(next)
  }

  function getDemoAnnouncements() {
    return enabled ? announcements : []
  }

  return {
    getDemoProfiles,
    getDemoProfile,
    getDemoProfileByEmail,
    signInDemo,
    getDemoSession,
    clearDemoSession,
    updateDemoProfile,
    updateDemoPassword,
    getDemoAnnouncements,
  }
}
