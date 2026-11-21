import { createDemoAuth } from './demo-auth-core'
import { demoAllowed } from './config.ts'
import { DEMO_ACCOUNTS, DEMO_ANNOUNCEMENTS } from '../../tests/fixtures/demo-auth'

export { DEMO_ACCOUNTS }

const storage = typeof window === 'undefined' ? undefined : window.localStorage
const demoAuth = createDemoAuth(demoAllowed, storage, DEMO_ACCOUNTS, DEMO_ANNOUNCEMENTS)

export const {
  getDemoProfiles,
  getDemoProfile,
  getDemoProfileByEmail,
  signInDemo,
  getDemoSession,
  clearDemoSession,
  updateDemoProfile,
  updateDemoPassword,
  getDemoAnnouncements,
} = demoAuth

export function isDemoModeEnabled() {
  return demoAllowed
}
