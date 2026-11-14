import test from 'node:test'
import assert from 'node:assert/strict'
import { academicCells, developmentPoints, orderAcademicRows, scorePercent, studentChoices, validateAcademicRange } from '../src/features/academic/academic-report-model.ts'

const row = (id, student, subject, date, score, maximum, status = 'published') => ({
  id, student_id: student, student_code: '001', student_name: 'Data Contoh', score,
  assessments: { id: `assessment-${id}`, class_id: 'class-one', class_name: 'Kelas 1A', subject_id: subject, subject_name: 'Pelajaran',
    title: `Asesmen ${id}`, assessment_type: 'formative', held_on: date, maximum_score: maximum, status },
})

test('academic report validates inclusive annual ranges and real dates', () => {
  assert.equal(validateAcademicRange('2026-01-01','2026-12-31'), '')
  assert.equal(validateAcademicRange('2024-01-01','2024-12-31'), '')
  assert.equal(validateAcademicRange('2026-11-12','2026-11-12'), '')
  for (const [start,end] of [['2026-02-30','2026-03-01'],['','2026-01-01'],['2026-12-31','2026-01-01'],['2024-01-01','2025-01-01']]) {
    assert.notEqual(validateAcademicRange(start,end), '')
  }
})

test('academic export preserves raw zero, missing results and different maximum scores', () => {
  const zero = row('1','student-one','subject-one','2026-11-01',0,20)
  assert.deepEqual(academicCells(zero).slice(-3), [0,20,0])
  assert.deepEqual(academicCells({ ...zero, score: null }).slice(-3), ['',20,''])
  assert.equal(scorePercent(8,12), 66.67)
  assert.equal(scorePercent(5,10), 50)
  assert.equal(scorePercent(null,10), null)
})

test('development graph isolates stable identities and excludes drafts and ungraded rows', () => {
  const rows = [row('3','one','math','2026-11-03',8,10), row('1','one','math','2026-11-01',0,20),
    row('2','one','math','2026-11-02',5,10,'draft'),row('4','two','math','2026-11-04',6,10),
    row('5','one','other','2026-11-05',7,10),row('6','one','math','2026-11-06',null,10)]
  assert.deepEqual(developmentPoints(rows,'one','math').map(item => item.id), ['1','3'])
  assert.deepEqual(developmentPoints(rows,'','math'), [])
  assert.deepEqual(developmentPoints(rows,'one',''), [])
  assert.deepEqual(orderAcademicRows(rows).map(item => item.id), ['1','2','3','4','5','6'])
  assert.equal(rows[0].id, '3')
})

test('student filters use identities and the latest name snapshot rather than merging names', () => {
  const old = row('1','one','math','2026-11-01',10,20)
  const renamed = { ...row('3','one','math','2026-11-03',10,20), student_name: 'Data Contoh Baru', student_code: '003' }
  const another = row('2','two','math','2026-11-02',10,20)
  const choices = studentChoices([renamed,old,another])
  assert.equal(choices.length, 2)
  assert.equal(choices.find(item => item.id === 'one').label, 'Data Contoh Baru · 003')
  assert.equal(choices.find(item => item.id === 'two').label, 'Data Contoh · 001')
})
