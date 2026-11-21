export function ConfigMissing() {
  return <section className="board config-missing" aria-labelledby="config-title">
    <h1 id="config-title">Aplikasi belum dikonfigurasi</h1>
    <p role="alert">Sambungan Supabase belum diatur untuk situs ini, sehingga halaman masuk dan data sekolah belum dapat dibuka.</p>
    <h2>Langkah untuk administrator</h2>
    <ol>
      <li>Tetapkan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> saat build sisi klien.</li>
      <li>Gunakan hanya kunci publishable. Service-role key atau secret lain tidak boleh ditaruh di frontend.</li>
      <li>Build ulang, terbitkan ulang situs, lalu muat ulang halaman ini.</li>
    </ol>
    <p className="help">Selama konfigurasi belum lengkap, aplikasi tidak menampilkan akun demo maupun data sekolah.</p>
  </section>
}
