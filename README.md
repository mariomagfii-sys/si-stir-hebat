# SI STIR HEBAT

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
