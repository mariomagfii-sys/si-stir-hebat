import { expect, test, type Page } from '@playwright/test'

const userId = '10000000-0000-4000-8000-000000000001'
const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'akun-uji@example.test', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
const session = {
  access_token: `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ sub: userId, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test-signature`,
  refresh_token: 'browser-test-refresh-token', token_type: 'bearer', expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600, user,
}

async function boot(page: Page, role = 'administrator') {
  await page.addInitScript(({ session }) => {
    localStorage.setItem('sb-school-abc-auth-token', JSON.stringify(session))
    sessionStorage.setItem('fixture-initialized', 'true')
  }, { session })
  await page.route('https://school-abc.supabase.co/**', route => {
    const request = route.request()
    const url = new URL(request.url())
    const json = (data: unknown, status = 200, headers: Record<string, string> = {}) => route.fulfill({ status, contentType: 'application/json', headers, body: JSON.stringify(data) })
    if (url.pathname.endsWith('/token')) return json(session)
    if (url.pathname.endsWith('/logout')) return route.fulfill({ status: 204 })
    if (url.pathname.endsWith('/user')) return json({ user })
    if (url.pathname.endsWith('/profiles')) return json([{ id: userId, full_name: 'Pengguna Uji', role }])
    if (url.pathname.endsWith('/rpc/dashboard_overview')) return json({
      profile: { full_name: 'Pengguna Uji', role: 'administrator' },
      active: { students: 0, teachers: 0, classes: 0 },
      supervision_stages: { '1': 0, '2': 0, '3': 0, '4': 0 },
      teaching_modules: { submitted: 0, returned: 0 },
      announcements: { published_count: 0, draft_count: 0, recent: [] },
    })
    if (request.method() === 'HEAD') return route.fulfill({ status: 200, headers: { 'content-range': '0-0/0' } })
    return json([])
  })
}

const audits = [
  { role: 'administrator', routes: ['/', '/dashboard', '/sekolah', '/absensi', '/jurnal', '/modul-ajar', '/jadwal', '/pengumuman', '/tautan-akun', '/notifikasi', '/kebiasaan', '/akun'] },
  { role: 'teacher', routes: ['/', '/dashboard', '/materi', '/tugas', '/asesmen', '/supervisi', '/komunikasi', '/jurnal', '/modul-ajar', '/jadwal', '/notifikasi', '/kebiasaan', '/laporan-ketidakhadiran'] },
  { role: 'parent', routes: ['/', '/dashboard', '/ruang-orang-tua', '/laporan-ketidakhadiran', '/notifikasi', '/kebiasaan', '/pengumuman'] },
  { role: 'student', routes: ['/', '/dashboard', '/materi', '/tugas', '/asesmen', '/jadwal', '/pengumuman', '/notifikasi', '/kebiasaan', '/akun', '/laporan-ketidakhadiran', '/komunikasi', '/dokumen', '/absensi-guru'] },
  { role: 'pending', routes: ['/', '/dashboard', '/akun', '/materi', '/tugas', '/asesmen', '/jadwal', '/pengumuman', '/notifikasi', '/kebiasaan', '/laporan-ketidakhadiran', '/komunikasi', '/dokumen', '/absensi-guru'] },
]

for (const { role, routes } of audits) for (const path of routes) {
  test(`no horizontal overflow (${role}): ${path}`, async ({ page }) => {
    await boot(page, role)
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}

test('skip link moves focus to main content', async ({ page }) => {
  await boot(page)
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Langsung ke isi halaman' })
  await expect(skip).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
})

test('navigation targets meet the 44px touch minimum', async ({ page }) => {
  await boot(page)
  await page.goto('/')
  const width = page.viewportSize()?.width ?? 1280
  if (width < 1000) {
    const links = page.getByRole('navigation', { name: 'Navigasi cepat' }).getByRole('link')
    for (const link of await links.all()) {
      const box = await link.boundingBox()
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)
    }
    await page.getByRole('button', { name: 'Lainnya', exact: true }).click()
    const drawerLinks = page.getByRole('dialog').getByRole('link')
    for (const link of await drawerLinks.all()) {
      const box = await link.boundingBox()
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    }
  } else {
    const links = page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('link')
    for (const link of await links.all()) {
      const box = await link.boundingBox()
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    }
  }
})
