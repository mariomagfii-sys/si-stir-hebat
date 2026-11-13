import test from 'node:test'
import assert from 'node:assert/strict'
import writeExcelFile from 'write-excel-file/node'
import { templateRows, validateImportFile, validateImportRows } from '../src/features/attendance/import-model.ts'
import { readAttendanceWorkbook } from '../src/features/attendance/read-attendance-xlsx.ts'

const session='2026-11-10 · Data Contoh Kelas · 2026/2027'
const records=[{id:'record-1',session_id:'session',student_code:'001',student_name:'Data Contoh Satu',status:null,revision:0},{id:'record-2',session_id:'session',student_code:'TEST_2',student_name:'Data Contoh Dua',status:'present',revision:2}]
const input=(rows)=>[['Sesi absensi',session],['Kode siswa','Status','Alasan koreksi'],...rows]
test('import rejects wrong extensions, empty files and oversized input',()=>{
  assert.notEqual(validateImportFile('file.xls',10),'')
  assert.notEqual(validateImportFile('file.xlsm',10),'')
  assert.notEqual(validateImportFile('file.xlsx',0),'')
  assert.notEqual(validateImportFile('file.xlsx',2*1024*1024+1),'')
  assert.notEqual(validateImportFile('../file.xlsx',100),'')
  assert.notEqual(validateImportFile('a'.repeat(121)+'.xlsx',100),'')
  assert.equal(validateImportFile('file.XLSX',100),'')
})
test('import validates session identity, headers, participant codes and duplicates',()=>{
  assert.ok(validateImportRows([['Sesi absensi','another session']],records,session).errors.length)
  assert.ok(validateImportRows([['Sesi absensi',session],['wrong']],records,session).errors.length)
  assert.ok(validateImportRows(input([['UNKNOWN','Hadir','']]),records,session).errors.length)
  assert.ok(validateImportRows(input([[1,'Hadir','']]),records,session).errors.length)
  assert.ok(validateImportRows(input([['001','Hadir',''],['001','Sakit','']]),records,session).errors.length)
})
test('import does not infer absent for omitted or blank rows',()=>{
  const plan=validateImportRows(input([['001','',''],['TEST_2','','']]),records,session)
  assert.deepEqual(plan.errors,[])
  assert.deepEqual(plan.changes,[])
  assert.equal(plan.rows[0].after,null)
  assert.equal(plan.rows[1].after,'present')
  const partial=validateImportRows(input([['001','Hadir','']]),records,session)
  assert.equal(partial.changes.length,1)
  assert.equal(partial.changes[0].id,'record-1')
})
test('import requires correction reasons and preserves expected revisions',()=>{
  assert.ok(validateImportRows(input([['TEST_2','Sakit','']]),records,session).errors.length)
  assert.ok(validateImportRows(input([['001','not-a-status','']]),records,session).errors.length)
  const plan=validateImportRows(input([['TEST_2','Sakit','Data Contoh Koreksi']]),records,session)
  assert.deepEqual(plan.changes,[{id:'record-2',status:'sick',revision:2,reason:'Data Contoh Koreksi'}])
  assert.deepEqual(plan.errors,[])
})
test('import rejects oversized row sets and extra nonempty columns',()=>{
  assert.ok(validateImportRows(input(Array.from({length:101},()=>['001','Hadir',''])),records,session).errors.length)
  assert.ok(validateImportRows(input([['001','Hadir','','unexpected']]),records,session).errors.length)
})
test('real XLSX template round-trips text codes and session metadata',async()=>{
  const rows=templateRows(records,session)
  const buffer=await writeExcelFile(rows.map(row=>row.map(value=>({type:String,value})))).toBuffer()
  const parsed=await readAttendanceWorkbook(new Uint8Array(buffer).buffer)
  const plan=validateImportRows(parsed,records,session)
  assert.deepEqual(plan.errors,[])
  assert.equal(plan.rows[0].code,'001')
  assert.equal(plan.changes.length,0)
})
test('XLSX reader rejects formulas, multiple sheets and invalid containers',async()=>{
  const formula=await writeExcelFile([[{type:'Formula',value:'1+1'}]]).toBuffer()
  await assert.rejects(readAttendanceWorkbook(new Uint8Array(formula).buffer),/Rumus Excel/)
  const sheets=await writeExcelFile([{sheet:'One',data:[['A']]},{sheet:'Two',data:[['B']]}]).toBuffer()
  await assert.rejects(readAttendanceWorkbook(new Uint8Array(sheets).buffer),/satu sheet/)
  await assert.rejects(readAttendanceWorkbook(new TextEncoder().encode('not a zip').buffer))
})
