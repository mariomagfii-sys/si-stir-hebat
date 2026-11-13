import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { schoolToday } from '../attendance/attendance-model'
import { TaskFeedback } from './TaskFeedback'

type Submission = { id: string; student_name: string; answer: string }

export function TaskSubmissions({ taskId, role, due }: { taskId: string; role: string; due: string }) {
  const [rows, setRows] = useState<Submission[] | null>(null)
  const [error, setError] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [page, setPage] = useState(0)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const client = supabase
    if (!client) return
    const controller = new AbortController()
    setRows(null)
    setError('')
    const load = async () => {
      try {
        const result = await client.from('task_submissions').select('id,student_name,answer')
          .eq('task_id', taskId).order('submitted_at').order('id')
          .range(page * 20, page * 20 + 20).abortSignal(controller.signal)
        if (result.error) throw result.error
        if (!controller.signal.aborted) {
          setRows(result.data)
          setNeedsVerification(false)
        }
      } catch {
        if (!controller.signal.aborted) setError('Jawaban gagal dimuat.')
      }
    }
    void load()
    return () => controller.abort()
  }, [taskId, page, attempt])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || busy || needsVerification || !answer.trim() || rows?.length !== 0) return
    setBusy(true)
    setError('')
    try {
      const result = await supabase.from('task_submissions').insert({ task_id: taskId, answer: answer.trim() })
        .select('id,student_name,answer').single()
      if (result.error?.code === '23505') {
        setAttempt(value => value + 1)
        return
      }
      if (result.error) throw result.error
      setRows([result.data])
      setAnswer('')
    } catch {
      setNeedsVerification(true)
      setError('Jawaban belum dikonfirmasi. Muat ulang untuk memeriksa status pengiriman.')
    } finally {
      setBusy(false)
    }
  }

  return <section>
    <h3>{role === 'student' ? 'Jawaban saya' : 'Jawaban siswa'}</h3>
    {error && <div role="alert">{error} <button type="button" disabled={busy} onClick={() => setAttempt(value => value + 1)}>Muat ulang</button></div>}
    {!rows && !error && <p role="status">Memuat jawaban…</p>}
    {rows?.slice(0, 20).map(row => <article key={row.id}>
      {role === 'teacher' && <h4>{row.student_name}</h4>}
      <p className="announcement-body">{row.answer}</p>
      <TaskFeedback taskId={taskId} submissionId={row.id} role={role} />
    </article>)}
    {role === 'teacher' && rows?.length === 0 && <p>Belum ada jawaban pada halaman ini.</p>}
    {page > 0 && <button type="button" onClick={() => setPage(page - 1)}>Sebelumnya</button>}
    {(rows?.length ?? 0) > 20 && <button type="button" onClick={() => setPage(page + 1)}>Berikutnya</button>}
    {role === 'student' && rows?.length === 0 && (due < schoolToday()
      ? <p>Tenggat pengumpulan sudah lewat.</p>
      : <form onSubmit={submit}>
        <label htmlFor="task-answer">Jawaban teks</label>
        <textarea id="task-answer" value={answer} required maxLength={12000} disabled={busy}
          onChange={event => setAnswer(event.target.value)} />
        <p>Jawaban yang terkirim tidak dapat diubah.</p>
        <button type="submit" className="button" disabled={busy || needsVerification || !answer.trim()}>Kirim jawaban</button>
      </form>)}
  </section>
}
