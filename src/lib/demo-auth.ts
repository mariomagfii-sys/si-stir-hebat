import { demoAllowed } from './config.ts'

const viteEnv = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env
const demoAuth = viteEnv?.DEV === true && demoAllowed
  ? await import('./demo-auth.development.ts')
  : await import('./demo-auth.production.ts')

export const {
  DEMO_ACCOUNTS,
  isDemoModeEnabled,
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
