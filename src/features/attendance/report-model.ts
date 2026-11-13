import type { AttendanceStatus } from './attendance-model.ts'

export function validateReportRange(start: string, end: string) {
  const valid = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value
  if (!valid(start) || !valid(end)) return 'Isi tanggal awal dan akhir yang valid.'
  const days = (Date.parse(end)-Date.parse(start))/86400000+1
  return days < 1 ? 'Tanggal akhir tidak boleh mendahului tanggal awal.' : days > 31 ? 'Pilih rentang maksimal 31 hari.' : ''
}

export type ReportRecord = { student_id: string; student_code: string; student_name: string; status: AttendanceStatus | null }
export function summarizeReport(records: ReportRecord[]) {
  const students = new Map<string, { id: string; code: string; name: string; present: number; sick: number; excused: number; absent: number; unmarked: number; total: number }>()
  for (const record of records) {
    const row = students.get(record.student_id) ?? { id: record.student_id, code: record.student_code, name: record.student_name, present: 0, sick: 0, excused: 0, absent: 0, unmarked: 0, total: 0 }
    row.code = record.student_code; row.name = record.student_name
    row[record.status ?? 'unmarked']++; row.total++
    students.set(record.student_id,row)
  }
  return [...students.values()].sort((a,b)=>a.name.localeCompare(b.name,'id') || a.id.localeCompare(b.id))
}
