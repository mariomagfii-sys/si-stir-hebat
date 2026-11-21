import test from 'node:test'
import assert from 'node:assert/strict'
import { createDemoAuth } from '../src/lib/demo-auth-core.ts'
import { DEMO_ACCOUNTS, DEMO_ANNOUNCEMENTS } from './fixtures/demo-auth.ts'
import * as runtimeDemoAuth from '../src/lib/demo-auth.ts'
import * as productionDemoAuth from '../src/lib/demo-auth.production.ts'

function withDemoStorage(run, initial = {}) {
  const values = new Map(Object.entries(initial))
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  }
  return run(createDemoAuth(true, storage, DEMO_ACCOUNTS, DEMO_ANNOUNCEMENTS), values)
}

test('production demo auth exposes no login and never stores a demo session', () => {
  const stored = new Map()
  const storage = {
    getItem: key => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, String(value)),
    removeItem: key => stored.delete(key),
  }
  const disabled = createDemoAuth(false, storage, DEMO_ACCOUNTS, DEMO_ANNOUNCEMENTS)
  assert.equal(disabled.getDemoProfiles().length, 0)
  assert.equal(disabled.signInDemo('admin@sdn03.sch.id', 'admin123'), null)
  assert.equal(disabled.getDemoSession(), null)
  assert.equal(stored.size, 0)
  assert.equal(runtimeDemoAuth.isDemoModeEnabled(), false)
  assert.deepEqual(runtimeDemoAuth.DEMO_ACCOUNTS, [])
  assert.equal(runtimeDemoAuth.signInDemo('admin@sdn03.sch.id', 'admin123'), null)
  assert.equal(runtimeDemoAuth.getDemoSession(), null)
  assert.equal(productionDemoAuth.isDemoModeEnabled(), false)
  assert.deepEqual(productionDemoAuth.DEMO_ACCOUNTS, [])
  assert.equal(productionDemoAuth.signInDemo('admin@sdn03.sch.id', 'admin123'), null)
  assert.equal(productionDemoAuth.getDemoSession(), null)
})

test('demo sign-in normalizes email but keeps passwords exact', () => withDemoStorage((auth, storage) => {
  const session = auth.signInDemo(' ADMIN@SDN03.SCH.ID ', 'admin123')
  assert.equal(session?.user.id, 'demo-admin')
  assert.equal(session?.access_token, 'demo-access-demo-admin')
  assert.deepEqual(JSON.parse(storage.get('si-stir-hebat-demo-session')), { userId: 'demo-admin' })
  assert.equal(auth.signInDemo('admin@sdn03.sch.id', 'ADMIN123'), null)
}))

test('demo session rejects malformed or unknown stored identities', () => withDemoStorage((auth, storage) => {
  storage.set('si-stir-hebat-demo-session', '{')
  assert.equal(auth.getDemoSession(), null)

  storage.set('si-stir-hebat-demo-session', JSON.stringify({ userId: 'unknown' }))
  assert.equal(auth.getDemoSession(), null)

  storage.set('si-stir-hebat-demo-profiles', '{')
  assert.equal(auth.getDemoProfiles()[0].id, DEMO_ACCOUNTS[0].id)
}))

test('demo profile lookup matches email case-insensitively', () => withDemoStorage((auth) => {
  assert.ok(auth.getDemoProfileByEmail(' ADMIN@SDN03.SCH.ID '))
  assert.equal(auth.getDemoProfileByEmail(' ADMIN@SDN03.SCH.ID ')?.id, 'demo-admin')
  assert.equal(auth.getDemoProfileByEmail('unknown@example.com'), null)
}))

test('demo profile and password changes persist and session can be cleared', () => withDemoStorage((auth) => {
  assert.ok(auth.signInDemo('guru@sdn03.sch.id', 'guru123'))
  auth.updateDemoProfile('demo-teacher', 'Nama Guru Baru')
  assert.equal(auth.getDemoProfile('demo-teacher')?.full_name, 'Nama Guru Baru')
  assert.equal(auth.getDemoSession()?.user.user_metadata.full_name, 'Nama Guru Baru')

  auth.updateDemoPassword('demo-teacher', 'password-baru')
  assert.equal(auth.signInDemo('guru@sdn03.sch.id', 'guru123'), null)
  assert.equal(auth.signInDemo('guru@sdn03.sch.id', 'password-baru')?.user.id, 'demo-teacher')

  auth.clearDemoSession()
  assert.equal(auth.getDemoSession(), null)
}))
