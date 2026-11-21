export function ReferenceNotice({ truncated }: { truncated: boolean }) {
  if (!truncated) return null
  return <p className="status" role="status">Sebagian daftar referensi dipotong karena melebihi batas tampilan. Persempit pilihan atau hubungi administrator agar data yang dicari dapat muncul.</p>
}
