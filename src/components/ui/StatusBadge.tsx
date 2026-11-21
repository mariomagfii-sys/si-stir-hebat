import type { ReactNode } from 'react'

export type StatusTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info'

export function StatusBadge({ tone = 'neutral', children }: { tone?: StatusTone; children: ReactNode }) {
  return <span className={tone === 'neutral' ? 'status-badge' : `status-badge status-badge--${tone}`}>{children}</span>
}
