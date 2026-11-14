export const schoolRoleLabels: Record<string, string> = {
  pending: 'Menunggu penetapan peran', administrator: 'Administrator',
  principal: 'Kepala Sekolah', teacher: 'Guru', student: 'Murid', parent: 'Orang Tua',
}

export function canReadJournals(role: string | null) {
  return role === 'administrator' || role === 'principal' || role === 'teacher'
}

export function canReadAttendance(role: string | null) {
  return canReadJournals(role) || role === 'student'
}
