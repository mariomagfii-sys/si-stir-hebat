import test from 'node:test'
import assert from 'node:assert/strict'

test('habit draft validates seven boolean indicators and school date', async () => {
  const { validateHabitDraft } = await import('../src/features/student-habits/api/index.ts')
  const valid = { record_date: '2026-11-18', habits: [true, false, false, true, false, false, true], notes: 'Data Contoh' }
  assert.equal(validateHabitDraft(valid, '2026-11-18'), '')
  assert.match(validateHabitDraft({ ...valid, record_date: '2026-11-19' }, '2026-11-18'), /mendatang/)
  assert.match(validateHabitDraft({ ...valid, habits: [true] }, '2026-11-18'), /tujuh/)
  assert.match(validateHabitDraft({ ...valid, notes: 'x'.repeat(1001) }, '2026-11-18'), /1.000/)
})

test('habit validation requires a non-empty bounded note and revision', async () => {
  const { validasiKebiasaan } = await import('../src/features/student-habits/api/index.ts')
  const client = { from() { return { update() { return this }, eq() { return this }, select() { return this }, single: async () => ({ data: {}, error: null }) } } }
  await assert.rejects(validasiKebiasaan(client, '', 0, 'Konfirmasi'), /Identitas/)
  await assert.rejects(validasiKebiasaan(client, 'id', -1, 'Konfirmasi'), /Identitas/)
  await assert.rejects(validasiKebiasaan(client, 'id', 0, ' '), /1-1.000/)
})
