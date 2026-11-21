import type { SupabaseClient } from '@supabase/supabase-js'

export type TeacherAttendance = {
  id: string
  teacher_profile_id: string
  attendance_on: string
  check_in_at: string | null
  check_out_at: string | null
  check_in_request_id: string
  check_out_request_id: string | null
  revision: number
  created_at: string
  updated_at: string
}

export type TeacherAttendanceCorrection = {
  id: string
  request_id: string
  attendance_id: string
  requester_profile_id: string
  proposed_check_in_at: string | null
  proposed_check_out_at: string | null
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string
  revision: number
  created_at: string
}

const attendanceColumns = 'id,teacher_profile_id,attendance_on,check_in_at,check_out_at,check_in_request_id,check_out_request_id,revision,created_at,updated_at'
const correctionColumns = 'id,request_id,attendance_id,requester_profile_id,proposed_check_in_at,proposed_check_out_at,reason,status,reviewed_by,reviewed_at,review_note,revision,created_at'

export async function daftarAbsensiGuru(client: SupabaseClient, from: string, through: string, page = 0): Promise<{ items: TeacherAttendance[]; hasMore: boolean }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(through) || from > through || !Number.isSafeInteger(page) || page < 0 || page > 10000) {
    throw new Error('Rentang atau halaman absensi guru tidak valid.')
  }
  const { data, error } = await client.from('teacher_attendance').select(attendanceColumns).gte('attendance_on', from).lte('attendance_on', through)
    .order('attendance_on', { ascending: false }).order('id', { ascending: false }).range(page * 25, page * 25 + 25)
  if (error) throw error
  const rows = (data ?? []) as TeacherAttendance[]
  return { items: rows.slice(0, 25), hasMore: rows.length > 25 }
}

export async function catatAbsensiGuru(client: SupabaseClient, action: 'check_in' | 'check_out', requestId: string): Promise<TeacherAttendance> {
  if (!requestId.trim()) throw new Error('ID permintaan absensi wajib diisi.')
  const { data, error } = await client.rpc('record_teacher_attendance', { requested_action: action, requested_id: requestId })
  if (error) throw error
  return data as TeacherAttendance
}

export async function ajukanKoreksiAbsensiGuru(client: SupabaseClient, input: {
  request_id: string
  attendance_on: string
  proposed_check_in_at: string | null
  proposed_check_out_at: string | null
  reason: string
}): Promise<TeacherAttendanceCorrection> {
  const reason = input.reason.trim()
  if (!input.request_id.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(input.attendance_on) || (!input.proposed_check_in_at && !input.proposed_check_out_at) || reason.length < 5 || Array.from(reason).length > 1000) {
    throw new Error('Data koreksi absensi guru tidak valid.')
  }
  const { data, error } = await client.rpc('request_teacher_attendance_correction', {
    requested_id: input.request_id,
    requested_day: input.attendance_on,
    proposed_check_in: input.proposed_check_in_at,
    proposed_check_out: input.proposed_check_out_at,
    requested_reason: reason,
  })
  if (error) throw error
  return data as TeacherAttendanceCorrection
}

export async function tinjauKoreksiAbsensiGuru(client: SupabaseClient, id: string, revision: number, decision: 'approved' | 'rejected', note = ''): Promise<TeacherAttendanceCorrection> {
  if (!id.trim() || !Number.isSafeInteger(revision) || revision < 0 || Array.from(note.trim()).length > 1000) throw new Error('Identitas atau revisi koreksi tidak valid.')
  const { data, error } = await client.rpc('review_teacher_attendance_correction', {
    target_id: id,
    expected_revision: revision,
    decision,
    note: note.trim(),
  })
  if (error) throw error
  return data as TeacherAttendanceCorrection
}

export async function daftarKoreksiAbsensiGuru(client: SupabaseClient, status: TeacherAttendanceCorrection['status'] = 'pending', page = 0): Promise<{ items: TeacherAttendanceCorrection[]; hasMore: boolean }> {
  if (!Number.isSafeInteger(page) || page < 0 || page > 10000) throw new Error('Halaman koreksi absensi tidak valid.')
  const { data, error } = await client.from('teacher_attendance_corrections').select(correctionColumns).eq('status', status)
    .order('created_at', { ascending: false }).order('id', { ascending: false }).range(page * 25, page * 25 + 25)
  if (error) throw error
  const rows = (data ?? []) as TeacherAttendanceCorrection[]
  return { items: rows.slice(0, 25), hasMore: rows.length > 25 }
}
