import type { ReactNode } from 'react'

export function PageHeader({ title, description, eyebrow, actions }: { title: string; description?: ReactNode; eyebrow?: string; actions?: ReactNode }) {
  return <header className="page-header">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {actions && <div className="page-header-actions">{actions}</div>}
  </header>
}
