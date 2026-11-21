import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { BookOpen, GraduationCap, Users, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { demoAllowed, isConfigured } from '../lib/config.ts'
import { AuthProvider, ProtectedRoute } from './Auth'
import { ConfigMissing } from './ConfigMissing'
import { Dashboard } from './Dashboard'
import { Header } from './Header'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { Account, Login } from './Account'
import { ChangePassword, ForgotPassword } from './Password'
const Announcements = lazy(() => import('./Announcements').then(module => ({ default: module.Announcements })))
const MasterData = lazy(() => import('../features/school/MasterData').then(module => ({ default: module.MasterData })))
const AccountRelationships = lazy(() => import('../features/school/AccountRelationships').then(module => ({ default: module.AccountRelationships })))
const GuardianPortal = lazy(() => import('../features/guardian/GuardianPortal').then(module => ({ default: module.GuardianPortal })))
const TeachingModules = lazy(() => import('../features/learning/TeachingModules').then(module => ({ default: module.TeachingModules })))
const ClassMaterials = lazy(() => import('../features/learning/ClassMaterials').then(module => ({ default: module.ClassMaterials })))
const Assessments = lazy(() => import('../features/academic/Assessments').then(module => ({ default: module.Assessments })))
const Schedules = lazy(() => import('../features/schedule/Schedules').then(module => ({ default: module.Schedules })))
const AcademicSupervision = lazy(() => import('../features/supervision/AcademicSupervision').then(module => ({ default: module.AcademicSupervision })))
const Attendance = lazy(() => import('../features/attendance/Attendance').then(module => ({ default: module.Attendance })))
const Journals = lazy(() => import('../features/journals/Journals').then(module => ({ default: module.Journals })))
const Communication = lazy(() => import('../features/komunikasi/Communication').then(module => ({ default: module.Communication })))
const StudentHabits = lazy(() => import('../features/student-habits/StudentHabits').then(module => ({ default: module.StudentHabits })))
const NotificationCenter = lazy(() => import('../features/notifications/NotificationCenter').then(module => ({ default: module.NotificationCenter })))
const AbsenceReports = lazy(() => import('../features/parents/AbsenceReports').then(module => ({ default: module.AbsenceReports })))
const SchoolDocuments = lazy(() => import('../features/school-documents/SchoolDocuments').then(module => ({ default: module.SchoolDocuments })))
const TeacherAttendance = lazy(() => import('../features/attendance/TeacherAttendance').then(module => ({ default: module.TeacherAttendance })))
const roles = [
  { icon: ShieldCheck, title: 'Administrator', detail: 'Data sekolah, akun, dan pengaturan akses' },
  { icon: ClipboardCheck, title: 'Kepala Sekolah', detail: 'Supervisi akademik dan modul ajar' },
  { icon: BookOpen, title: 'Ruang Guru', detail: 'Modul ajar, materi, absensi, dan jurnal' },
  { icon: GraduationCap, title: 'Ruang Murid', detail: 'Materi, tugas, dan asesmen' },
  { icon: Users, title: 'Ruang Orang Tua', detail: 'Kehadiran anak dan informasi sekolah' },
]
function Home() { return <section className="hero" aria-labelledby="home-title">
  <div className="hero-copy">
    <p className="hero-context">SDN 03 Wonosari</p>
    <h1 id="home-title">Ruang untuk <span>tumbuh bersama.</span></h1>
    <p>Materi, tugas, asesmen, jadwal, dan kabar sekolah dalam satu pintu masuk sesuai peran Anda.</p>
    <div className="hero-actions"><Link to="/login" className="button">Masuk ke aplikasi</Link></div>
    <p className="notice">Gunakan akun sekolah yang diberikan administrator. Setiap peran hanya melihat layanan yang menjadi kewenangannya.</p>
  </div>
  <aside className="role-ledger" aria-labelledby="role-ledger-title">
    <h2 id="role-ledger-title">Pintu masuk sesuai peran</h2>
    <p>Lima peran, satu lingkungan sekolah.</p>
    <ol>{roles.map(({icon: Icon,title,detail},index)=><li key={title}><span className="role-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><Icon size={20} aria-hidden="true"/><div><strong>{title}</strong><span>{detail}</span></div></li>)}</ol>
  </aside>
</section> }
export default function App() {
  if (!isConfigured && !demoAllowed) return <ErrorBoundary><ConfigMissing/></ErrorBoundary>
  return <ErrorBoundary><BrowserRouter><AuthProvider><a className="skip-link" href="#main-content">Langsung ke isi halaman</a><Header/><main id="main-content" tabIndex={-1}><Suspense fallback={<section className="board" role="status"><p>Memuat halaman…</p></section>}><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/lupa-kata-sandi" element={<ForgotPassword/>}/>
    <Route path="/kata-sandi" element={<ChangePassword/>}/>
    <Route path="/akun" element={<ProtectedRoute><Account/></ProtectedRoute>}/>
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
    <Route path="/tautan-akun" element={<ProtectedRoute><AccountRelationships/></ProtectedRoute>}/>
    <Route path="/ruang-orang-tua" element={<ProtectedRoute><GuardianPortal/></ProtectedRoute>}/>
    <Route path="/modul-ajar" element={<ProtectedRoute><TeachingModules/></ProtectedRoute>}/>
    <Route path="/materi" element={<ProtectedRoute><ClassMaterials/></ProtectedRoute>}/>
    <Route path="/tugas" element={<ProtectedRoute><ClassMaterials kind="task"/></ProtectedRoute>}/>
    <Route path="/asesmen" element={<ProtectedRoute><Assessments/></ProtectedRoute>}/>
    <Route path="/jadwal" element={<ProtectedRoute><Schedules/></ProtectedRoute>}/>
    <Route path="/supervisi" element={<ProtectedRoute><AcademicSupervision/></ProtectedRoute>}/>
    <Route path="/sekolah/:kind?" element={<ProtectedRoute><MasterData/></ProtectedRoute>}/>
    <Route path="/absensi" element={<ProtectedRoute><Attendance/></ProtectedRoute>}/>
    <Route path="/jurnal" element={<ProtectedRoute><Journals/></ProtectedRoute>}/>
    <Route path="/komunikasi" element={<ProtectedRoute><Communication/></ProtectedRoute>}/>
    <Route path="/kebiasaan" element={<ProtectedRoute><StudentHabits/></ProtectedRoute>}/>
    <Route path="/notifikasi" element={<ProtectedRoute><NotificationCenter/></ProtectedRoute>}/>
    <Route path="/laporan-ketidakhadiran" element={<ProtectedRoute><AbsenceReports/></ProtectedRoute>}/>
    <Route path="/dokumen" element={<ProtectedRoute><SchoolDocuments/></ProtectedRoute>}/>
    <Route path="/absensi-guru" element={<ProtectedRoute><TeacherAttendance/></ProtectedRoute>}/>
    <Route path="/pengumuman" element={<ProtectedRoute><Announcements/></ProtectedRoute>}/>
    <Route path="*" element={<section className="login"><h1>Halaman tidak ditemukan</h1><Link to="/">Kembali</Link></section>}/>
  </Routes></Suspense></main><footer>© SI STIR HEBAT · SDN 03 Wonosari · Tumbuh Bersama</footer></AuthProvider></BrowserRouter></ErrorBoundary>
}

