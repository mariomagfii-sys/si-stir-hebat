import test from 'node:test'
import assert from 'node:assert/strict'
import {
  clearDemoSession,
  getDemoProfile,
  getDemoProfiles,
  getDemoSession,
  signInDemo,
  updateDemoPassword,
  updateDemoProfile,
} from '../src/lib/demo-auth.ts'

function withDemoStorage(run, initial = {}) {
  const values = new Map(Object.entries(initial))
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: (key) => values.delete(key),
      },
    },
  })

  try {
    return run(values)
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow)
    else delete globalThis.window
  }
}

test('demo sign-in normalizes email but keeps passwords exact', () => withDemoStorage((storage) => {
  const session = signInDemo(' ADMIN@SDN03.SCH.ID ', 'admin123')
  assert.equal(session?.user.id, 'demo-admin')
  assert.equal(session?.access_token, 'demo-access-demo-admin')
  assert.deepEqual(JSON.parse(storage.get('si-stir-hebat-demo-session')), { userId: 'demo-admin' })
  assert.equal(signInDemo('admin@sdn03.sch.id', 'ADMIN123'), null)
}))

test('demo session rejects malformed or unknown stored identities', () => withDemoStorage((storage) => {
  storage.set('si-stir-hebat-demo-session', '{')
  assert.equal(getDemoSession(), null)

  storage.set('si-stir-hebat-demo-session', JSON.stringify({ userId: 'unknown' }))
  assert.equal(getDemoSession(), null)

  storage.set('si-stir-hebat-demo-profiles', '{')
  assert.equal(getDemoProfiles()[0].id, 'demo-admin')
}))

test('demo profile and password changes persist and session can be cleared', () => withDemoStorage(() => {
  assert.ok(signInDemo('guru@sdn03.sch.id', 'guru123'))
  updateDemoProfile('demo-teacher', 'Nama Guru Baru')
  assert.equal(getDemoProfile('demo-teacher')?.full_name, 'Nama Guru Baru')
  assert.equal(getDemoSession()?.user.user_metadata.full_name, 'Nama Guru Baru')

  updateDemoPassword('demo-teacher', 'password-baru')
  assert.equal(signInDemo('guru@sdn03.sch.id', 'guru123'), null)
  assert.equal(signInDemo('guru@sdn03.sch.id', 'password-baru')?.user.id, 'demo-teacher')

  clearDemoSession()
  assert.equal(getDemoSession(), null)
}))
