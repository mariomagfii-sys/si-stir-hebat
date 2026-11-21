import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../components/auth/auth-context'
import { EmptyState, ErrorNotice, LoadingState } from '../../components/ui/Feedback'
import { TruncationNotice } from '../../components/ui/TruncationNotice'
import { supabase } from '../../lib/supabase'
import { cariPesan, daftarPesan, daftarPenerima, kirimPesan, type PesanBaru, type PesanKomunikasi, type PenerimaKomunikasi } from './api'
import { isParent, isTeacher } from '../../utils/permissions'

type ReadyState = {
  state: 'ready'
  role: 'teacher' | 'parent'
  recipients: PenerimaKomunikasi[]
  messages: PesanKomunikasi[]
  hasMoreMessages: boolean
}

type PageState = { state: 'loading' } | { state: 'denied' } | { state: 'error'; message: string } | ReadyState

function sameMessage(message: PesanKomunikasi, request: PesanBaru, authorId: string) {
  return message.id === request.id
    && message.assignment_id === request.assignment_id
    && message.student_id === request.student_id
    && message.parent_profile_id === request.parent_profile_id
    && message.body === request.body.trim()
    && message.author_id === authorId
}

function recipientKey(recipient: PenerimaKomunikasi) {
  return `${recipient.assignment_id}:${recipient.student_id}:${recipient.parent_profile_id}`
}

export function Communication() {
  const { session } = useAuth()
  const [pageState, setPageState] = useState<PageState>({ state: 'loading' })
  const [selected, setSelected] = useState('')
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingRequest, setPendingRequest] = useState<PesanBaru | null>(null)
  const [messagePage, setMessagePage] = useState(0)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const client = supabase
    if (!client || !session) {
      setPageState({ state: 'denied' })
      return
    }

    let active = true
    const load = async () => {
      try {
        const profile = await client.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
        if (profile.error) throw profile.error
        const profileRole = profile.data?.role
        const role: 'teacher' | 'parent' | null = isTeacher(profileRole) ? 'teacher' : isParent(profileRole) ? 'parent' : null
        if (!role) {
          if (active) setPageState({ state: 'denied' })
          return
        }

        const [recipientResult, messageResult] = await Promise.all([
          daftarPenerima(client),
          daftarPesan(client, messagePage),
        ])

        if (!active) return

        const recipients = recipientResult.items
        setPageState({
          state: 'ready',
          role,
          recipients,
          messages: messageResult.items,
          hasMoreMessages: messageResult.hasMore,
        })
        if (isTeacher(role) && recipients.length) {
          setSelected((previous) => previous || recipientKey(recipients[0]))
        }
      } catch {
        if (active) setPageState({ state: 'error', message: 'Komunikasi belum dapat dimuat. Silakan coba lagi.' })
      }
    }

    void load()
    return () => { active = false }
  }, [attempt, messagePage, session])

  function refresh() {
    setPageState({ state: 'loading' })
    setError('')
    setSuccess('')
    setAttempt(value => value + 1)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const client = supabase
    if (!client || !session || pageState.state !== 'ready') return
    if (saving || (!pendingRequest && !draft.trim())) return

    let request = pendingRequest
    if (!request) {
      const target = pageState.recipients.find((recipient) => recipientKey(recipient) === selected)
      if (!target) {
        setError('Pilih penerima terlebih dahulu sebelum mengirim pesan.')
        return
      }
      request = {
        id: crypto.randomUUID(),
        assignment_id: target.assignment_id,
        student_id: target.student_id,
        parent_profile_id: target.parent_profile_id,
        body: draft,
      }
    }

    setSaving(true)
    setError('')
    setSuccess('')
    setPendingRequest(request)
    try {
      const existing = await cariPesan(client, request.id)
      if (existing && !sameMessage(existing, request, session.user.id)) {
        setError('ID permintaan sudah digunakan untuk pesan lain. Hubungi administrator sebelum mencoba lagi.')
        return
      }
      const saved = existing ?? await kirimPesan(client, request)
      if (!sameMessage(saved, request, session.user.id)) throw new Error('Isi pesan yang tersimpan tidak cocok.')

      setPendingRequest(null)
      setDraft('')
      setSuccess('Pesan berhasil dikirim.')
      setMessagePage(0)
      setAttempt(value => value + 1)
    } catch {
      let lookupFailed = false
      try {
        const saved = await cariPesan(client, request.id)
        if (saved && sameMessage(saved, request, session.user.id)) {
          setPendingRequest(null)
          setDraft('')
          setSuccess('Pesan berhasil dikirim.')
          setMessagePage(0)
          setAttempt(value => value + 1)
          return
        }
      } catch {
        lookupFailed = true
      }
      setError(lookupFailed
        ? 'Status pesan belum dapat diperiksa. Isi pesan dan ID permintaan dipertahankan; coba lagi dengan tombol yang sama.'
        : 'Pesan belum terkonfirmasi. Isi pesan dan ID permintaan dipertahankan; coba lagi dengan tombol yang sama.')
    } finally {
      setSaving(false)
    }
  }

  if (pageState.state === 'loading') return <section className="workspace"><h1>Komunikasi</h1><LoadingState /></section>
  if (pageState.state === 'denied') return <section className="workspace"><h1>Komunikasi</h1><EmptyState>Fitur komunikasi hanya tersedia untuk guru dengan penugasan aktif dan wali terverifikasi.</EmptyState></section>
  if (pageState.state === 'error') return <section className="workspace"><h1>Komunikasi</h1><ErrorNotice onRetry={refresh}>{pageState.message}</ErrorNotice></section>

  const { role, recipients, messages, hasMoreMessages } = pageState
  const teacher = isTeacher(role)
  const recipientIndex = new Map(recipients.map((recipient) => [recipientKey(recipient), recipient]))

  const visibleMessages = teacher
    ? messages.filter((message) => message.author_id === session?.user.id)
    : messages.filter((message) => message.parent_profile_id === session?.user.id)

  return <section className="workspace">
    <h1>Komunikasi guru dan wali</h1>
    <p className="help">Pesan bersifat teks dan hanya untuk relasi yang masih aktif. Isi tidak dapat dihapus atau diubah oleh klien.</p>
    {teacher && <>
      {recipients.length === 0 && <EmptyState>Belum ada wali terverifikasi yang aktif untuk Anda. Hubungi administrator sekolah jika perlu menghubungi wali.</EmptyState>}
      {recipients.length > 0 && <form onSubmit={submit} className="announcement-editor">
        <label htmlFor="recipient-select">Pilih wali dan murid</label>
        <select id="recipient-select" value={selected} onChange={(event) => setSelected(event.target.value)} disabled={saving || Boolean(pendingRequest)}>
          {recipients.map((recipient) => <option key={recipientKey(recipient)} value={recipientKey(recipient)}>
            {recipient.student_name} · {recipient.parent_name}
          </option>)}
        </select>
        <label htmlFor="communication-body">Pesan</label>
        <textarea id="communication-body" rows={5} maxLength={4000} value={draft} onChange={(event) => setDraft(event.target.value)} disabled={saving || Boolean(pendingRequest)} />
        <div className="button-row">
          <button className="button" type="submit" disabled={saving || (!pendingRequest && draft.trim().length === 0)}> {saving ? 'Memeriksa status…' : pendingRequest ? 'Periksa/kirim ulang' : 'Kirim pesan'} </button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {success && <p className="status" role="status">{success}</p>}
      </form>}
    </>}

    <section className="announcement-editor">
      <h2>{teacher ? 'Riwayat pesan Anda' : 'Pesan yang diterima'}</h2>
      {visibleMessages.length === 0 && <EmptyState>{teacher ? 'Belum ada pesan yang dikirim.' : 'Belum ada pesan yang diterima.'}</EmptyState>}
      {visibleMessages.length > 0 && <div className="table-scroll" role="region" aria-label="Tabel riwayat komunikasi yang dapat digeser" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th scope="col">{teacher ? 'Wali' : 'Guru'}</th>
              <th scope="col">{teacher ? 'Murid' : 'Murid'}</th>
              <th scope="col">Pesan</th>
              <th scope="col">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {visibleMessages.map((message) => {
              const meta = recipientIndex.get(`${message.assignment_id}:${message.student_id}:${message.parent_profile_id}`)
              return <tr key={message.id}>
                <td>{teacher ? meta?.parent_name ?? 'Wali terhubung' : meta?.teacher_name ?? 'Guru terhubung'}</td>
                <td>{meta?.student_name ?? 'Murid terhubung'}</td>
                <td>{message.body}</td>
                <td><time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</time></td>
              </tr>
            })}
          </tbody>
        </table>
      </div>}
      <TruncationNotice hasMore={hasMoreMessages}/>
      {(messagePage > 0 || hasMoreMessages) && <div className="button-row">
        <button type="button" className="button secondary" disabled={messagePage === 0} onClick={() => { setPageState({ state: 'loading' }); setMessagePage(value => value - 1) }}>Sebelumnya</button>
        <span aria-live="polite">Halaman {messagePage + 1}</span>
        <button type="button" className="button secondary" disabled={!hasMoreMessages} onClick={() => { setPageState({ state: 'loading' }); setMessagePage(value => value + 1) }}>Berikutnya</button>
      </div>}
    </section>
  </section>
}
