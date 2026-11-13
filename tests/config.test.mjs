import test from 'node:test'
import assert from 'node:assert/strict'
import { getPublicSupabaseConfig } from '../src/lib/config.ts'

test('public configuration rejects incomplete, placeholder, or malformed values', () => {
  for (const [url, key] of [[undefined, undefined], ['bad-url', 'sb_publishable_test'], ['https://YOUR_PROJECT.supabase.co', 'YOUR_PUBLISHABLE_KEY'], ['https://example.supabase.co', ''], ['https://example.supabase.co/path', 'sb_publishable_test']]) {
    assert.equal(getPublicSupabaseConfig(url, key), null)
  }
})
test('public configuration rejects secrets and insecure remote URLs', () => {
  assert.equal(getPublicSupabaseConfig('http://example.supabase.co', 'sb_publishable_test'), null)
  assert.equal(getPublicSupabaseConfig('https://example.supabase.co', 'sb_secret_private'), null)
  const secretJwt = `header.${btoa(JSON.stringify({ role: 'service_role' }))}.signature`
  assert.equal(getPublicSupabaseConfig('https://example.supabase.co', secretJwt), null)
})
test('public configuration accepts publishable keys and legacy anon keys', () => {
  assert.deepEqual(getPublicSupabaseConfig(' https://example.supabase.co/ ', ' sb_publishable_test '), { url: 'https://example.supabase.co', key: 'sb_publishable_test' })
  assert.notEqual(getPublicSupabaseConfig('http://127.0.0.1:54321', 'sb_publishable_test'), null)
  const anonJwt = `header.${btoa(JSON.stringify({ role: 'anon' }))}.signature`
  assert.notEqual(getPublicSupabaseConfig('https://example.supabase.co', anonJwt), null)
})
