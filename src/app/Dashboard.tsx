import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bell, FileText, UserRound, KeyRound } from 'lucide-react'
import { useAuth } from './Auth'
import { getDemoAnnouncements, getDemoProfile } from '../lib/demo-auth'
import { supabase } from '../lib/supabase'
import { canManageAnnouncements, canReadAnnouncements, type Announcement } from '../lib/announcements'
import { schoolRoleLabels } from '../lib/school'

type SchoolProfile = { full_name: string; role: string }

export function Dashboard() {
  const { session } = useAuth()
  return session ? <SchoolDashboard key={session.user.id} userId={session.user.id}/> : null
}

function SchoolDashboard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<SchoolProfile | null>(null)
  const [recent, setRecent] = useState<Announcement[]>([])
  const [publishedCount, setPublishedCount] = useState<number | null>(null)
  const [draftCount, setDraftCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [newsError, setNewsError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setProfileError('')
    setNewsError('')
    setProfile(null)
    setRecent([])
    setPublishedCount(null)
    setDraftCount(null)

    const client = supabase
    if (!client) {
      const demoProfile = getDemoProfile(userId)
      const demoAnnouncements = getDemoAnnouncements()
      if (active) {
        setProfile(demoProfile ? { full_name: demoProfile.full_name, role: demoProfile.role } : { full_name: 'Pengguna Demo', role: 'pending' })
        setRecent(demoAnnouncements.filter((item) => item.status === 'published').slice(0, 3) as Announcement[])
        setPublishedCount(demoAnnouncements.filter((item) => item.status === 'published').length)
        setDraftCount(demoAnnouncements.filter((item) => item.status === 'draft').length)
        setLoading(false)
      }
      return () => { active = false }
    }

    const load = async () => {
      try {
        const { data, error } = await client.from('profiles').select('full_name, role').eq('id', userId).maybeSingle()
        if (error) throw error
        if (!active) return
        setProfile(data)
        if (!data) { setProfileError('Profil sekolah belum tersedia. Hubungi administrator sekolah.'); return }
        if (!canReadAnnouncements(data.role)) return

        const requests = [
          client.from('announcements').select('id, title, body, status, created_at')
            .eq('status', 'published').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(3),
          client.from('announcements').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        ]
        if (canManageAnnouncements(data.role)) requests.push(client.from('announcements').select('id', { count: 'exact', head: true }).eq('status', 'draft'))
        const results = await Promise.allSettled(requests)
        if (!active) return
        let failed = false
        results.forEach((result, index) => {
          if (result.status === 'rejected' || result.value.error) { failed = true; return }
          if (index === 0) setRecent(result.value.data as Announcement[] ?? [])
          else if (index === 1) setPublishedCount(result.value.count ?? null)
          else setDraftCount(result.value.count ?? null)
        })
        if (failed) setNewsError('Sebagian informasi pengumuman belum dapat dimuat. Silakan coba lagi.')
      } catch { if (active) setProfileError('Profil belum dapat dimuat. Periksa koneksi atau hubungi administrator sekolah.') }
      finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [userId, attempt])

  const canRead = canReadAnnouncements(profile?.role ?? null)
  const canManage = canManageAnnouncements(profile?.role ?? null)
  return <section className="board dashboard">
    <div className="board-heading"><div><div className="eyebrow">RUANG SEKOLAH SAYA</div><h1>{profile?.full_name ? `Halo, ${profile.full_name}` : 'Selamat datang'}</h1><p>Temukan kabar sekolah dan kelola akun Anda di satu tempat.</p></div><button className="refresh-button" disabled={loading} onClick={() => setAttempt(value => value + 1)}>{loading ? 'Memuat…' : 'Muat ulang'}</button></div>
    {loading ? <p role="status">Menyiapkan dashboard…</p> : <>
      {profileError && <p className="error" role="alert">{profileError}</p>}
      {profile && <div className="role-strip"><span>Peran Anda</span><strong>{schoolRoleLabels[profile.role] ?? 'Belum tersedia'}</strong></div>}
      {profile && !canRead && <p className="status">Akun Anda menunggu penetapan peran sekolah. Anda tetap dapat melengkapi nama dan mengubah kata sandi melalui menu akun.</p>}
      {profile && !profile.full_name.trim() && <p className="status">Lengkapi nama agar akun Anda mudah dikenali. <Link to="/akun">Lengkapi profil</Link></p>}
      {canRead && <>
        <div className="dashboard-stats"><article><Bell size={22}/><span>Pengumuman terbit</span><strong>{publishedCount ?? '—'}</strong></article>{canManage && <article><FileText size={22}/><span>Draf pengumuman</span><strong>{draftCount ?? '—'}</strong></article>}</div>
        {newsError && <p className="error" role="alert">{newsError}</p>}
        <section className="dashboard-news" aria-labelledby="latest-news"><div className="board-heading"><h2 id="latest-news">Kabar terbaru</h2><Link to="/pengumuman">Lihat semua <ArrowRight size={14}/></Link></div>
          {recent.length ? recent.map(item => <article className="news-preview" key={item.id}><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' })}</time><h3>{item.title}</h3><p>{item.body.length > 220 ? `${item.body.slice(0, 220)}…` : item.body}</p></article>) : !newsError && <p className="empty">Belum ada pengumuman terbit. Kabar sekolah akan tampil di sini.</p>}
        </section>
      </>}
    </>}
    <section className="quick-access" aria-labelledby="quick-access"><h2 id="quick-access">Akses cepat</h2><div className="quick-access-grid">
      <Link to="/akun"><UserRound size={24}/><strong>Profil saya</strong><span>Lengkapi nama dan periksa peran akun.</span><ArrowRight size={18}/></Link>
      <Link to="/kata-sandi"><KeyRound size={24}/><strong>Keamanan akun</strong><span>Perbarui kata sandi akun sekolah.</span><ArrowRight size={18}/></Link>
      {!loading && supabase && canRead && <>
        <Link to="/jadwal"><FileText size={24}/><strong>Jadwal pelajaran</strong><span>Lihat jadwal sesuai kelas dan tanggal.</span><ArrowRight size={18}/></Link>
        <Link to="/materi"><FileText size={24}/><strong>Materi kelas</strong><span>Buka bahan pembelajaran yang tersedia.</span><ArrowRight size={18}/></Link>
        <Link to="/tugas"><FileText size={24}/><strong>Tugas kelas</strong><span>Kelola tugas, pengumpulan dan umpan balik.</span><ArrowRight size={18}/></Link>
        <Link to="/asesmen"><FileText size={24}/><strong>Asesmen dan nilai</strong><span>Lihat hasil terbit atau kelola asesmen sesuai peran.</span><ArrowRight size={18}/></Link>
        {profile?.role !== 'parent' && <Link to="/absensi"><FileText size={24}/><strong>Absensi kelas</strong><span>Catatan kehadiran dan rekap yang dapat Anda akses.</span><ArrowRight size={18}/></Link>}
        {profile?.role === 'parent' && <Link to="/ruang-orang-tua"><UserRound size={24}/><strong>Kehadiran anak</strong><span>Pantau anak yang telah ditautkan oleh sekolah.</span><ArrowRight size={18}/></Link>}
        {['administrator', 'principal', 'teacher'].includes(profile?.role ?? '') && <Link to="/modul-ajar"><FileText size={24}/><strong>Modul ajar</strong><span>Dokumen perencanaan dan proses peninjauan.</span><ArrowRight size={18}/></Link>}
        {['principal', 'teacher'].includes(profile?.role ?? '') && <Link to="/supervisi"><FileText size={24}/><strong>Supervisi akademik</strong><span>Jadwal, observasi, tindak lanjut dan laporan.</span><ArrowRight size={18}/></Link>}
        {profile?.role === 'administrator' && <>
          <Link to="/sekolah"><FileText size={24}/><strong>Siapkan data sekolah</strong><span>Mulai dari tahun ajaran, kelas, guru, siswa dan penugasan.</span><ArrowRight size={18}/></Link>
          <Link to="/tautan-akun"><UserRound size={24}/><strong>Tautan akun</strong><span>Verifikasi hubungan akun guru, siswa dan wali.</span><ArrowRight size={18}/></Link>
        </>}
      </>}
      {!loading && ['teacher','administrator','principal'].includes(profile?.role??'') && <Link to="/jurnal"><FileText size={24}/><strong>Jurnal mengajar</strong><span>Catatan kegiatan pembelajaran sesuai penugasan.</span><ArrowRight size={18}/></Link>}
      {!loading && canRead && <Link to="/pengumuman"><Bell size={24}/><strong>{canManage ? 'Kelola pengumuman' : 'Pengumuman sekolah'}</strong><span>{canManage ? 'Tulis kabar baru, terbitkan, atau arsipkan.' : 'Baca informasi dan kegiatan sekolah.'}</span><ArrowRight size={18}/></Link>}
    </div></section>
  </section>
}
