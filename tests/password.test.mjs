import test from 'node:test'
import assert from 'node:assert/strict'
import { validateNewPassword } from '../src/lib/password.ts'

test('rejects empty and short passwords even when confirmation matches', () => {
  for (const password of ['', '1234567']) {
    assert.notEqual(validateNewPassword(password, password), '')
  }
})

test('requires an exact confirmation including surrounding spaces', () => {
  assert.notEqual(validateNewPassword('kata sandi baru', 'kata sandi lain'), '')
  assert.notEqual(validateNewPassword(' kata sandi ', 'kata sandi'), '')
})

test('accepts matching passwords at the minimum length and above', () => {
  for (const password of ['abc12345', 'Kata sandi panjang!']) {
    assert.equal(validateNewPassword(password, password), '')
  }
})
