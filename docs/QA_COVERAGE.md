# Cakupan Uji Otomatis

Status: verifikasi lokal 20 November 2026
Sumber: `tests/browser/app.spec.ts`, `communication.spec.ts`, `notifications.spec.ts`, `absence-reports.spec.ts`, `habits.spec.ts`, dan `audit-responsive.spec.ts` (306 skenario termasuk desktop + ponsel); `tests/*.test.mjs` (137 tes unit/database).
Bukti terbaru Qoder: Node v24.22.3, suite penuh **306/306 lulus** (port 5383, 7,3 menit; log `C:\Users\axioo\AppData\Local\Temp\qoder-qa-2026-11-18\browser-full-5383.log`, EXIT 0). Run Codex sebelumnya 304/304 port 5377 juga lulus (log `...\browser-full-55000-5377.log`). `npm run check` EXIT 0: **137/137** tes unit/database, 39 migration, CI check, lint, typecheck, build 1.781 modul, audit 26 JS tanpa demo (log `...\check-5383.log`). Nilai Supabase build sintetis proses-lokal; `dist/` diperbarui. Delivery Gate UI: `docs/DELIVERY_GATE_2026-11-20.md`.

Cara membaca: "Ada" berarti minimal satu skenario browser pada desktop dan ponsel dengan API tiruan. Semua modul di bawah **belum** diuji dengan akun sekolah nyata; lihat [UAT_CHECKLIST.md](UAT_CHECKLIST.md).

## Matriks per modul

| Modul | Skenario yang tercakup | Belum tercakup |
| --- | --- | --- |
| Autentikasi & sesi | login gagal/diulang, sesi bertahan saat muat ulang, keluar, rute terlindungi, lupa/ubah kata sandi, profil, akun pending | email pemulihan nyata, embargo rate-limit Supabase |
| Dashboard & peran | layanan per peran, pengumuman terbaru, hitungan supervisi/modul ajar, nol vs gagal vs `—`, retry, ringkasan sekolah (admin/kepala sekolah) | ringkasan khusus guru/keluarga (PRD 5.x lanjutan) |
| Pengumuman | buat/ubah/terbit/arsip oleh pengelola, pembaca hanya terbit, pagination, galat jaringan | pengaturan target penerima |
| Data sekolah & registri | identitas, tahun ajaran/semester, mapel, kelas, guru/siswa, keanggotaan, penugasan, penolakan peran; daftar referensi lebih dari 1000 baris menampilkan notifikasi pemotongan dan form tetap dapat dipakai | impor data master, riwayat perubahan master |
| Absensi manual | sesi hari ini, isi status, koreksi/alasan, konflik revisi, penolakan siswa/wali, laporan >1000 baris | backdate, persetujuan koreksi, kehadiran guru |
| Impor Excel | preview wajib, penolakan duplikat/tipe, retry request ID sama | file rusak/terkunci di sisi server |
| Rekap absensi | rentang >31 hari ditolak, agregasi hanya baris sendiri (siswa), ekspor CSV | ekspor PDF rekap absensi |
| Jurnal | simpan + konfirmasi, retry ID sama, baca admin/kepala sekolah, penolakan siswa/wali/pending, pagination/CSV, status kesiapan | persetujuan/koreksi jurnal |
| Modul ajar | guru simpan draf, guru ajukan, kepala sekolah kembalikan dengan catatan | persetujuan/koreksi lanjutan, lampiran |
| Materi kelas | guru terbitkan, siswa membaca terbit tanpa kontrol tulis | arsip oleh guru, lampiran |
| Tugas kelas | siswa melihat tenggat, siswa mengirim jawaban (sukses/respons hilang/duplikat), guru membuat tugas, umpan balik guru, wali membaca umpan balik | pengumpulan lampiran, penilaian tugas→asesmen |
| Asesmen & rekap | guru buat/nilai nol/terbit/koreksi+riwayat, konflik revisi, laporan filter/grafik/ekspor CSV-Excel-PDF, mode terpotong/limpas/gagal, wali hanya hasil terbit, pending ditolak, peran baca-saja | kewenangan wali kelas, perubahan peserta |
| Jadwal | admin buat/ubah/konflik, usulan guru, keputusan admin (termasuk revisi usang), riwayat kepala sekolah, filter kelas | penarikan usulan guru, pemecahan periode |
| Supervisi | jadwal→observasi, simpan otomatis + konflik, unggah bukti privat, laporan + ekspor, penolakan siswa/wali/pending | instrumen resmi, tanda tangan digital |
| Tautan akun & wali | admin meninjau tautan, portal wali & pencabutan relasi, penolakan wali pada formulir tautan, penolakan guru/siswa/wali/pending | verifikasi identitas manual |
| Komunikasi | 2 skenario UI: respons insert hilang dan konfirmasi pesan; pagination melewati batas 25 baris tanpa celah | pengujian dengan akun sekolah nyata, supervisi/retensi/notifikasi sesuai keputusan pemilik |
| Pusat notifikasi | 2 skenario UI: tanda-baca gagal lalu diulang tanpa kehilangan notifikasi; pagination 25 baris dengan sentinel | pembuatan notifikasi oleh modul lain (pengumuman, ketidakhadiran, supervisi, asesmen), badge jumlah belum dibaca di navigasi, akun sekolah nyata |
| Laporan ketidakhadiran | 3 skenario UI: wali mengirim ulang laporan dengan ID sama setelah respons hilang; guru memuat ulang setelah konflik revisi lalu mengonfirmasi; guru mendapat pesan tindak lanjut saat tidak ada tepat satu sesi absensi cocok (`55000`), tanpa sukses palsu, dan dapat kembali ke daftar | perbaikan laporan oleh wali, lampiran bukti, notifikasi otomatis ke guru, akun sekolah nyata |
| 7 Kebiasaan | 4 skenario UI (8 instance desktop + ponsel): murid menandai kebiasaan lalu menyimpan; guru wajib mengisi catatan validasi sebelum menandai tervalidasi; tanggal kosong tampil "belum diisi" dan checklist kosong tidak tersimpan; rekap terakhir berlabel pertumbuhan, bukan peringkat. Terverifikasi pada suite penuh 306/306 (20 November 2026) | pembeda "belum diisi" vs "tidak dilakukan" (PD-12), form wali dengan beberapa anak, akun sekolah nyata |
| Administrasi dokumen | belum ada implementasi | seluruh modul (menunggu C2/U2) |

## Uji non-browser

| Cakupan | Berkas |
| --- | --- |
| Model absensi, impor, rekap, jurnal, penilaian | `tests/attendance*.test.mjs`, `tests/journals.test.mjs`, `tests/assessment-model.test.mjs` |
| CSV/XLSX/PDF akademik | `tests/csv.test.mjs`, `tests/academic-pdf.test.mjs`, `tests/academic-report.test.mjs` |
| Konfigurasi & validasi | `tests/config.test.mjs`, `tests/master.test.mjs`, `tests/password.test.mjs` |
| Database (RLS, trigger, grant kolom) | `tests/database.test.mjs`, `tests/communication.test.mjs` |
| Autentikasi demo | `tests/demo-auth.test.mjs` |

## Batas

- Tes browser memakai API tiruan (`page.route`) dan sesi sintetis; bukan bukti RLS hosted.
- Run penuh terbaru bersih: 306/306 lulus pada 20 November 2026 (Node v24.22.3, port 5383, 7,3 menit, 6 berkas spesifikasi termasuk `audit-responsive.spec.ts`). Kegagalan tunggal di port 5381 adalah chunk rute lazy yang belum selesai saat assertion 5 detik; setelah batas assertion pending-master dinaikkan ke 15 detik, run 5383 bersih. Run sebelumnya 304/304 port 5377 juga bersih; kegagalan lama berasal dari tes beranda usang yang sudah disesuaikan, bukan regresi fitur.
- Riwayat: run Qoder 18 November (port 5331) 215/216 dan run T-A Copilot 18 November (port 5191, Node v26.13.0) 213/216; kegagalan assertion keduanya adalah tes beranda usang, ditambah satu `ENOENT` artefak trace saat teardown. Angka itu tidak lagi menjadi status terkini.
- Hasil di atas memakai API tiruan dan tidak menggantikan UAT.
- Kesenjangan yang butuh keputusan produk (kehadiran guru, komunikasi, dokumen) tercatat di [DECISIONS.md](DECISIONS.md) dan [HANDOFF.md](HANDOFF.md).
