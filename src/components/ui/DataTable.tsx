import type { ReactNode } from 'react'

export type DataTableColumn<T> = { key: string; label: string; cell: (row: T) => ReactNode }

export function DataTable<T>({ caption, columns, rows, rowKey }: { caption: string; columns: DataTableColumn<T>[]; rows: T[]; rowKey: (row: T) => string }) {
  return <table className="data-table">
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
    <tbody>{rows.map(row => <tr key={rowKey(row)}>{columns.map(column => <td key={column.key} data-label={column.label}>{column.cell(row)}</td>)}</tr>)}</tbody>
  </table>
}
