import { useEffect, useState, type FormEvent } from 'react'
import { EmptyState, ErrorNotice, LoadingState } from '../../components/ui/Feedback'
import { supabase } from '../../lib/supabase'

const bucket = 'supervision-evidence'
const mimeTypes = ['application/pdf', 'image/jpeg', 'image/png']
const pageSize = 20

function displayName(name: string) {
  return name.slice(37)
}

export function SupervisionEvidence({ sessionId, editable, onBusyChange }: {
  sessionId: string
  editable: boolean
  onBusyChange: (busy: boolean) => void
}) {
  const [files, setFiles] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteName, setDeleteName] = useState<string | null>(null)

  useEffect(() => {
    const client = supabase
    if (!client) return
    let active = true
    setLoading(true)
    setListError(false)
    const load = async () => {
      try {
        const { data, error: failure } = await client.storage.from(bucket).list(sessionId, {
          limit: pageSize + 1, offset: page * pageSize, sortBy: { column: 'name', order: 'asc' },
        })
        if (failure) throw failure
        if (active) setFiles(data.map(item => item.name))
      } catch {
        if (active) setListError(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [sessionId, page, attempt])

  function start() {
    setBusy(true)
    onBusyChange(true)
    setError('')
    setMessage('')
  }

  function finish() {
    setBusy(false)
    onBusyChange(false)
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !editable || busy) return
    const form = event.currentTarget
    const file = new FormData(form).get('evidence')
    if (!(file instanceof File) || !mimeTypes.includes(file.type) || file.size === 0 || file.size > 10 * 1024 * 1024) {
      setError('Pilih PDF, JPEG, atau PNG dengan ukuran paling banyak 10 MB.')
      return
    }
    const name = file.name.replace(/[^A-Za-z0-9_.-]/g, '_').slice(-100)
    start()
    try {
      const { error: failure } = await supabase.storage.from(bucket)
        .upload(`${sessionId}/${crypto.randomUUID()}-${name}`, file, { contentType: file.type, upsert: false })
      if (failure) throw failure
      form.reset()
      setMessage('Bukti berhasil diunggah.')
      setPage(0)
      setAttempt(value => value + 1)
    } catch {
      setError('Unggahan belum dikonfirmasi. Muat ulang daftar sebelum mencoba lagi.')
      setAttempt(value => value + 1)
    } finally {
      finish()
    }
  }

  async function download(name: string) {
    if (!supabase || busy) return
    start()
    try {
      const { data, error: failure } = await supabase.storage.from(bucket).download(`${sessionId}/${name}`)
      if (failure) throw failure
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = displayName(name)
      document.body.append(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setError('Bukti gagal diunduh atau akses sudah berubah.')
    } finally {
      finish()
    }
  }

  async function remove() {
    if (!supabase || !editable || !deleteName || busy) return
    start()
    try {
      const { data, error: failure } = await supabase.storage.from(bucket).remove([`${sessionId}/${deleteName}`])
      if (failure || !data.length) throw new Error('Deletion not confirmed')
      setDeleteName(null)
      setMessage('Bukti dihapus.')
      setPage(0)
      setAttempt(value => value + 1)
    } catch {
      setError('Penghapusan belum dikonfirmasi. Periksa apakah sesi sudah dipublikasikan.')
    } finally {
      finish()
    }
  }

  return <section className="announcement-editor">
    <h3>Bukti tindak lanjut</h3>
    {editable && <form onSubmit={upload}>
      <label htmlFor="supervision-evidence-file">Berkas bukti (PDF, JPEG, PNG, maksimal 10 MB)</label>
      <input id="supervision-evidence-file" type="file" name="evidence" accept={mimeTypes.join(',')} disabled={busy} required />
      <button type="submit" className="button secondary" disabled={busy}>Unggah bukti</button>
    </form>}
    {message && <p role="status">{message}</p>}
    {error && <ErrorNotice>{error}</ErrorNotice>}
    {loading ? <LoadingState /> : listError ? <ErrorNotice onRetry={() => setAttempt(value => value + 1)}>Daftar bukti gagal dimuat.</ErrorNotice>
      : files.length === 0 ? <EmptyState>Belum ada berkas bukti.</EmptyState>
      : <ul>{files.slice(0, pageSize).map(name => <li key={name}>
        <button type="button" className="text-button" disabled={busy} onClick={() => void download(name)}>Unduh {displayName(name)}</button>
        {editable && <button type="button" className="text-button" disabled={busy} onClick={() => setDeleteName(name)}>Hapus {displayName(name)}</button>}
      </li>)}</ul>}
    {page > 0 && <button type="button" className="button secondary" disabled={busy} onClick={() => setPage(page - 1)}>Sebelumnya</button>}
    {files.length > pageSize && <button type="button" className="button secondary" disabled={busy || loading} onClick={() => setPage(page + 1)}>Berikutnya</button>}
    {editable && deleteName && <div className="confirm-panel" role="alertdialog" aria-labelledby="delete-supervision-evidence">
      <h4 id="delete-supervision-evidence">Hapus {displayName(deleteName)}?</h4>
      <button type="button" className="button" disabled={busy} onClick={() => void remove()}>Ya, hapus</button>
      <button type="button" className="button secondary" disabled={busy} onClick={() => setDeleteName(null)}>Batal</button>
    </div>}
  </section>
}
