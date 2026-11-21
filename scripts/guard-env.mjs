import { getPublicSupabaseConfig } from '../src/lib/config.ts'

const fixtureUrl = 'https://school-ci.supabase.co'
const fixtureKey = 'sb_publishable_abcdefghijklmnopqrstuv_12345678'
const githubActions = process.env.GITHUB_ACTIONS === 'true'
const fixtureRequested = process.env.CI_FIXTURE === '1'

if (process.env.CI_FIXTURE && !fixtureRequested) {
  console.error('Build dihentikan: CI_FIXTURE hanya menerima nilai 1 di GitHub Actions.')
  process.exit(1)
}

if (fixtureRequested && !githubActions) {
  console.error('Build dihentikan: CI_FIXTURE=1 hanya boleh digunakan di GitHub Actions.')
  process.exit(1)
}

const config = getPublicSupabaseConfig(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)
if (!config) {
  console.error('Build dihentikan: VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY publishable yang valid wajib disetel.')
  process.exit(1)
}

if (fixtureRequested && (config.url !== fixtureUrl || config.key !== fixtureKey)) {
  console.error('Build dihentikan: CI_FIXTURE=1 hanya boleh memakai konfigurasi sintetis CI yang telah ditetapkan.')
  process.exit(1)
}

console.log(`Konfigurasi build valid${fixtureRequested ? ' (fixture sintetis CI)' : ''}.`)
