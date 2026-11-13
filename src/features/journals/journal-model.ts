export type JournalDraft = { assignment_id: string; topic: string; activities: string; reflection: string }
export function validateJournalRange(start:string,end:string) {
  if(!start && !end) return ''
  const valid=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value) && !value.startsWith('0000') && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value
  if(!valid(start) || !valid(end)) return 'Isi kedua tanggal dengan tanggal kalender yang valid, atau kosongkan keduanya.'
  return end<start ? 'Tanggal akhir jurnal tidak boleh mendahului tanggal awal.' : ''
}
export function journalPayload(draft: JournalDraft) {
  return { assignment_id:draft.assignment_id, topic:draft.topic.trim(), activities:draft.activities.trim(), reflection:draft.reflection.trim() }
}
export function validateJournal(draft: JournalDraft) {
  const value=journalPayload(draft)
  if(!value.assignment_id) return 'Pilih penugasan mengajar.'
  if(!value.topic || Array.from(value.topic).length>160) return 'Isi topik 1–160 karakter.'
  if(!value.activities || Array.from(value.activities).length>4000) return 'Isi kegiatan 1–4.000 karakter.'
  if(Array.from(value.reflection).length>2000) return 'Refleksi maksimal 2.000 karakter.'
  return ''
}
