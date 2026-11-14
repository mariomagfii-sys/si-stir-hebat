export const attendanceLabels = { present: 'Hadir', sick: 'Sakit', excused: 'Izin', absent: 'Alpa' } as const
export type AttendanceStatus = keyof typeof attendanceLabels
export type AttendanceRecord = { id: string; session_id: string; student_code: string; student_name: string; status: AttendanceStatus | null; revision: number }
export type AttendanceDraft = Record<string, { status: string; reason: string }>
export type AttendanceChange = { id: string; status: AttendanceStatus; revision: number; reason: string }

export function schoolToday(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const part = (type: string) => parts.find(value => value.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function attendanceSummary(records: AttendanceRecord[]) {
  const counts = { present: 0, sick: 0, excused: 0, absent: 0, unmarked: 0 }
  for (const record of records) counts[record.status ?? 'unmarked']++
  return counts
}

export function prepareAttendanceChanges(records: AttendanceRecord[], draft: AttendanceDraft): { changes: AttendanceChange[]; error: string } {
  const changes: AttendanceChange[] = []
  for (const record of records) {
    const entry = draft[record.id]
    if (!entry || entry.status === (record.status ?? '')) continue
    if (!Object.hasOwn(attendanceLabels, entry.status)) return { changes: [], error: 'Pilih status kehadiran yang valid.' }
    const reason = entry.reason.trim()
    if (reason.length > 300 || (record.status !== null && reason.length < 5)) return { changes: [], error: `Isi alasan koreksi 5–300 karakter untuk ${record.student_name}.` }
    changes.push({ id: record.id, status: entry.status as AttendanceStatus, revision: record.revision, reason })
  }
  return { changes, error: changes.length ? '' : 'Belum ada perubahan status untuk disimpan.' }
}
