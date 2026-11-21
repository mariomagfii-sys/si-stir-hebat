import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Bell, KeyRound, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/auth/auth-context'
import { Profile } from './Profile'

export function Login() {
  const { session, loading, error: sessionError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const client = supabase
    if (!client) {
      setError('Konfigurasi Supabase belum tersedia. Periksa pengaturan sekolah.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const { error: failure } = await client.auth.signInWithPassword({ email: email.trim(), password })
      if (failure) setError('Tidak dapat masuk. Periksa email dan kata sandi, lalu coba lagi.')
    } catch { setError('Koneksi bermasalah. Silakan coba lagi.') }
    finally { setBusy(false) }
  }
  if (loading) return <section className="login" role="status">Memuat sesi…</section>
  if (session) return <Navigate to="/dashboard" replace />
  return <section className="login"><h1>Masuk SI STIR HEBAT</h1><p>Gunakan akun yang diberikan oleh administrator sekolah.</p>
    <form onSubmit={submit}>
      <label htmlFor="email">Email</label><input id="email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} disabled={busy} />
      <label htmlFor="password">Kata sandi</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} />
      {(error || sessionError) && <p className="error" role="alert">{error || sessionError}</p>}
      <button className="button" type="submit" disabled={busy}>{busy ? 'Sedang masuk…' : 'Masuk'}</button>
    </form><p><Link to="/lupa-kata-sandi">Lupa kata sandi?</Link></p><p className="help">Belum memiliki akun? Hubungi administrator sekolah.</p><Link to="/">Kembali ke beranda</Link>
  </section>
}

export function Account() {
  const { session } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function signOut() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const client = supabase
      if (!client) {
        setError('Konfigurasi Supabase belum tersedia.')
        return
      }
      const { error: failure } = await client.auth.signOut({ scope: 'local' })
      if (failure) setError('Belum berhasil keluar. Silakan coba lagi.')
    } catch { setError('Koneksi bermasalah. Silakan coba lagi.') }
    finally { setBusy(false) }
  }
  return (
    <section className="board account-page" aria-labelledby="account-title">
      <header className="account-heading">
        <div>
          <p className="account-kicker">Pengaturan akun</p>
          <h1 id="account-title">Akun sekolah</h1>
          <p>Kelola identitas dan keamanan akun yang digunakan di SI STIR HEBAT.</p>
        </div>
        <span className="account-avatar" aria-hidden="true"><UserRound /></span>
      </header>

      <div className="account-grid">
        <article className="account-card account-profile">
          <div className="account-card-heading">
            <span className="account-card-icon" aria-hidden="true"><UserRound /></span>
            <div>
              <h2>Profil saya</h2>
              <p>Identitas yang ditampilkan pada layanan sekolah.</p>
            </div>
          </div>
          {session && <dl className="account-meta">
            <div>
              <dt>Email akun</dt>
              <dd>{session.user.email}</dd>
            </div>
            {supabase && <div>
              <dt>ID akun</dt>
              <dd><code>{session.user.id}</code></dd>
            </div>}
          </dl>}
          {session && <Profile key={session.user.id} userId={session.user.id} />}
        </article>

        <aside className="account-card account-actions" aria-label="Tindakan akun">
          <div className="account-card-heading">
            <span className="account-card-icon" aria-hidden="true"><ShieldCheck /></span>
            <div>
              <h2>Keamanan dan akses</h2>
              <p>Lanjutan pengaturan akun.</p>
            </div>
          </div>
          <nav className="account-links" aria-label="Layanan akun">
            <Link to="/kata-sandi">
              <KeyRound aria-hidden="true" />
              <span><strong>Ubah kata sandi</strong><small>Perbarui kredensial akun</small></span>
            </Link>
            <Link to="/pengumuman">
              <Bell aria-hidden="true" />
              <span><strong>Pengumuman sekolah</strong><small>Buka kabar terbaru</small></span>
            </Link>
          </nav>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="button account-sign-out" disabled={busy} onClick={signOut}>
            <LogOut aria-hidden="true" />
            {busy ? 'Sedang keluar…' : 'Keluar'}
          </button>
        </aside>
      </div>
    </section>
  )
}
