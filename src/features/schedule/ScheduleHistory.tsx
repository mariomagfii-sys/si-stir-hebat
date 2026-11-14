import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Snapshot = { weekday: number; start_minute: number; end_minute: number; effective_from: string; effective_until: string; is_active: boolean; revision: number }
type Event = { id: string; old_values: Snapshot | null; new_values: Snapshot; reason: string; created_at: string }
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const clock = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
function snapshot(value: Snapshot) {
  return `${days[value.weekday - 1]} · ${clock(value.start_minute)}–${clock(value.end_minute)} · ${value.effective_from} sampai ${value.effective_until} · ${value.is_active ? 'Aktif' : 'Nonaktif'}`
}
export function ScheduleHistory({ scheduleId }: { scheduleId: string }) {
  const [rows, setRows] = useState<Event[] | null>(null)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const client = supabase
    if (!client) return
    const controller = new AbortController()
    setRows(null); setError(false)
    void (async () => {
      try {
        const result = await client.from('lesson_schedule_events').select('id,old_values,new_values,reason,created_at')
          .eq('schedule_id', scheduleId).order('created_at', { ascending: false }).order('id', { ascending: false })
          .range(page * 20, page * 20 + 20).abortSignal(controller.signal)
        if (result.error) throw result.error
        if (!controller.signal.aborted) setRows(result.data as Event[])
      } catch { if (!controller.signal.aborted) setError(true) }
    })()
    return () => controller.abort()
  }, [scheduleId, page, attempt])
  return <section aria-label="Riwayat perubahan jadwal"><h3>Riwayat perubahan jadwal</h3>
    {error ? <p role="alert">Riwayat gagal dimuat. <button onClick={() => setAttempt(n => n + 1)}>Muat ulang riwayat</button></p>
      : rows === null ? <p role="status">Memuat riwayat…</p>
        : !rows.length ? <p>Belum ada riwayat pada halaman ini.</p>
          : rows.slice(0, 20).map(row => <article key={row.id}>
            <h4>{row.old_values ? `Perubahan revisi ${row.new_values.revision}` : 'Jadwal dibuat'}</h4>
            <p><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</time></p>
            {row.old_values && <p>Sebelum: {snapshot(row.old_values)}</p>}
            <p>Sesudah: {snapshot(row.new_values)}</p><p className="announcement-body">Alasan: {row.reason}</p>
          </article>)}
    <button disabled={rows === null || page === 0} onClick={() => setPage(n => n - 1)}>Riwayat sebelumnya</button>
    <span>Halaman riwayat {page + 1}</span>
    <button disabled={!rows || rows.length <= 20} onClick={() => setPage(n => n + 1)}>Riwayat berikutnya</button>
  </section>
}
