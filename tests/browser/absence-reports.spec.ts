import { expect, test, type Page } from '@playwright/test'

const userId = '10000000-0000-4000-8000-000000000031'
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

const student = { id: 'student-one', name: 'Data Contoh Anak' }

type Report = {
  id: string
  request_id: string
  student_id: string
  parent_profile_id: string
  report_date: string
  reason: string
  status: 'submitted' | 'confirmed' | 'needs_revision'
  teacher_id: string | null
  teacher_note: string
  revision: number
  created_at: string
  updated_at: string
}

function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    id: 'report-one',
    request_id: 'request-one',
    student_id: student.id,
    parent_profile_id: userId,
    report_date: '2026-11-19',
    reason: 'Data Contoh sakit demam',
    status: 'submitted',
    teacher_id: null,
    teacher_note: '',
    revision: 0,
    created_at: '2026-11-19T01:00:00.000Z',
    updated_at: '2026-11-19T01:00:00.000Z',
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

async function setupParent(page: Page) {
  const reports: Report[] = []
  const requestIds: string[] = []
  let posts = 0

  await installSession(page)
  await page.route('https://school-abc.supabase.co/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const json = (data: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })

    if (url.pathname.endsWith('/user')) return json({ user })
    if (url.pathname.endsWith('/profiles')) return json([{ role: 'parent' }])
    if (url.pathname.endsWith('/rpc/habit_students')) return json([student])

    if (url.pathname.endsWith('/guardian_absence_reports')) {
      if (request.method() === 'POST') {
        posts += 1
        const payload = request.postDataJSON()
        requestIds.push(payload.request_id)
        if (posts === 1) return route.abort()
        const saved = makeReport({ request_id: payload.request_id, student_id: payload.student_id, report_date: payload.report_date, reason: payload.reason })
        reports.unshift(saved)
        return json(saved, 201)
      }
      const start = Number(url.searchParams.get('offset') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? 26)
      return json(reports.slice(start, start + limit))
    }

    throw new Error(`Permintaan Supabase tidak dikenal: ${request.method()} ${url.pathname}`)
  })

  return { reports, requestIds }
}

async function setupTeacher(page: Page, report: Report, firstReviewError = '40001') {
  const revisions: number[] = []
  let reviews = 0

  await installSession(page)
  await page.route('https://school-abc.supabase.co/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const json = (data: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })

    if (url.pathname.endsWith('/user')) return json({ user })
    if (url.pathname.endsWith('/profiles')) return json([{ role: 'teacher' }])
    if (url.pathname.endsWith('/rpc/habit_students')) return json([{ id: student.id, name: 'Data Contoh Siswa A' }])

    if (url.pathname.endsWith('/rpc/review_guardian_absence_report')) {
      reviews += 1
      const payload = request.postDataJSON()
      revisions.push(payload.expected_revision)
      if (reviews === 1) return json({ code: firstReviewError, message: 'Review rejected', details: null, hint: null }, 400)
      report.status = 'confirmed'
      report.teacher_note = payload.note
      report.revision = payload.expected_revision + 1
      return json(report)
    }

    if (url.pathname.endsWith('/guardian_absence_reports')) {
      const start = Number(url.searchParams.get('offset') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? 26)
      return json([report].slice(start, start + limit))
    }

    throw new Error(`Permintaan Supabase tidak dikenal: ${request.method()} ${url.pathname}`)
  })

  return { revisions, reviewCount: () => reviews }
}

test('guardian retries the same absence report ID after a lost response', async ({ page }) => {
  const state = await setupParent(page)

  await page.goto('/laporan-ketidakhadiran')
  await expect(page.getByRole('heading', { name: 'Laporan ketidakhadiran' })).toBeVisible()
  await page.getByLabel('Alasan').fill('Data Contoh sakit demam')
  await page.getByRole('button', { name: 'Kirim laporan' }).click()

  await expect(page.getByText(/belum terkonfirmasi/)).toBeVisible()
  await expect(page.getByLabel('Alasan')).toHaveValue('Data Contoh sakit demam')

  await page.getByRole('button', { name: 'Kirim ulang laporan' }).click()
  await expect(page.getByText(/terkirim dan menunggu pemeriksaan guru/)).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: 'Data Contoh sakit demam' })).toBeVisible()
  await expect(page.getByText('Menunggu pemeriksaan guru', { exact: true })).toBeVisible()

  expect(state.requestIds).toHaveLength(2)
  expect(state.requestIds[0]).toBe(state.requestIds[1])
  expect(state.reports).toHaveLength(1)
})

test('teacher reloads after a revision conflict and then confirms the report', async ({ page }) => {
  const report = makeReport()
  const state = await setupTeacher(page, report)

  await page.goto('/laporan-ketidakhadiran')
  await expect(page.getByRole('heading', { name: 'Laporan ketidakhadiran' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Data Contoh Siswa A' })).toBeVisible()

  const note = page.getByLabel('Catatan pemeriksa untuk Data Contoh Siswa A')
  await note.fill('Data Contoh sudah dikonfirmasi ke wali')
  await page.getByRole('button', { name: 'Konfirmasi laporan' }).click()

  await expect(page.getByText(/sudah berubah sejak dimuat/)).toBeVisible()
  await expect(note).toHaveValue('Data Contoh sudah dikonfirmasi ke wali')

  await page.getByRole('button', { name: 'Muat ulang daftar' }).click()
  await expect(page.getByText('Menunggu pemeriksaan guru', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Konfirmasi laporan' }).click()

  await expect(page.getByText('Laporan dikonfirmasi.')).toBeVisible()
  await expect(page.getByText('Dikonfirmasi', { exact: true })).toBeVisible()
  expect(state.reviewCount()).toBe(2)
  expect(state.revisions[0]).toBe(0)
  expect(state.revisions[1]).toBe(0)
})

test('teacher sees an actionable error when no single attendance session matches', async ({ page }) => {
  const report = makeReport()
  const state = await setupTeacher(page, report, '55000')

  await page.goto('/laporan-ketidakhadiran')
  await expect(page.getByRole('heading', { name: 'Data Contoh Siswa A' })).toBeVisible()

  const note = page.getByLabel('Catatan pemeriksa untuk Data Contoh Siswa A')
  await note.fill('Data Contoh perlu dicocokkan dengan sesi absensi')
  await page.getByRole('button', { name: 'Konfirmasi laporan' }).click()

  await expect(page.getByText(/Tidak ada satu sesi absensi yang cocok/)).toBeVisible()
  await expect(page.getByText('Laporan dikonfirmasi.', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Menunggu pemeriksaan guru', { exact: true })).toBeVisible()
  await expect(note).toHaveValue('Data Contoh perlu dicocokkan dengan sesi absensi')

  await page.getByRole('button', { name: 'Kembali ke daftar laporan' }).click()
  await expect(page.getByText('Menunggu pemeriksaan guru', { exact: true })).toBeVisible()
  expect(state.reviewCount()).toBe(1)
})
