import { expect, test, type Page } from '@playwright/test'

const userId = '10000000-0000-4000-8000-000000000001'
const user = {
  id: userId,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'guru@example.test',
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
const recipient = {
  assignment_id: 'assignment-one',
  student_id: 'student-one',
  parent_profile_id: 'parent-one',
  teacher_name: 'Data Contoh Guru',
  student_name: 'Data Contoh Siswa',
  parent_name: 'Data Contoh Wali',
}

async function setupTeacher(page: Page, initialMessages: Record<string, unknown>[] = []) {
  const messages = [...initialMessages]
  const ranges: string[] = []
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
    if (url.pathname.endsWith('/profiles')) return json([{ role: 'teacher' }])
    if (url.pathname.endsWith('/rpc/communication_recipients')) return json([recipient])

    if (url.pathname.endsWith('/communication_messages')) {
      if (request.method() === 'POST') {
        const payload = request.postDataJSON()
        const saved = {
          ...payload,
          body: String(payload.body).trim(),
          author_id: userId,
          created_at: '2026-11-15T10:00:00.000Z',
        }
        messages.unshift(saved)
        return json(saved, 201)
      }

      const requestId = url.searchParams.get('id')
      if (requestId) {
        const found = messages.find(message => requestId === `eq.${message.id}`)
        return json(found ?? null)
      }

      const start = Number(url.searchParams.get('offset') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? 26)
      ranges.push(`${start}-${start + limit - 1}`)
      return json(messages.slice(start, start + limit))
    }

    throw new Error(`Permintaan Supabase tidak dikenal: ${request.method()} ${url.pathname}`)
  })

  return { messages, ranges }
}

test('communication confirms a message after the insert response is lost', async ({ page }) => {
  const state = await setupTeacher(page)
  let postCount = 0
  await page.route('**/rest/v1/communication_messages**', async route => {
    if (route.request().method() !== 'POST') return route.fallback()
    postCount += 1
    const payload = route.request().postDataJSON()
    const saved = {
      ...payload,
      body: String(payload.body).trim(),
      author_id: userId,
      created_at: '2026-11-15T10:00:00.000Z',
    }
    state.messages.unshift(saved)
    if (postCount === 1) return route.abort()
    return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(saved) })
  })

  await page.goto('/komunikasi')
  await page.getByLabel('Pesan').fill('Pesan uji dengan respons hilang')
  await page.getByRole('button', { name: 'Kirim pesan' }).click()

  await expect(page.getByRole('status')).toContainText('Pesan berhasil dikirim.')
  await expect(page.getByLabel('Pesan')).toHaveValue('')
  expect(postCount).toBe(1)
  expect(state.messages).toHaveLength(1)
})

for (const role of ['principal', 'administrator', 'student', 'pending'] as const) {
  test(`${role} cannot open communication`, async ({ page }) => {
    const contacted: string[] = []
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
      if (url.pathname.endsWith('/profiles')) return json([{ role }])
      if (url.pathname.endsWith('/rpc/communication_recipients') || url.pathname.endsWith('/communication_messages')) {
        contacted.push(url.pathname)
        return json([])
      }
      throw new Error(`Permintaan Supabase tidak dikenal: ${request.method()} ${url.pathname}`)
    })

    await page.goto('/komunikasi')
    await expect(page.getByRole('heading', { name: 'Komunikasi' })).toBeVisible()
    await expect(page.getByText('Fitur komunikasi hanya tersedia untuk guru dengan penugasan aktif dan wali terverifikasi.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Komunikasi' })).toHaveCount(0)
    expect(contacted).toEqual([])
  })
}

test('communication pages through messages without skipping the sentinel row', async ({ page }) => {
  const initialMessages = Array.from({ length: 26 }, (_, index) => ({
    id: `message-${index}`,
    assignment_id: recipient.assignment_id,
    student_id: recipient.student_id,
    parent_profile_id: recipient.parent_profile_id,
    body: `Data Contoh pesan ${index}`,
    author_id: userId,
    created_at: new Date(Date.UTC(2026, 10, 15, 12, 0, index)).toISOString(),
  }))
  const state = await setupTeacher(page, initialMessages)

  await page.goto('/komunikasi')
  await expect(page.getByRole('cell', { name: 'Data Contoh pesan 0' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Data Contoh pesan 25' })).toHaveCount(0)
  await expect(page.getByText('Halaman 1')).toBeVisible()
  const truncation = page.getByText('Daftar terpotong; muat halaman berikutnya.')
  await expect(truncation).toBeVisible()

  await page.getByRole('button', { name: 'Berikutnya' }).click()
  await expect(page.getByRole('cell', { name: 'Data Contoh pesan 25' })).toBeVisible()
  await expect(page.getByText('Halaman 2')).toBeVisible()
  await expect(truncation).toHaveCount(0)
  expect(state.ranges.slice(-2)).toEqual(['0-25', '25-50'])

  await page.getByRole('button', { name: 'Sebelumnya' }).click()
  await expect(page.getByRole('cell', { name: 'Data Contoh pesan 0' })).toBeVisible()
})
