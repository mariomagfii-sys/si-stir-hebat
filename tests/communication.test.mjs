import test from 'node:test'
import assert from 'node:assert/strict'
import { kirimPesan, daftarPesan, daftarPenerima } from '../src/features/komunikasi/api/index.ts'

test('communication API validates content and never sends author metadata', async () => {
  let payload
  const client = { from: () => ({ insert: value => {
    payload = value
    return { select: () => ({ single: async () => ({ data: { ...value, author_id: 'server' }, error: null }) }) }
  } }) }
  const draft = { id: 'synthetic', assignment_id: 'assignment', student_id: 'student', parent_profile_id: 'parent', body: '  Halo  ', author_id: 'forged' }
  const result = await kirimPesan(client, draft)
  assert.equal(result.author_id, 'server')
  assert.equal(payload.body, 'Halo')
  assert.equal(Object.hasOwn(payload, 'author_id'), false)
  await assert.rejects(kirimPesan(client, { ...draft, body: '   ' }))
  await assert.rejects(kirimPesan(client, { ...draft, body: 'x'.repeat(4001) }))
})

test('communication list bounds pages and propagates backend errors', async () => {
  let range
  const failure = new Error('backend')
  const query = { select: () => query, order: () => query, range: async (start, end) => { range = [start, end]; return { data: null, error: failure } } }
  const client = { from: () => query }
  await assert.rejects(daftarPesan(client, 2), error => error === failure)
  assert.deepEqual(range, [50, 74])
  await assert.rejects(daftarPesan(client, -1))
})

test('recipient API reports further authorized pages without returning the sentinel', async () => {
  const rows = Array.from({ length: 26 }, (_, id) => ({ student_id: String(id) }))
  const client = { rpc: async (name, args) => {
    assert.equal(name, 'communication_recipients')
    assert.equal(args.page_number, 1)
    return { data: rows, error: null }
  } }
  const result = await daftarPenerima(client, 1)
  assert.equal(result.items.length, 25)
  assert.equal(result.hasMore, true)
  await assert.rejects(daftarPenerima(client, -1))
})
