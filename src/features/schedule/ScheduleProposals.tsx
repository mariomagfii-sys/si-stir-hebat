import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { ErrorNotice, LoadingState } from '../../components/ui/Feedback'

type Slot = { weekday: number; start_minute: number; end_minute: number; effective_from: string; effective_until: string }
type Proposal = Slot & { id: string; reason: string; status: string; decision_reason: string | null; original: Slot & { class_name: string; teacher_name: string; subject_name: string } }
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const time = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
const slot = (p: Slot) => `${days[p.weekday - 1]}, ${time(p.start_minute)}–${time(p.end_minute)}; ${p.effective_from} sampai ${p.effective_until}`
export function ScheduleProposals({ role, onApplied }: { role: string; onApplied: () => void }) {
  const [rows, setRows] = useState<Proposal[]>([])
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!supabase) return
    const controller = new AbortController()
    setLoading(true); setFailed(false); setRows([])
    void (async () => {
      try {
        const result = await supabase!.from('schedule_proposals').select('*').eq('status', status)
          .order('created_at', { ascending: false }).order('id').range(page * 20, page * 20 + 20).abortSignal(controller.signal)
        if (result.error) throw result.error
        if (!controller.signal.aborted) setRows(result.data as Proposal[])
      } catch { if (!controller.signal.aborted) setFailed(true) }
      finally { if (!controller.signal.aborted) setLoading(false) }
    })()
    return () => controller.abort()
  }, [page, status, attempt])
  async function decide(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault()
    if (!supabase || busy || error || role !== 'administrator') return
    const form = new FormData(event.currentTarget)
    setBusy(true)
    try {
      const result = await supabase.rpc('decide_schedule_proposal', { p_id: id, p_accept: form.get('decision') === 'accept', p_reason: String(form.get('reason')).trim() })
      if (result.error) {
        setError(result.error.code === '23P01' ? 'Usulan bentrok dengan jadwal lain. Jadwal belum diubah.' : result.error.code === '40001' ? 'Jadwal atau keputusan telah berubah. Muat ulang; usulan lama dapat ditolak dan diajukan kembali.' : 'Keputusan belum dikonfirmasi. Muat ulang sebelum mencoba lagi; periksa jadwal aktif dan penugasan pengusul.')
      } else onApplied()
    } catch { setError('Keputusan belum dikonfirmasi. Muat ulang untuk memeriksa status terbaru.') }
    finally { setBusy(false) }
  }
  return <section><h2>Usulan perubahan jadwal</h2><label>Status usulan<select disabled={busy} value={status} onChange={event => { setStatus(event.target.value); setPage(0); setError('') }}><option value="pending">Menunggu keputusan</option><option value="accepted">Disetujui</option><option value="rejected">Ditolak</option></select></label>
    <button disabled={busy} onClick={() => { setError(''); setAttempt(n => n + 1) }}>Muat ulang usulan</button>
    {error && <p role="alert">{error}</p>}
    {loading ? <LoadingState /> : failed ? <ErrorNotice onRetry={() => setAttempt(n => n + 1)}>Usulan gagal dimuat.</ErrorNotice> : <>
      {!rows.length && <p>Belum ada usulan pada status ini.</p>}
      {rows.slice(0, 20).map(p => <article className="tile" key={p.id}><h3>{p.original.subject_name} · {p.original.class_name}</h3><p>{p.original.teacher_name}</p><p>Semula: {slot(p.original)}</p><p>Usulan: {slot(p)}</p><p>Alasan: {p.reason}</p>{p.decision_reason && <p>Catatan keputusan: {p.decision_reason}</p>}
        {role === 'administrator' && p.status === 'pending' && <form onSubmit={event => void decide(event, p.id)}><fieldset disabled={busy || !!error}><label>Keputusan<select name="decision" required defaultValue=""><option value="">Pilih keputusan</option><option value="accept">Setujui dan terapkan</option><option value="reject">Tolak usulan</option></select></label><label>Alasan keputusan<textarea name="reason" required minLength={5} maxLength={500} /></label><p>Persetujuan mengganti seluruh rentang jadwal dengan usulan di atas dan langsung berlaku bagi pengguna terkait.</p><button type="submit">Simpan keputusan</button></fieldset></form>}
      </article>)}
      <button disabled={busy || page === 0} onClick={() => setPage(n => n - 1)}>Usulan sebelumnya</button><span>Halaman {page + 1}</span><button disabled={busy || rows.length <= 20} onClick={() => setPage(n => n + 1)}>Usulan berikutnya</button>
    </>}
  </section>
}
