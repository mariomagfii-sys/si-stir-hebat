# Log implementasi

## 14 November 2026 — Perbaikan CI browser dan dokumentasi aktivasi

- Memperbaiki tes browser berita agar memilih alert pengumuman yang tepat ketika dashboard juga menampilkan alert jumlah data.
- Memperpanjang waktu tunggu tes preview impor XLSX menjadi 15 detik, di atas batas pemrosesan worker 10 detik.
- Menambahkan checklist operator untuk aktivasi administrator, signup publik, URL/redirect Supabase Auth, email pemulihan, env Vercel, CI, dan UAT.
- Menjelaskan perbedaan 22 berkas migration pada snapshot dengan 23 migration yang menurut catatan operasional telah tercatat di hosted. Tidak ada migration atau database yang diubah.
- Workflow CI tidak diubah karena sudah berada di root repository mandiri dan mencakup pemeriksaan yang diminta.

### Verifikasi dan batas

- `npm run check`: lulus dengan Node 24.22.3 dan nilai fixture CI; lint, typecheck, 101 tes unit/database, dan build berhasil.
- `npm run test:browser`: lulus dengan Node 24.22.3, 174/174 tes desktop dan mobile (`PLAYWRIGHT_CHANNEL=chromium`).
- GitHub Actions run 5 pada commit `eb1d4f8`: `npm run check` lulus, tes browser gagal sebelum perbaikan. Hasil workflow remote untuk branch perubahan belum tersedia.
- Runtime sistem adalah Node 26.13; Node 24.22.3 dipakai sementara melalui npm. Build tetap memberi peringatan chunk PDF besar.
