import type { SupabaseClient } from '@supabase/supabase-js'

export type GuardianAbsenceReport = {
  id: string
  request_id: string
  student_id: string
  parent_profile_id: string
  report_date: string
  reason: string
  status: 'submitted' | 'confirmed' | 'rejected'
  teacher_id: string | null
  teacher_note: string
  revision: number
  created_at: string
  updated_at: string
}

const columns = 'id,request_id,student_id,parent_profile_id,report_date,reason,status,teacher_id,teacher_note,revision,created_at,updated_at'

export function validateAbsenceReport(reportDate: string, reason: string, today: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) return 'Tanggal laporan tidak valid.'
  if (reportDate > today) return 'Laporan untuk tanggal mendatang tidak diperbolehkan.'
  if (!reason.trim() || Array.from(reason.trim()).length > 1000) return 'Alasan wajib diisi, maksimal 1.000 karakter.'
  return ''
}

export async function daftarLaporanKetidakhadiran(client: SupabaseClient, studentId?: string, page = 0): Promise<{ items: GuardianAbsenceReport[]; hasMore: boolean }> {
  if (!Number.isSafeInteger(page) || page < 0 || page > 10000) throw new Error('Halaman tidak valid.')
  let query = client.from('guardian_absence_reports').select(columns).order('report_date', { ascending: false }).order('created_at', { ascending: false }).range(page * 25, page * 25 + 25)
  if (studentId) query = query.eq('student_id', studentId)
  const { data, error } = await query
  if (error) throw error
  const rows = (data ?? []) as GuardianAbsenceReport[]
  return { items: rows.slice(0, 25), hasMore: rows.length > 25 }
}

export async function kirimLaporanKetidakhadiran(client: SupabaseClient, report: Pick<GuardianAbsenceReport, 'request_id' | 'student_id' | 'report_date' | 'reason'>, today: string): Promise<GuardianAbsenceReport> {
  const reason = report.reason.trim()
  const invalid = validateAbsenceReport(report.report_date, reason, today)
  if (invalid) throw new Error(invalid)
  const { data, error } = await client.from('guardian_absence_reports')
    .insert({ request_id: report.request_id, student_id: report.student_id, report_date: report.report_date, reason })
    .select(columns).single()
  if (error) throw error
  return data as GuardianAbsenceReport
}

export async function reviewLaporanKetidakhadiran(client: SupabaseClient, id: string, revision: number, decision: 'confirmed' | 'rejected', note: string): Promise<GuardianAbsenceReport> {
  const trimmed = note.trim()
  if (!id || !Number.isSafeInteger(revision) || revision < 0) throw new Error('Identitas laporan tidak valid.')
  if (!trimmed || Array.from(trimmed).length > 1000) throw new Error('Catatan pemeriksa wajib diisi, maksimal 1.000 karakter.')
  const { data, error } = await client.rpc('review_guardian_absence_report', { target_id: id, expected_revision: revision, decision, note: trimmed })
  if (error) throw error
  return data as GuardianAbsenceReport
}
