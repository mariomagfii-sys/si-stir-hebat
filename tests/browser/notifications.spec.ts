import { expect, test, type Page } from '@playwright/test'

const userId = '10000000-0000-4000-8000-000000000021'
const user = {
  id: userId,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'wali@example.test',
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
}
const session = {
  access_token: `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ sub: userId, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test-signature`,
  refresh_token: 'browser-test-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user,
}

type Row = {
  id: string
  recipient_profile_id: string
  category: string
  priority: string
  title: string
  body: string
  read_at: string | null
  created_at: string
}

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `notification-${index}`,
    recipient_profile_id: userId,
    category: index % 2 === 0 ? 'absence_report' : 'announcement',
    priority: 'normal',
    title: `Data Contoh notifikasi ${index}`,
    body: `Isi Data Contoh notifikasi ${index}.`,
    read_at: null,
    created_at: new Date(Date.UTC(2026, 10, 20, 8, 0, index)).toISOString(),
  }))
}

async function setupParent(page: Page, rows: Row[]) {
  const ranges: string[] = []
  let rpcCalls = 0

  await page.addInitScript(({ storedSession }) => {
    localStorage.setItem('sb-school-abc-auth-token', JSON.stringify(storedSession))
  }, { storedSession: session })

  await page.route('https://fonts.googleapis.com/**', route => route.abort())
  await page.route('https://fonts.gstatic.com/**', route => route.abort())
  await page.route('https://school-abc.supabase.co/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const json = (data: unknown, status = 200) => route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(data),
    })

    if (url.pathname.endsWith('/user')) return json({ user })
    if (url.pathname.endsWith('/profiles')) return json([{ role: 'parent' }])

    if (url.pathname.endsWith('/rpc/mark_notification_read')) {
      rpcCalls += 1
      if (rpcCalls === 1) return route.abort()
      const { target_id: targetId } = request.postDataJSON()
      const row = rows.find(item => item.id === targetId)
      if (!row) return json({ message: 'Notification not found' }, 404)
      row.read_at = '2026-11-20T09:30:00.000Z'
      return json(row)
    }

    if (url.pathname.endsWith('/notifications')) {
      const start = Number(url.searchParams.get('offset') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? 26)
      ranges.push(`${start}-${start + limit - 1}`)
      return json(rows.slice(start, start + limit))
    }

    throw new Error(`Permintaan Supabase tidak dikenal: ${request.method()} ${url.pathname}`)
  })

  return { ranges, rpcCalls: () => rpcCalls }
}

test('notification center retries marking the same notification without losing it', async ({ page }) => {
  const rows = makeRows(2)
  const state = await setupParent(page, rows)

  await page.goto('/notifikasi')
  await expect(page.getByRole('heading', { name: 'Pusat notifikasi' })).toBeVisible()
  await expect(page.getByText('2 notifikasi belum dibaca pada halaman ini.')).toBeVisible()

  const first = page.getByRole('article').filter({ hasText: 'Data Contoh notifikasi 0' })
  await first.getByRole('button', { name: 'Tandai sudah dibaca' }).click()
  await expect(page.getByText(/belum tersimpan/)).toBeVisible()
  await expect(first.getByRole('button', { name: 'Tandai sudah dibaca' })).toBeEnabled()

  await first.getByRole('button', { name: 'Tandai sudah dibaca' }).click()
  await expect(page.getByText(/ditandai sudah dibaca/)).toBeVisible()
  await expect(page.getByText('1 notifikasi belum dibaca pada halaman ini.')).toBeVisible()
  await expect(first.getByText('Dibaca', { exact: false })).toBeVisible()
  expect(state.rpcCalls()).toBe(2)
  expect(rows[0].read_at).not.toBeNull()

  const second = page.getByRole('article').filter({ hasText: 'Data Contoh notifikasi 1' })
  await expect(second.getByRole('button', { name: 'Tandai sudah dibaca' })).toBeVisible()
})

test('pending account sees no notification link or rows', async ({ page }) => {
  await page.addInitScript(({ storedSession }) => {
    localStorage.setItem('sb-school-abc-auth-token', JSON.stringify(storedSession))
  }, { storedSession: session })
  await page.route('https://fonts.googleapis.com/**', route => route.abort())
  await page.route('https://fonts.gstatic.com/**', route => route.abort())
  await page.route('https://school-abc.supabase.co/**', route => {
    const request = route.request()
    const url = new URL(request.url())
    const json = (data: unknown) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) })
    if (url.pathname.endsWith('/user')) return json({ user })
    if (url.pathname.endsWith('/profiles')) return json([{ role: 'pending' }])
    if (url.pathname.endsWith('/notifications')) return json([])
    throw new Error(`Permintaan Supabase tidak dikenal: ${request.method()} ${url.pathname}`)
  })

  await page.goto('/notifikasi')
  await expect(page.getByRole('heading', { name: 'Pusat notifikasi' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Notifikasi' })).toHaveCount(0)
  await expect(page.getByText('Belum ada notifikasi untuk akun Anda.')).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(0)
})

test('notification center pages through 25 rows without skipping the sentinel', async ({ page }) => {
  const rows = makeRows(26)
  const state = await setupParent(page, rows)

  await page.goto('/notifikasi')
  await expect(page.getByRole('article').filter({ hasText: 'Data Contoh notifikasi 0' })).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: 'Data Contoh notifikasi 25' })).toHaveCount(0)
  await expect(page.locator('[aria-live="polite"]').filter({ hasText: 'Halaman 1' })).toBeVisible()
  const truncation = page.getByText('Daftar terpotong; muat halaman berikutnya.')
  await expect(truncation).toBeVisible()

  await page.getByRole('button', { name: 'Berikutnya' }).click()
  await expect(page.getByRole('article').filter({ hasText: 'Data Contoh notifikasi 25' })).toBeVisible()
  await expect(page.locator('[aria-live="polite"]').filter({ hasText: 'Halaman 2' })).toBeVisible()
  await expect(truncation).toHaveCount(0)
  expect(state.ranges.slice(-2)).toEqual(['0-25', '25-50'])

  await page.getByRole('button', { name: 'Sebelumnya' }).click()
  await expect(page.getByRole('article').filter({ hasText: 'Data Contoh notifikasi 0' })).toBeVisible()
})
