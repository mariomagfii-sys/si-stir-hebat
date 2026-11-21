import test from 'node:test'
import assert from 'node:assert/strict'

test('dashboard overview API validates the typed aggregate returned by its RPC', async () => {
  const { getDashboardOverview } = await import('../src/lib/dashboard-overview.ts')
  let rpcName
  const payload = {
    profile: { full_name: 'Data Contoh Admin', role: 'administrator' },
    active: { students: 3, teachers: 2, classes: 1 },
    supervision_stages: { '1': 1, '2': 0, '3': 0, '4': 0 },
    teaching_modules: { submitted: 2, returned: 1 },
    announcements: {
      published_count: 4,
      draft_count: 1,
      recent: [{ id: 'news-1', title: 'Data Contoh', body: 'Isi contoh', status: 'published', created_at: '2026-11-20T00:00:00Z' }],
    },
  }
  const client = { async rpc(name) { rpcName = name; return { data: payload, error: null } } }
  const result = await getDashboardOverview(client)
  assert.equal(rpcName, 'dashboard_overview')
  assert.equal(result.profile.role, 'administrator')
  assert.equal(result.active.students, 3)
  assert.equal(result.announcements.recent[0].status, 'published')
})

test('dashboard overview API rejects malformed aggregates and surfaces RPC errors', async () => {
  const { getDashboardOverview } = await import('../src/lib/dashboard-overview.ts')
  await assert.rejects(getDashboardOverview({ async rpc() { return { data: { profile: {} }, error: null } } }), /tidak valid/)
  const failure = new Error('RPC unavailable')
  await assert.rejects(getDashboardOverview({ async rpc() { return { data: null, error: failure } } }), error => error === failure)
})
