# Handoff

Tanggal: 14 November 2026

## Selesai

- Workflow `.github/workflows/verify.yml` ditinjau: path root cocok untuk repository mandiri, Node 24 ditetapkan, dan lint/typecheck/tes/build/browser dijalankan.
- Selector alert berita diperjelas dan waktu tunggu tes preview Excel disesuaikan dengan batas parser.
- Checklist aktivasi operator dan catatan migration diperbarui tanpa menyentuh database.
- `npm run check` dan tes browser lengkap lulus lokal; detail versi runtime dan batas verifikasi dicatat di [status proyek](PROJECT_STATUS.md).

## Belum selesai

- Run GitHub Actions terbaru pada `main` masih merah pada tes browser yang diperbaiki di branch ini. Hasil workflow untuk branch ini belum tersedia karena belum ada PR/run remote.
- Chunk PDF besar masih menghasilkan peringatan build.
- Aktivasi administrator, Site URL/redirect, signup publik, email pemulihan, UAT akun sekolah, RBAC resmi, dan skema nilai resmi masih memerlukan tindak lanjut pemilik/operator.

## Blocker dan risiko

- Repository snapshot memiliki 22 berkas migration, sementara catatan operasional pemilik menyebut 23 migration tercatat pada hosted. Jangan melakukan perubahan database sampai riwayat dicocokkan dan rencana migration baru disetujui.
- Runtime sistem adalah Node 26.13; tes lokal lulus pada Node 24.22.3 yang disediakan sementara melalui npm. Workflow remote menggunakan konfigurasi Node 24.
- `AGENTS.md` dan dokumen status/log/keputusan/handoff belum tersedia pada snapshot saat pemeriksaan dimulai. Empat dokumen status di `docs/` kini dibuat berdasarkan bukti yang tersedia; verifikasi isi hosted tetap belum dilakukan.

## Langkah berikutnya

1. Pastikan `git diff --check` bersih.
2. Buka PR khusus perbaikan CI browser dan dokumentasi ini; sertakan hasil `npm run check` dan `npm run test:browser`. Jangan klaim CI remote hijau sampai run PR benar-benar lulus.
3. Minta pemilik/operator menuntaskan checklist aktivasi dan UAT.
4. Rekonsiliasi histori migration repository dan hosted secara read-only sebelum merencanakan perubahan database.
