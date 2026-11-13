import test from 'node:test'
import assert from 'node:assert/strict'
import { journalPayload, validateJournal, validateJournalRange } from '../src/features/journals/journal-model.ts'
const valid={assignment_id:'test',topic:' Data Contoh ',activities:' Kegiatan ',reflection:' Refleksi '}
test('journal date filter accepts all dates or an inclusive valid ordered range',()=>{
  for(const [start,end] of [['',''],['2024-02-29','2024-02-29'],['2026-01-01','2026-12-31']]) assert.equal(validateJournalRange(start,end),'')
  for(const [start,end] of [['2026-01-01',''],['','2026-01-01'],['2026-02-29','2026-03-01'],['2026-01-02','2026-01-01'],['0000-01-01','0000-01-02'],['2026-1-1','2026-01-02']]) assert.notEqual(validateJournalRange(start,end),'')
})
test('journal validates meaningful content and unicode length bounds',()=>{
  assert.equal(validateJournal(valid),'')
  for(const draft of [{...valid,assignment_id:''},{...valid,topic:'\n\t'},{...valid,activities:' '},{...valid,topic:'x'.repeat(161)},{...valid,activities:'x'.repeat(4001)},{...valid,reflection:'x'.repeat(2001)}]) assert.notEqual(validateJournal(draft),'')
  assert.equal(validateJournal({...valid,topic:'🎓'.repeat(160)}),'')
})
test('journal payload trims only permitted content and never sends author or snapshots',()=>{
  assert.deepEqual(journalPayload({...valid,created_by:'forged',class_name:'forged'}),{assignment_id:'test',topic:'Data Contoh',activities:'Kegiatan',reflection:'Refleksi'})
})
