import test from 'node:test'
import assert from 'node:assert/strict'
import { attendanceSummary, prepareAttendanceChanges, schoolToday } from '../src/features/attendance/attendance-model.ts'

const rows = [{ id:'a',session_id:'s',student_code:'TEST1',student_name:'Data Contoh Satu',status:null,revision:0 }, { id:'b',session_id:'s',student_code:'TEST2',student_name:'Data Contoh Dua',status:'present',revision:2 }]
test('attendance distinguishes unmarked from absent',()=>{
  assert.deepEqual(attendanceSummary(rows),{present:1,sick:0,excused:0,absent:0,unmarked:1})
  assert.equal(prepareAttendanceChanges(rows,{}).changes.length,0)
})
test('attendance requires a valid correction reason and preserves expected revision',()=>{
  assert.notEqual(prepareAttendanceChanges(rows,{b:{status:'sick',reason:''}}).error,'')
  assert.deepEqual(prepareAttendanceChanges(rows,{b:{status:'excused',reason:' Izin orang tua '}}).changes,[{id:'b',status:'excused',revision:2,reason:'Izin orang tua'}])
  assert.deepEqual(prepareAttendanceChanges(rows,{a:{status:'present',reason:''}}).changes,[{id:'a',status:'present',revision:0,reason:''}])
  assert.notEqual(prepareAttendanceChanges(rows,{b:{status:'',reason:'Menghapus status'}}).error,'')
})
test('school date uses the same timezone as attendance validation',()=>{
  assert.equal(schoolToday(new Date('2026-11-09T18:00:00Z')),'2026-11-10')
  assert.equal(schoolToday(new Date('2026-11-10T16:59:00Z')),'2026-11-10')
})
