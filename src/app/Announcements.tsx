import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/auth/auth-context'
import { announcementStatuses, canManageAnnouncements, canReadAnnouncements, validateAnnouncement, type Announcement, type AnnouncementStatus } from '../lib/announcements'

const pageSize = 10
const columns = 'id, title, body, status, created_at'

export function Announcements() {
  const { session } = useAuth()
  return session ? <AnnouncementBoard key={session.user.id} userId={session.user.id}/> : null
}

function AnnouncementBoard({ userId }: { userId: string }) {
  const [role, setRole] = useState<string | null>(null)
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [editor, setEditor] = useState<{ id: string | null; title: string; body: string; status: AnnouncementStatus } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const canManage = canManageAnnouncements(role)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setRole(null)
    setItems([])

    const client = supabase
    if (!client) {
      if (active) {
        setError('Konfigurasi Supabase belum tersedia. Periksa pengaturan sekolah.')
        setLoading(false)
      }
      return () => { active = false }
    }

    const load = async () => {
      try {
        if (!userId) throw new Error('session')
        const { data: profile, error: profileError } = await client.from('profiles').select('role').eq('id', userId).maybeSingle()
        if (profileError) throw profileError
        if (!active) return
        setRole(profile?.role ?? null)
        if (!canReadAnnouncements(profile?.role ?? null)) return
        const { data, error: failure } = await client.from('announcements').select(columns)
          .order('created_at', { ascending: false }).order('id', { ascending: false })
          .range(page * pageSize, page * pageSize + pageSize)
        if (failure) throw failure
        if (active) { setItems(data.slice(0, pageSize)); setHasNext(data.length > pageSize) }
      } catch {
        if (active) setError('Pengumuman belum dapat dimuat. Coba lagi atau hubungi administrator sekolah.')
      } finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [userId, page, attempt])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editor || !canManage || saving) return
    const validation = validateAnnouncement(editor.title, editor.body)
    setSaveError(validation)
    if (validation) return
    setSaving(true)
    setMessage('')
    const payload = { title: editor.title.trim(), body: editor.body.trim(), status: editor.status }

    if (!supabase) {
      setSaveError('Konfigurasi Supabase belum tersedia. Periksa pengaturan sekolah.')
      setSaving(false)
      return
    }

    try {
      const query = editor.id
        ? supabase.from('announcements').update(payload).eq('id', editor.id)
        : supabase.from('announcements').insert({ ...payload, created_by: userId })
      const { error: failure } = await query.select('id').single()
      if (failure) throw failure
      setEditor(null)
      setPage(0)
      setAttempt(value => value + 1)
      setMessage('Pengumuman berhasil disimpan.')
    } catch { setSaveError('Pengumuman belum berhasil disimpan. Periksa koneksi dan izin akun, lalu coba lagi.') }
    finally { setSaving(false) }
  }

  return <section className="board">
    <div className="board-heading"><div><div className="eyebrow">KABAR SEKOLAH</div><h1>Pengumuman</h1><p>Informasi dan kegiatan SDN 03 Wonosari.</p></div><Link to="/akun">Akun saya</Link></div>
    {message && <p className="status" role="status">{message}</p>}
    {loading ? <p role="status">Memuat pengumuman…</p> : error ? <div><p className="error" role="alert">{error}</p><button className="button" onClick={() => setAttempt(value => value + 1)}>Coba lagi</button></div>
      : !canReadAnnouncements(role) ? <div className="status">Peran sekolah Anda belum ditetapkan. Hubungi administrator untuk mendapatkan akses pengumuman.</div> : <>
        {canManage && !editor && <button className="button" onClick={() => { setSaveError(''); setEditor({ id: null, title: '', body: '', status: 'draft' }) }}>Tulis pengumuman</button>}
        {canManage && editor && <form className="announcement-editor" onSubmit={save}>
          <h2>{editor.id ? 'Ubah pengumuman' : 'Pengumuman baru'}</h2>
          <label htmlFor="announcement-title">Judul</label><input id="announcement-title" required maxLength={160} disabled={saving} value={editor.title} onChange={event => setEditor({ ...editor, title: event.target.value })}/>
          <label htmlFor="announcement-body">Isi pengumuman</label><textarea id="announcement-body" required maxLength={10000} rows={7} disabled={saving} value={editor.body} onChange={event => setEditor({ ...editor, body: event.target.value })}/>
          <label htmlFor="announcement-status">Status</label><select id="announcement-status" disabled={saving} value={editor.status} onChange={event => setEditor({ ...editor, status: event.target.value as AnnouncementStatus })}>{Object.entries(announcementStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <p className="help">Pilih Terbit agar pengumuman dapat dibaca warga sekolah. Draf dan arsip hanya terlihat oleh pengelola.</p>
          {saveError && <p className="error" role="alert">{saveError}</p>}
          <div className="actions"><button className="button" disabled={saving} type="submit">{saving ? 'Menyimpan…' : 'Simpan pengumuman'}</button><button className="button secondary" disabled={saving} type="button" onClick={() => setEditor(null)}>Batal</button></div>
        </form>}
        <div className="announcement-list">{items.length === 0 ? <p className="empty">{page > 0 ? 'Tidak ada pengumuman pada halaman ini.' : 'Belum ada pengumuman yang dapat ditampilkan.'}</p> : items.map(item => <article className="announcement" key={item.id}>
          <div className="announcement-meta"><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' })}</time>{canManage && <span className={`badge ${item.status}`}>{announcementStatuses[item.status]}</span>}</div>
          <h2>{item.title}</h2><p className="announcement-body">{item.body}</p>
          {canManage && <button className="text-button" disabled={saving || Boolean(editor)} onClick={() => { setSaveError(''); setEditor({ id: item.id, title: item.title, body: item.body, status: item.status }) }}>Ubah pengumuman</button>}
        </article>)}</div>
        <nav className="pagination" aria-label="Halaman pengumuman"><button disabled={page === 0 || saving || Boolean(editor)} onClick={() => setPage(value => value - 1)}>Sebelumnya</button><span>Halaman {page + 1}</span><button disabled={!hasNext || saving || Boolean(editor)} onClick={() => setPage(value => value + 1)}>Berikutnya</button></nav>
      </>}
  </section>
}
