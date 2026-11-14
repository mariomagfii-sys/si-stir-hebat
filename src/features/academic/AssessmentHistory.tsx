import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Event = { id: string; old_score: number | null; score: number | null; feedback: string; change_reason: string; revision: number; created_at: string }

export function AssessmentHistory({ resultId }: { resultId: string }) {
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
        const result = await client.from('assessment_result_events').select('id,old_score,score,feedback,change_reason,revision,created_at')
          .eq('result_id', resultId).order('revision', { ascending: false }).order('id')
          .range(page * 20, page * 20 + 20).abortSignal(controller.signal)
        if (result.error) throw result.error
        if (!controller.signal.aborted) setRows(result.data)
      } catch {
        if (!controller.signal.aborted) setError(true)
      }
    })()
    return () => controller.abort()
  }, [resultId, page, attempt])
  return <section aria-label="Riwayat perubahan nilai">
    <h3>Riwayat perubahan nilai</h3>
    {error ? <p role="alert">Riwayat gagal dimuat. <button type="button" onClick={() => setAttempt(value => value + 1)}>Muat ulang riwayat</button></p>
      : rows === null ? <p role="status">Memuat riwayat…</p>
        : !rows.length ? <p>Belum ada perubahan nilai pada halaman ini.</p>
          : rows.slice(0, 20).map(row => <article key={row.id}>
            <p>Revisi {row.revision} · <time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</time></p>
            <p>{row.old_score ?? 'Belum dinilai'} → {row.score ?? 'Belum dinilai'}</p>
            {row.feedback && <p className="announcement-body">{row.feedback}</p>}
            {row.change_reason && <p>Alasan: {row.change_reason}</p>}
          </article>)}
    {page > 0 && <button type="button" onClick={() => setPage(page - 1)}>Riwayat sebelumnya</button>}
    {(rows?.length ?? 0) > 20 && <button type="button" onClick={() => setPage(page + 1)}>Riwayat berikutnya</button>}
  </section>
}
