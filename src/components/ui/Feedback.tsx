import type { ReactNode } from 'react'

export function ErrorNotice({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return <div className="error" role="alert"><p>{children}</p>{onRetry && <button className="refresh-button" type="button" onClick={onRetry}>Coba lagi</button>}</div>
}

export function LoadingState({ children = 'Memuat data…' }: { children?: ReactNode }) {
  return <p className="empty" role="status">{children}</p>
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>
}
