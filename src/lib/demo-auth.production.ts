import type { Session } from '@supabase/supabase-js'
import type { DemoAccount } from './demo-auth-core'

export const DEMO_ACCOUNTS: DemoAccount[] = []

export function isDemoModeEnabled() {
  return false
}

export function getDemoProfiles(): DemoAccount[] {
  return []
}

export function getDemoProfile(userId: string): DemoAccount | null {
  void userId
  return null
}

export function getDemoProfileByEmail(email: string): DemoAccount | null {
  void email
  return null
}

export function signInDemo(email: string, password: string): Session | null {
  void email
  void password
  return null
}

export function getDemoSession(): Session | null {
  return null
}

export function clearDemoSession(): void {
  return
}

export function updateDemoProfile(userId: string, fullName: string): void {
  void userId
  void fullName
  return
}

export function updateDemoPassword(userId: string, newPassword: string): void {
  void userId
  void newPassword
  return
}

export function getDemoAnnouncements() {
  return []
}
