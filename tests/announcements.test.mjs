import test from 'node:test'
import assert from 'node:assert/strict'
import { canManageAnnouncements, canReadAnnouncements, validateAnnouncement } from '../src/lib/announcements.ts'

test('only administrator and principal can manage announcements', () => {
  for (const role of ['administrator', 'principal']) assert.equal(canManageAnnouncements(role), true)
  for (const role of ['teacher', 'student', 'parent', 'pending', 'unexpected', null]) assert.equal(canManageAnnouncements(role), false)
})

test('only assigned school roles can read announcements', () => {
  for (const role of ['administrator', 'principal', 'teacher', 'student', 'parent']) assert.equal(canReadAnnouncements(role), true)
  for (const role of ['pending', 'unexpected', null]) assert.equal(canReadAnnouncements(role), false)
})

test('announcement validation rejects blank content and oversized fields', () => {
  assert.notEqual(validateAnnouncement('   ', 'Kegiatan sekolah'), '')
  assert.notEqual(validateAnnouncement('Judul', '\n  '), '')
  assert.notEqual(validateAnnouncement('a'.repeat(161), 'Isi'), '')
  assert.notEqual(validateAnnouncement('Judul', 'a'.repeat(10001)), '')
  assert.equal(validateAnnouncement('a'.repeat(160), 'a'.repeat(10000)), '')
  assert.equal(validateAnnouncement(' Jadwal belajar ', ' Kegiatan sekolah\nBesok pagi. '), '')
})
