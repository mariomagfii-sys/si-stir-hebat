import { useEffect, useRef, type ReactNode } from 'react'

export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = 'Batal', tone = 'default', busy = false, onConfirm, onCancel }: { open: boolean; title: string; description: ReactNode; confirmLabel: string; cancelLabel?: string; tone?: 'default' | 'danger'; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    confirmRef.current?.focus()
    return () => {
      const target = previousFocus.current
      if (target?.isConnected) target.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) { onCancel(); return }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, busy, onCancel])

  if (!open) return null
  return <div className="confirm-dialog-backdrop" onClick={() => { if (!busy) onCancel() }}>
    <div ref={dialogRef} className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" onClick={event => event.stopPropagation()}>
      <h2 id="confirm-dialog-title">{title}</h2>
      <p id="confirm-dialog-description">{description}</p>
      <div className="confirm-dialog-actions">
        <button type="button" className="refresh-button" disabled={busy} onClick={onCancel}>{cancelLabel}</button>
        <button ref={confirmRef} type="button" className={tone === 'danger' ? 'button danger' : 'button'} disabled={busy} onClick={onConfirm}>{busy ? 'Memproses…' : confirmLabel}</button>
      </div>
    </div>
  </div>
}
