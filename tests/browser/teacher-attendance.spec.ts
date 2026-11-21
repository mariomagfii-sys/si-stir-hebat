import { expect, test, type Page } from '@playwright/test'

const userId = '10000000-0000-4000-8000-000000000051'
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

const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })

type Attendance = {
  id: string
  teacher_profile_id: string
  attendance_on: string
  check_in_at: string | null
  check_out_at: string | null
  check_in_request_id: string
  check_out_request_id: string | null
  revision: number
  created_at: string
  updated_at: string
}

type Correction = {
  id: string
  request_id: string
  attendance_id: string
  requester_profile_id: string
  proposed_check_in_at: string | null
  proposed_check_out_at: string | null
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string
  revision: number
  created_at: string
}

function makeAttendance(overrides: Partial<Attendance> = {}): Attendance {
  return {
    id: 'attendance-one',
    teacher_profile_id: userId,
    attendance_on: today,
    check_in_at: null,
    check_out_at: null,
    check_in_request_id: 'stored-request',
    check_out_request_id: null,
    revision: 0,
    created_at: `${today}T00:00:00.000Z`,
    updated_at: `${today}T00:00:00.000Z`,
    ...overrides,
  }
}

function makeCorrection(overrides: Partial<Correction> = {}): Correction {
  return {
    id: 'correction-one',
    request_id: 'correction-request',
    attendance_id: 'attendance-one',
    requester_profile_id: 'teacher-profile',
    proposed_check_in_at: '2026-11-19T00:15:00.000Z',
    proposed_check_out_at: null,
    reason: 'Data Contoh lupa mencatat jam masuk',
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    review_note: '',
    revision: 0,
    created_at: '2026-11-19T02:00:00.000Z',
    ...overrides,
  }
}

async function installSession(page: Page) {
  await page.addInitScript(({ storedSession }) => {
    localStorage.setItem('sb-school-abc-auth-token', JSON.stringify(storedSession))
  }, { storedSession: session })
  await page.route('https://fonts.googleapis.com/**', route => route.abort())
  await page.route('https://fonts.gstatic.com/**', route => route.abort())
}

async function mockSupabase(page: Page, role: string, initial: Attendance[], corrections: Correction[]) {
  const rows = [...initial]
  const reviewIds: string[] = []
  const tableReads: string[] = []
  let checks = 0

  await installSession(page)
  await page.route('https://school-abc.supabase.co/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const json = (data: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })

    if (url.pathname.endsWith('/user')) return json({ user })
    if (url.pathname.endsWith('/profiles')) return json([{ role }])
    if (url.pathname.endsWith('/teacher_attendance')) {
      if (request.method() === 'GET') tableReads.push(url.pathname)
      const start = Number(url.searchParams.get('offset') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? 26)
      return json(rows.slice(start, start + limit))
    }
    if (url.pathname.endsWith('/teacher_attendance_corrections')) {
      if (request.method() === 'GET') tableReads.push(url.pathname)
      const start = Number(url.searchParams.get('offset') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? 26)
      return json(corrections.slice(start, start + limit))
    }

    if (url.pathname.endsWith('/rpc/record_teacher_attendance')) {
      checks += 1
      if (checks === 1) return route.abort()
      const payload = request.postDataJSON()
      const saved = makeAttendance({ check_in_at: `${today}T00:00:00.000Z`, check_in_request_id: payload.requested_id })
      rows.unshift(saved)
      return json(saved)
    }

    if (url.pathname.endsWith('/rpc/request_teacher_attendance_correction')) {
      const payload = request.postDataJSON()
      const saved = makeCorrection({ request_id: payload.requested_id, reason: payload.requested_reason })
      return json(saved)
    }

    if (url.pathname.endsWith('/rpc/review_teacher_attendance_correction')) {
      const payload = request.postDataJSON()
      reviewIds.push(payload.target_id)
      const current = corrections[0]
      const updated = { ...current, status: payload.decision as Correction['status'], revision: current.revision + 1, review_note: payload.note }
      corrections[0] = updated
      return json(updated)
    }

    throw new Error(`Permintaan Supabase tidak dikenal: ${request.method()} ${url.pathname}`)
  })

  return { checks: () => checks, reviewIds, tableReads }
}

test('teacher attendance retries check-in with the same request id', async ({ page }) => {
  const state = await mockSupabase(page, 'teacher', [], [])

  await page.goto('/absensi-guru')
  await expect(page.getByRole('heading', { name: 'Absensi guru', level: 1 })).toBeVisible()
  await expect(page.getByText('Belum ada absensi guru pada rentang tanggal ini.')).toBeVisible()

  await page.getByRole('button', { name: 'Absen masuk' }).click()
  await expect(page.getByText('Absen masuk belum terkonfirmasi. ID permintaan dipertahankan; coba lagi dengan tombol yang sama.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Kirim ulang absen masuk' })).toBeVisible()

  await page.getByRole('button', { name: 'Kirim ulang absen masuk' }).click()
  await expect(page.getByText('Absen masuk tercatat.')).toBeVisible()
  await expect(page.getByRole('article').getByText(/^Masuk /)).toBeVisible()
  expect(state.checks()).toBe(2)
  await expect(page.getByRole('button', { name: 'Absen masuk' })).toBeVisible()
})

test('principal reviews a teacher correction', async ({ page }) => {
  const state = await mockSupabase(page, 'principal', [makeAttendance({ check_in_at: `${today}T00:00:00.000Z` })], [makeCorrection()])

  await page.goto('/absensi-guru')
  await expect(page.getByText('Data Contoh lupa mencatat jam masuk')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Absen masuk' })).toHaveCount(0)

  await page.getByLabel('Catatan keputusan untuk koreksi ini').fill('Data Contoh disetujui setelah pemeriksaan')
  await page.getByRole('button', { name: 'Setujui koreksi' }).click()
  await expect(page.getByText('Koreksi absensi disetujui.')).toBeVisible()
  await expect(page.getByRole('article').getByText('Disetujui', { exact: true })).toBeVisible()
  expect(state.reviewIds).toEqual(['correction-one'])
})

for (const role of ['parent', 'student', 'pending'] as const) {
  test(`${role} cannot open teacher attendance`, async ({ page }) => {
    const state = await mockSupabase(page, role, [], [])

    await page.goto('/absensi-guru')
    await expect(page.getByText('Halaman ini tersedia untuk guru, kepala sekolah, dan administrator.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Absen masuk' })).toHaveCount(0)
    expect(state.tableReads).toEqual([])
  })
}

test('teacher pages through attendance history and clears the truncation notice on the last page', async ({ page }) => {
  const rows = Array.from({ length: 26 }, (_, index) => makeAttendance({
    id: `attendance-${index + 1}`,
    attendance_on: `2026-10-${String(26 - index).padStart(2, '0')}`,
    revision: index,
  }))
  await mockSupabase(page, 'teacher', rows, [])

  await page.goto('/absensi-guru')
  const pager = page.getByRole('navigation', { name: 'Halaman riwayat absensi guru' })
  const truncation = page.getByText('Daftar terpotong; muat halaman berikutnya.')

  await expect(page.getByText(/^Revisi 0\./)).toBeVisible()
  await expect(page.getByText(/^Revisi 25\./)).toHaveCount(0)
  await expect(truncation).toBeVisible()
  await expect(pager.getByText('Halaman 1', { exact: true })).toBeVisible()

  await pager.getByRole('button', { name: 'Berikutnya' }).click()
  await expect(page.getByText(/^Revisi 25\./)).toBeVisible()
  await expect(page.getByText(/^Revisi 0\./)).toHaveCount(0)
  await expect(pager.getByText('Halaman 2', { exact: true })).toBeVisible()
  await expect(truncation).toHaveCount(0)

  await pager.getByRole('button', { name: 'Sebelumnya' }).click()
  await expect(page.getByText(/^Revisi 0\./)).toBeVisible()
  await expect(pager.getByText('Halaman 1', { exact: true })).toBeVisible()
  await expect(truncation).toBeVisible()
})
