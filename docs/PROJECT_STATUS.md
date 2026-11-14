# Status proyek

Pembaruan: 14 November 2026. Cakupan dokumen ini adalah snapshot mandiri `github-release`, bukan folder lain di workspace.

## Status verifikasi

- Workflow `.github/workflows/verify.yml` sudah berada di root repository mandiri. Konfigurasinya memakai Node 24, `npm ci`, `npm run check`, instalasi Chromium, dan `npm run test:browser`; tes berjalan memakai endpoint tiruan.
- GitHub Actions run 5 pada commit `eb1d4f8` menjalankan `npm run check` dengan sukses, tetapi job gagal pada tes browser. Kegagalan yang ditemukan: selector alert berita tidak spesifik setelah ringkasan sekolah menampilkan alert lain, dan tes preview Excel memakai waktu tunggu bawaan 5 detik sementara parser worker dapat berjalan sampai 10 detik.
- Branch `agent/copilot/ci-docs` memperbaiki selector dan memperpanjang waktu tunggu tes preview. Dengan Node 24.22.3 dan nilai fixture CI non-rahasia, `npm run check` lulus (101 tes unit/database dan build), serta `npm run test:browser` lulus 174/174 desktop dan mobile.
- Node 24.22.3 disediakan sementara melalui npm karena runtime sistem adalah Node 26.13. Build masih menampilkan peringatan chunk PDF besar (`pdf-engine` dan `pdf-fonts`).

## Batas rilis dan pekerjaan terbuka

- Checklist aktivasi administrator, pengaturan Supabase Auth, email pemulihan, signup publik, env Vercel, dan UAT tersedia di [panduan aktivasi](AKTIVASI_DAN_RILIS.md), tetapi pengaturan hosted belum diverifikasi ulang pada pekerjaan ini.
- UAT akun sekolah, verifikasi login/logout/pemulihan pada deployment, matriks RBAC resmi, dan keputusan skema nilai masih terbuka. Skema nilai tetap sementara dan rapor otomatis tidak dihitung.
- Snapshot ini memiliki 22 berkas migration. Catatan operasional pemilik menyebut 23 migration sudah tercatat pada hosted. Riwayat repository dan hosted belum direkonsiliasi; jangan menerapkan migration dari snapshot ini, mengubah database hosted, atau mereset database.
- [Keputusan](DECISIONS.md), [log implementasi](IMPLEMENTATION_LOG.md), dan [handoff](HANDOFF.md) mencatat konteks perubahan dan langkah lanjutan.

Status ini bukan pernyataan bahwa aplikasi siap operasional.
