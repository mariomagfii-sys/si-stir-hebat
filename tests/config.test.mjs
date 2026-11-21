import test from 'node:test'
import assert from 'node:assert/strict'
import { getPublicSupabaseConfig, resolvePublicRuntimeConfig } from '../src/lib/config.ts'

test('public configuration rejects incomplete, placeholder, or malformed values', () => {
  for (const [url, key] of [
    [undefined, undefined],
    ['bad-url', 'sb_publishable_abcdefghijklmnopqrstuv_12345678'],
    ['https://YOUR_PROJECT.supabase.co', 'YOUR_PUBLISHABLE_KEY'],
    ['https://example.supabase.co', 'sb_publishable_abcdefghijklmnopqrstuv_12345678'],
    ['https://school-abc.supabase.co', ''],
    ['https://school-abc.supabase.co/path', 'sb_publishable_abcdefghijklmnopqrstuv_12345678'],
    ['https://school-abc.supabase.co', 'sb_publishable_test'],
  ]) {
    assert.equal(getPublicSupabaseConfig(url, key), null)
  }
})
test('public configuration rejects secrets and insecure remote URLs', () => {
  const validPublishableKey = 'sb_publishable_abcdefghijklmnopqrstuv_12345678'
  assert.equal(getPublicSupabaseConfig('http://school-abc.supabase.co', validPublishableKey), null)
  assert.equal(getPublicSupabaseConfig('https://school-abc.supabase.co', ['sb', 'secret', 'abcdefghijklmnopqrstuv_12345678'].join('_')), null)
  const secretJwt = `header.${btoa(JSON.stringify({ role: 'service_role' }))}.signature`
  assert.equal(getPublicSupabaseConfig('https://school-abc.supabase.co', secretJwt), null)
  const legacyAnonJwt = `header.${btoa(JSON.stringify({ role: 'anon' }))}.signature`
  assert.equal(getPublicSupabaseConfig('https://school-abc.supabase.co', legacyAnonJwt), null)
})
test('public configuration accepts only correctly formed publishable keys', () => {
  const key = 'sb_publishable_abcdefghijklmnopqrstuv_12345678'
  assert.deepEqual(getPublicSupabaseConfig(` https://school-abc.supabase.co/ `, ` ${key} `), { url: 'https://school-abc.supabase.co', key })
  assert.notEqual(getPublicSupabaseConfig('https://school-abc.supabase.co', 'sb_publishable_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), null)
  assert.notEqual(getPublicSupabaseConfig('http://127.0.0.1:54321', key), null)
})

test('runtime config is the single source for configured and demo-allowed flags', () => {
  const key = 'sb_publishable_abcdefghijklmnopqrstuv_12345678'
  assert.deepEqual(resolvePublicRuntimeConfig('https://school-abc.supabase.co', key, true), {
    supabaseConfig: { url: 'https://school-abc.supabase.co', key },
    isConfigured: true,
    demoAllowed: false,
  })
  assert.deepEqual(resolvePublicRuntimeConfig(undefined, undefined, true), {
    supabaseConfig: null,
    isConfigured: false,
    demoAllowed: true,
  })
  assert.deepEqual(resolvePublicRuntimeConfig(undefined, undefined, false), {
    supabaseConfig: null,
    isConfigured: false,
    demoAllowed: false,
  })
})
