import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'

// Explicit source allowlist: never copy .env.local, personal references, tool
// sessions, hosted project links, node_modules or downloaded test artifacts.
const root = resolve(import.meta.dirname, '..')
const destination = join(root, 'release', 'si-stir-hebat')
await mkdir(destination, { recursive: true })
for (const directory of ['src', 'public', 'tests', '.github']) {
  await cp(join(root, directory), join(destination, directory), { recursive: true })
}
for (const directory of ['supabase/migrations', 'supabase/tests']) {
  await cp(join(root, directory), join(destination, directory), { recursive: true })
}
await mkdir(join(destination, 'scripts'), { recursive: true })
for (const name of ['check-supabase.mjs', 'qa-academic-pdf.mjs']) {
  await cp(join(root, 'scripts', name), join(destination, 'scripts', name))
}
for (const name of ['package.json', 'package-lock.json', 'index.html', '.gitignore', '.env.example', 'vite.config.ts', 'vercel.json', 'eslint.config.js', 'playwright.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json']) {
  await cp(join(root, name), join(destination, name))
}
await mkdir(join(destination, 'docs'), { recursive: true })
await cp(join(root, 'docs/AKTIVASI_DAN_RILIS.md'), join(destination, 'docs/AKTIVASI_DAN_RILIS.md'))
await writeFile(join(destination, 'README.md'), `# SI STIR HEBAT

Aplikasi sekolah SDN 03 Wonosari: React, Vite, TypeScript dan Supabase.

## Menjalankan

Gunakan Node 24. Jalankan npm ci, salin .env.example ke .env.local dan isi konfigurasi Supabase milik sekolah, lalu npm run dev.

Validasi: npm run check dan npm run test:browser. Browser memakai API tiruan. Build produksi menolak konfigurasi Supabase kosong/tidak valid.

## Aktivasi dan deployment

Ikuti [panduan operator](docs/AKTIVASI_DAN_RILIS.md) untuk membuat akun admin, mengisi data sekolah, dan import repo ke Vercel. Root Directory adalah titik (root repository), build npm run build, output dist.

## Cakupan rilis awal

Login/profil, data sekolah, registri guru/siswa, penugasan/keanggotaan kelas, tautan akun/wali, pengumuman, absensi dan impor Excel, jurnal, modul ajar, supervisi, materi/tugas/pengumpulan/umpan balik, asesmen/rekap CSV Excel PDF, jadwal/usulan/riwayat.

Nilai maksimum per asesmen dan publikasi manual guru masih merupakan skema sementara. Tidak menghitung rapor otomatis. Komunikasi, kebiasaan siswa, administrasi dokumen sekolah, dan sejumlah kebutuhan lanjutan PRD belum tersedia. UAT akun sekolah tetap diperlukan sebelum penggunaan operasional.

Tidak memuat data siswa nyata, kredensial, lampiran pribadi, atau konfigurasi proyek hosted. Semua fixture tes adalah Data Contoh. Dua puluh dua migration sudah diterapkan pada proyek pengembangan; jangan mengulanginya pada proyek yang sama.
`)
async function inspect(directory) {
  let count = 0
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error('Release contains symlink')
    if (entry.isDirectory()) { count += await inspect(path); continue }
    if (entry.name.startsWith('.env') && entry.name !== '.env.example') throw new Error('Environment file in release')
    const contents = await readFile(path, 'utf8')
    if (/sb_secret_[A-Za-z0-9]{12,}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN .*PRIVATE KEY-----/.test(contents)) throw new Error('Possible credential in release; inspect locally')
    count++
  }
  return count
}
console.log(`Prepared ${await inspect(destination)} source files in release/si-stir-hebat; no local credentials or internal reference documents copied.`)
