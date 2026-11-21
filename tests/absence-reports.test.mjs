import test from 'node:test'
import assert from 'node:assert/strict'

test('guardian absence report validates date and reason without finalizing attendance', async () => {
  const { validateAbsenceReport } = await import('../src/features/parents/api/absence-reports.ts')
  assert.equal(validateAbsenceReport('2026-11-18', 'Demam', '2026-11-18'), '')
  assert.match(validateAbsenceReport('2026-11-19', 'Demam', '2026-11-18'), /mendatang/)
  assert.match(validateAbsenceReport('2026-11-18', ' ', '2026-11-18'), /wajib/)
  assert.match(validateAbsenceReport('2026-11-18', 'x'.repeat(1001), '2026-11-18'), /1.000/)
})
