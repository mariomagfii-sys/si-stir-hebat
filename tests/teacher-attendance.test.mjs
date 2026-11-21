import test from 'node:test'
import assert from 'node:assert/strict'

test('teacher attendance API sends exact idempotency parameters', async () => {
  const { catatAbsensiGuru } = await import('../src/features/attendance/api/teacher-attendance.ts')
  let rpcCall
  const client = { async rpc(name, args) { rpcCall = [name, args]; return { data: { id: 'attendance-1' }, error: null } } }
  const result = await catatAbsensiGuru(client, 'check_out', 'request-1')
  assert.deepEqual(rpcCall, ['record_teacher_attendance', { requested_action: 'check_out', requested_id: 'request-1' }])
  assert.equal(result.id, 'attendance-1')
  await assert.rejects(catatAbsensiGuru(client, 'check_in', ' '), /ID permintaan/)
})

test('teacher correction API checks payload and forwards optimistic revision', async () => {
  const { ajukanKoreksiAbsensiGuru, tinjauKoreksiAbsensiGuru } = await import('../src/features/attendance/api/teacher-attendance.ts')
  const calls = []
  const client = { async rpc(name, args) { calls.push([name, args]); return { data: { id: 'correction-1' }, error: null } } }
  await assert.rejects(ajukanKoreksiAbsensiGuru(client, {
    request_id: 'req', attendance_on: '2026-11-20', proposed_check_in_at: null, proposed_check_out_at: null, reason: 'tidak ada',
  }), /tidak valid/)
  await ajukanKoreksiAbsensiGuru(client, {
    request_id: 'req', attendance_on: '2026-11-20', proposed_check_in_at: '2026-11-20T08:00:00+07:00', proposed_check_out_at: null, reason: 'Alasan koreksi',
  })
  await tinjauKoreksiAbsensiGuru(client, 'correction-1', 3, 'approved', 'Sesuai bukti')
  assert.equal(calls[0][0], 'request_teacher_attendance_correction')
  assert.equal(calls[0][1].requested_reason, 'Alasan koreksi')
  assert.deepEqual(calls[1], ['review_teacher_attendance_correction', {
    target_id: 'correction-1', expected_revision: 3, decision: 'approved', note: 'Sesuai bukti',
  }])
})
