import test from 'node:test'
import assert from 'node:assert/strict'
import { parseScore } from '../src/features/academic/assessment-model.ts'

test('assessment score parser distinguishes blank from zero and enforces decimal bounds', () => {
  assert.equal(parseScore('', 20), null)
  assert.equal(parseScore('   ', 20), null)
  assert.equal(parseScore('0', 20), 0)
  assert.equal(parseScore('19.50', 20), 19.5)
  assert.equal(parseScore('20', 20), 20)
  for (const value of ['-1','20.01','1.234','NaN','Infinity','1e1','0x10','12abc']) assert.equal(parseScore(value, 20), undefined)
})
