import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const script = fileURLToPath(new URL('../scripts/guard-env.mjs', import.meta.url))
const fixtureUrl = 'https://school-ci.supabase.co'
const fixtureKey = 'sb_publishable_abcdefghijklmnopqrstuv_12345678'

function runGuard(overrides = {}) {
  const env = { ...process.env }
  for (const key of ['CI_FIXTURE', 'GITHUB_ACTIONS', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']) delete env[key]
  Object.assign(env, overrides)
  return spawnSync(process.execPath, [script], { encoding: 'utf8', env })
}

test('build env guard accepts only a valid publishable configuration', () => {
  const result = runGuard({ VITE_SUPABASE_URL: fixtureUrl, VITE_SUPABASE_PUBLISHABLE_KEY: fixtureKey })
  assert.equal(result.status, 0, result.stderr)
})

test('build env guard rejects missing, placeholder, and non-publishable configuration', () => {
  for (const config of [
    {},
    { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: fixtureKey },
    { VITE_SUPABASE_URL: fixtureUrl, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_test' },
  ]) {
    const result = runGuard(config)
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Build dihentikan/)
  }
})

test('CI fixture mode is limited to the fixed synthetic GitHub Actions configuration', () => {
  const localFixture = runGuard({ CI_FIXTURE: '1', VITE_SUPABASE_URL: fixtureUrl, VITE_SUPABASE_PUBLISHABLE_KEY: fixtureKey })
  assert.notEqual(localFixture.status, 0)

  const githubFixture = runGuard({ CI_FIXTURE: '1', GITHUB_ACTIONS: 'true', VITE_SUPABASE_URL: fixtureUrl, VITE_SUPABASE_PUBLISHABLE_KEY: fixtureKey })
  assert.equal(githubFixture.status, 0, githubFixture.stderr)

  const githubNonFixture = runGuard({ CI_FIXTURE: '1', GITHUB_ACTIONS: 'true', VITE_SUPABASE_URL: 'https://other.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: fixtureKey })
  assert.notEqual(githubNonFixture.status, 0)
})
