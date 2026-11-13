import test from 'node:test'
import assert from 'node:assert/strict'
import { validateReportRange, summarizeReport } from '../src/features/attendance/report-model.ts'

test('report date bounds include endpoints and reject impossible dates',()=>{
  assert.equal(validateReportRange('2026-01-01','2026-01-31'),'')
  assert.equal(validateReportRange('2024-02-29','2024-02-29'),'')
  for(const [start,end] of [['2026-01-01','2026-02-01'],['2026-01-02','2026-01-01'],['2026-02-30','2026-03-01'],['','2026-01-01']]) assert.notEqual(validateReportRange(start,end),'')
})
test('report uses stable student identities and latest snapshot without treating unmarked as absent',()=>{
  const rows=summarizeReport([
    {student_id:'one',student_code:'OLD',student_name:'Old',status:'present'},
    {student_id:'two',student_code:'OLD',student_name:'Other',status:'absent'},
    {student_id:'one',student_code:'NEW',student_name:'Latest',status:null},
  ])
  assert.equal(rows.length,2)
  assert.deepEqual(rows.find(row=>row.id==='one'),{id:'one',code:'NEW',name:'Latest',present:1,sick:0,excused:0,absent:0,unmarked:1,total:2})
  assert.deepEqual(summarizeReport([]),[])
})
