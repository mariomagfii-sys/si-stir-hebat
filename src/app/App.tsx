import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { BookOpen, GraduationCap, Users, ClipboardCheck, ShieldCheck, ArrowRight } from 'lucide-react'
import { AuthProvider, ProtectedRoute } from './Auth'
import { Announcements } from './Announcements'
import { Dashboard } from './Dashboard'
import { Header } from './Header'
import { MasterData } from '../features/school/MasterData'
import { AccountRelationships } from '../features/school/AccountRelationships'
import { GuardianPortal } from '../features/guardian/GuardianPortal'
import { TeachingModules } from '../features/learning/TeachingModules'
import { ClassMaterials } from '../features/learning/ClassMaterials'
import { Assessments } from '../features/academic/Assessments'
import { Schedules } from '../features/schedule/Schedules'
import { AcademicSupervision } from '../features/supervision/AcademicSupervision'
import { Attendance } from '../features/attendance/Attendance'
import { Journals } from '../features/journals/Journals'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { Account, Login } from './Account'
import { ChangePassword, ForgotPassword } from './Password'
const spaces = [
  { icon: ShieldCheck, title: 'Administrator', detail: 'Data sekolah, akun dan pengaturan akses' },
  { icon: ClipboardCheck, title: 'Kepala Sekolah', detail: 'Supervisi, dokumen dan laporan' },
  { icon: BookOpen, title: 'Ruang Guru', detail: 'Kelas, absensi, jurnal dan asesmen' },
  { icon: GraduationCap, title: 'Ruang Murid', detail: 'Materi, tugas dan kebiasaan baik' },
  { icon: Users, title: 'Ruang Orang Tua', detail: 'Perkembangan anak dan komunikasi' },
]
function Home() { return <><section className="hero"><div className="eyebrow">SISTEM INFORMASI SEKOLAH TERINTEGRASI</div><h1>Ruang untuk <span>tumbuh bersama.</span></h1><p>Menghubungkan sekolah, guru, murid, dan orang tua melalui layanan pendidikan yang aman, teratur, dan ramah anak.</p><Link to="/login" className="button">Masuk ke Aplikasi <ArrowRight size={18}/></Link><div className="notice">Akses layanan sekolah mengikuti peran akun. Gunakan akun sekolah yang telah ditetapkan perannya.</div></section><section className="spaces"><h2>Lima ruang, satu ekosistem</h2><div className="grid">{spaces.map(({icon: Icon,title,detail})=><article className="tile" key={title}><Icon size={25}/><h3>{title}</h3><p>{detail}</p></article>)}</div></section></> }
export default function App() {
  return <ErrorBoundary><BrowserRouter><AuthProvider><a className="skip-link" href="#main-content">Langsung ke isi halaman</a><Header/><main id="main-content" tabIndex={-1}><Routes>
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
    <Route path="/pengumuman" element={<ProtectedRoute><Announcements/></ProtectedRoute>}/>
    <Route path="*" element={<section className="login"><h1>Halaman tidak ditemukan</h1><Link to="/">Kembali</Link></section>}/>
  </Routes></main><footer>© SI STIR HEBAT · SDN 03 Wonosari · Tumbuh Bersama</footer></AuthProvider></BrowserRouter></ErrorBoundary>
}

