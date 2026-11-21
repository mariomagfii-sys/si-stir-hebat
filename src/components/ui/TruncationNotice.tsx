export function TruncationNotice({ hasMore }: { hasMore: boolean }) {
  if (!hasMore) return null
  return <p className="help" role="status">Daftar terpotong; muat halaman berikutnya.</p>
}
