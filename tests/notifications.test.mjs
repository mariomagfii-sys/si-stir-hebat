import test from 'node:test'
import assert from 'node:assert/strict'

test('notification page rejects invalid values', async () => {
  const { validateNotificationPage } = await import('../src/features/notifications/api/index.ts')
  assert.throws(() => validateNotificationPage(-1))
  assert.throws(() => validateNotificationPage(1.5))
  validateNotificationPage(0)
})
