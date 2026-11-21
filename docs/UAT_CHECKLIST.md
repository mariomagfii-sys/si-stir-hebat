# Checklist UAT Berakun Sekolah

Status: rancangan — **belum dijalankan pada akun sekolah nyata**
Tanggal: 14 November 2026
Pemilik: Kilo (QA)
Acuan detail: [PANDUAN_UAT.md](PANDUAN_UAT.md)

Berkas ini adalah daftar periksa yang dapat dicetak/diisi. `PANDUAN_UAT.md` tetap menjadi rincian skenario; bila berbeda, rincian di sana yang berlaku.

## Cara pakai

1. Siapkan akun uji A/K/G/S/W/P sesuai [PANDUAN_UAT.md](PANDUAN_UAT.md) bagian 1 beserta data sintetis minimum.
2. Jalankan pada build produksi (`npm run build` + `npm run preview`) atau deployment Vercel dengan konfigurasi Supabase valid. Jika panel "Mode demo aktif" muncul, hentikan UAT dan perbaiki konfigurasi.
3. Uji tiap skenario pada desktop 1280×900 dan ponsel 390×844 bila kolom Layar tidak menentukan lain.
4. Isi kolom **L/G** dengan `L` (lulus), `G` (gagal), atau `B` (terblokir). Tulis tanggal + inisial pada kolom Catatan, mis. `G 2026-11-20/AR: modal tidak muncul`.
5. Untuk setiap `G`, lampirkan langkah yang gagal, pesan di layar, dan tangkapan layar (simpan di luar repo).
6. Jangan mengubah kode, migration, atau data hosted selama sesi UAT. Jangan mencatat kata sandi/token di berkas ini.

## Legenda

| Kode | Peran |
| --- | --- |
| A | administrator |
| K | principal (kepala sekolah) |
| G | teacher (guru) |
| S | student (siswa) |
| W | parent (wali) |
| P | pending |

Layar: `D` = desktop, `M` = ponsel, `D+M` = keduanya.

---

## 1. Umum (semua peran)

| ID | Langkah | Hasil diharapkan | Layar | L/G | Catatan |
| --- | --- | --- | --- | --- | --- |
| U-01 | `/login` dengan email tidak terdaftar. | Pesan galat tampil pada `alert`; tetap di `/login`; tidak ada data sekolah. | D+M | | |
| U-02 | `/login` dengan kata sandi salah 3×. | Setiap percobaan ditolak; tidak ada data yang tampil. | D+M | | |
| U-03 | Masuk sebagai A, K, G, S, W. | Tiba di `/dashboard`; nama dan peran benar; menu sesuai peran. | D+M | | |
| U-04 | Muat ulang setelah masuk, lalu keluar. | Sesi bertahan setelah muat ulang; setelah keluar rute terlindungi dialihkan ke `/login`. | D+M | | |
| U-05 | `/akun` ubah nama lalu simpan. | Nama tersimpan dan tampil; peran tidak dapat diubah dari UI. | D+M | | |
| U-06 | `/lupa-kata-sandi` lalu buka tautan email ke `/kata-sandi`. | Pesan tidak mengungkap status email; kata sandi min. 8 karakter dan konfirmasi harus sama. | D | | |
| U-07 | Tanpa login buka `/dashboard`, `/sekolah`, `/absensi`. | Dialihkan ke `/login`; tidak ada data. | D+M | | |
| U-08 | Periksa panel login produksi. | Tidak ada panel "Mode demo aktif" dan tidak ada akun sintetis. | D+M | | |
| U-09 | Jalankan satu alur utama dengan keyboard saja. | Fokus terlihat, urutan tab logis, Escape menutup dialog konfirmasi. | D+M | | |
| U-10 | Buka `/` dan rute tidak dikenal. | Beranda memuat; rute tak dikenal menampilkan "Halaman tidak ditemukan" + tautan kembali. | D+M | | |

## 2. Akun pending (P)

| ID | Langkah | Hasil diharapkan | Layar | L/G | Catatan |
| --- | --- | --- | --- | --- | --- |
| P-01 | Masuk sebagai P, buka `/dashboard` dan `/akun`. | Profil tampil dengan pesan menunggu penetapan peran; P dapat mengubah nama sendiri. | D+M | | |
| P-02 | Buka `/pengumuman` dan `/sekolah` langsung lewat URL. | Ditolak; tidak ada pengumuman/data master. | D+M | | |
| P-03 | Buka `/tautan-akun`, `/absensi`, `/jurnal`, `/asesmen`, `/supervisi`. | Ditolak atau tidak menampilkan data. | D | | |

## 3. Administrator (A)

| ID | Langkah | Hasil diharapkan | Layar | L/G | Catatan |
| --- | --- | --- | --- | --- | --- |
| A-01 | `/sekolah` identitas: isi nama/alamat/NPSN lalu simpan. | Tersimpan; NPSN salah ditolak; tidak ada nilai default palsu. | D+M | | |
| A-02 | Buat tahun ajaran, aktifkan; buat semester di dalam rentangnya. | Aktivasi minta konfirmasi; hanya satu tahun aktif; tanggal di luar rentang ditolak. | D+M | | |
| A-03 | Buat mata pelajaran dan kelas (tingkat 1–6, kapasitas 1–100). | Tersimpan; nilai di luar batas ditolak. | D+M | | |
| A-04 | Catat guru dan siswa pada `/sekolah/teachers` dan `/sekolah/students`. | Tersimpan; tidak ada kolom akun/peran/NIP/NISN. | D+M | | |
| A-05 | Masukkan siswa ke kelas; coba siswa yang sama ke kelas lain tahun sama. | Keanggotaan tersimpan; keanggotaan ganda dan kapasitas terlampaui ditolak. | D+M | | |
| A-06 | Tugaskan guru ke kelas + mata pelajaran. | Penugasan tersimpan; konflik ditolak. | D+M | | |
| A-07 | `/pengumuman` buat draf, terbitkan, arsipkan; periksa sebagai G/S/W. | Draf/arsip hanya untuk A/K; pembaca hanya melihat terbit; isi teks biasa. | D+M | | |
| A-08 | `/tautan-akun` tautkan G, S, lalu W ke S. | Tautan aktif; G membaca siswa kelasnya, S melihat profil sendiri, W melihat anaknya. | D | | |
| A-09 | `/jadwal` tambah dan ubah jadwal. | Tersimpan; konflik guru/kelas ditolak; revisi optimistis berlaku. | D+M | | |
| A-10 | Minta G mengusulkan perubahan jadwal, lalu putuskan sebagai A. | Persetujuan menerapkan perubahan; penolakan wajib alasan; usulan lain tetap pending. | D+M | | |
| A-11 | `/absensi` buka sesi dan rekap. | A hanya membaca; tidak ada tombol isi/impor status. | D+M | | |
| A-12 | Buka `/jurnal`, `/modul-ajar`, `/materi`, `/tugas`, `/asesmen`. | A hanya membaca data yang diizinkan; tidak dapat menulis nilai/absensi. | D+M | | |
| A-13 | Buka `/supervisi` dan `/ruang-orang-tua`. | Tidak tersedia untuk A; akses URL langsung ditolak. | D+M | | |

## 4. Kepala sekolah (K)

| ID | Langkah | Hasil diharapkan | Layar | L/G | Catatan |
| --- | --- | --- | --- | --- | --- |
| K-01 | Buka semua tab `/sekolah`. | K membaca; tidak ada tombol tambah/ubah yang berhasil. | D+M | | |
| K-02 | Kelola pengumuman (buat/ubah/terbit/arsip). | K dapat mengelola; tidak mendapat akses seluruh profil. | D+M | | |
| K-03 | `/sekolah/teachers` dan `/sekolah/students`. | K membaca registri; tidak dapat mengubah. | D+M | | |
| K-04 | `/absensi` sesi, riwayat koreksi, rekap tanggal, riwayat impor. | K membaca; tidak ada aksi tulis. | D+M | | |
| K-05 | `/jurnal` daftar jurnal G. | K membaca; tidak dapat membuat/mengubah. | D+M | | |
| K-06 | `/modul-ajar` kembalikan modul dengan alasan, lalu setujui. | Status berubah dan tercatat; alasan wajib saat mengembalikan. | D+M | | |
| K-07 | `/supervisi` buat supervisi, isi tahapan, unggah bukti PDF/JPG/PNG ≤10 MB. | Tersimpan; bukti terunggah; laporan terbuka. | D | | |
| K-08 | `/jadwal` lihat usulan G. | K hanya membaca; keputusan milik A. | D+M | | |
| K-09 | Buka `/tautan-akun`. | Ditolak. | D+M | | |
| K-10 | `/dashboard` periksa ringkasan supervisi/modul ajar. | Angka kosong tampil sebagai `—` bila gagal dimuat, bukan 0. | D+M | | |

## 5. Guru (G)

| ID | Langkah | Hasil diharapkan | Layar | L/G | Catatan |
| --- | --- | --- | --- | --- | --- |
| G-01 | `/absensi` buat sesi kelas penugasan untuk hari ini. | Sesi hari ini dengan semua status "Belum diisi"; sesi lampau tidak tersedia. | D+M | | |
| G-02 | Isi status lalu simpan; ubah status terisi tanpa alasan. | Simpan berhasil; koreksi tanpa alasan 5–300 karakter ditolak; riwayat mencatat. | D+M | | |
| G-03 | Simpan dari dua tab pada sesi sama. | Konflik revisi terdeteksi; UI minta muat ulang; tidak ada penimpaan diam-diam. | D | | |
| G-04 | Unduh template XLSX, isi, unggah, periksa preview, konfirmasi. | Preview wajib; kode asing/ganda memblokir; status kosong tidak mengubah catatan. | D+M | | |
| G-05 | Ulangi impor yang sama setelah respons tidak pasti. | Request ID sama; tidak ada duplikasi. | D | | |
| G-06 | Rekap rentang ≤31 hari lalu ekspor CSV. | Termasuk "Belum diisi"; >31 hari ditolak; ekspor hanya setelah semua query berhasil. | D+M | | |
| G-07 | `/jurnal` buat jurnal hari ini. | Tersimpan dengan snapshot server; tidak dapat diedit/dihapus. | D+M | | |
| G-08 | `/modul-ajar` buat draf lalu kirim. | Draf dapat diubah sebelum dikirim; setelah dikirim menunggu keputusan. | D+M | | |
| G-09 | `/materi` buat draf lalu terbitkan. | S hanya melihat setelah terbit. | D+M | | |
| G-10 | `/tugas` buat tugas, periksa jawaban S, beri umpan balik. | Hanya tugas milik G; umpan balik draf tidak terlihat S sebelum terbit. | D+M | | |
| G-11 | `/asesmen` buat asesmen, isi nilai, terbitkan, koreksi terbit. | Publikasi manual; koreksi wajib alasan dan tercatat; tidak ada rapor otomatis. | D+M | | |
| G-12 | `/jadwal` usulkan perubahan. | Tersimpan sebagai pending; jadwal tidak berubah sampai A memutuskan. | D+M | | |
| G-13 | `/supervisi` buka supervisi milik G. | G melihat miliknya; supervisi guru lain tidak tampil. | D+M | | |
| G-14 | `/sekolah/teachers` dan `/sekolah/students`. | Hanya profil sendiri dan siswa kelas penugasan. | D+M | | |
| G-15 | Buka `/tautan-akun`. | Ditolak. | D+M | | |

## 6. Siswa (S)

| ID | Langkah | Hasil diharapkan | Layar | L/G | Catatan |
| --- | --- | --- | --- | --- | --- |
| S-01 | `/akun` dan `/sekolah/students`. | Hanya profil sendiri. | D+M | | |
| S-02 | `/absensi` buka catatan kehadiran. | Hanya catatan S; alasan koreksi staf tidak terlihat; tidak dapat mengisi. | D+M | | |
| S-03 | `/absensi` tampilkan rekap kelas. | Hanya baris S. | D+M | | |
| S-04 | `/materi` buka materi terbit. | Terbaca; draf tidak tampil. | D+M | | |
| S-05 | `/tugas` buka tugas terbit dan kirim jawaban. | Jawaban tersimpan; jawaban siswa lain tidak tampil. | D+M | | |
| S-06 | `/asesmen` buka hasil. | Hanya asesmen terbit milik S. | D+M | | |
| S-07 | `/jadwal` dan `/pengumuman`. | Membaca; tidak ada tombol kelola. | D+M | | |
| S-08 | Buka `/jurnal`, `/modul-ajar`, `/supervisi`, `/tautan-akun`. | Ditolak; tidak ada data guru/staf. | D+M | | |

## 7. Wali (W)

| ID | Langkah | Hasil diharapkan | Layar | L/G | Catatan |
| --- | --- | --- | --- | --- | --- |
| W-01 | `/ruang-orang-tua` buka portal. | Hanya anak tertaut aktif; maksimal 30 catatan terbaru. | D+M | | |
| W-02 | Setelah A menonaktifkan relasi, muat ulang portal. | Anak tidak lagi tampil pada permintaan berikutnya. | D+M | | |
| W-03 | `/pengumuman` dan `/jadwal`. | Membaca; tidak ada tombol kelola. | D+M | | |
| W-04 | `/materi` dan `/tugas` anak. | Hanya data anak tertaut yang terbit. | D+M | | |
| W-05 | `/asesmen` hasil anak. | Hanya asesmen terbit anak tertaut. | D+M | | |
| W-06 | Buka `/absensi`, `/sekolah/teachers`, `/sekolah/students`, `/jurnal`, `/tautan-akun`. | Ditolak; tidak ada data registri/absensi mentah/jurnal. | D+M | | |

## 8. Keamanan lintas peran

| ID | Langkah | Hasil diharapkan | Layar | L/G | Catatan |
| --- | --- | --- | --- | --- | --- |
| X-01 | Untuk tiap peran, buka URL yang tidak ada di menunya. | UI menolak dan permintaan data tidak mengembalikan baris (periksa tab Network). | D | | |
| X-02 | Sebagai G, coba baca siswa di luar kelas penugasan via Data API dengan sesi G. | Tidak ada baris; penolakan dari database. | D | | |
| X-03 | Sebagai G, coba unduh URL bukti supervisi G lain. | Ditolak; bucket tetap privat. | D | | |
| X-04 | Jalankan `npm run check:supabase` dengan `.env.local` benar. | Auth aktif; seluruh tabel pada daftar menolak anonim; tidak membaca baris data. | D | | |
| X-05 | Periksa Network saat login/ubah profil. | Tidak ada secret/service role key; peran tidak dapat diubah dari metadata pengguna. | D | | |
| X-06 | Bandingkan "Akses cepat" di dashboard untuk A, K, G, S, W, dan akun menunggu. | Materi/Tugas/Asesmen hanya tampil untuk G/S/W; Dokumen sekolah dan Absensi guru hanya untuk staf; "Siapkan data sekolah" hanya A; "Kehadiran anak" hanya W; akun menunggu hanya melihat Profil saya dan Keamanan akun. | D+M | | Diuji browser dengan API tiruan (6 peran × desktop/ponsel, 12/12 lulus), bukan akun nyata. |

## 9. Modul baru — 20 November 2026

Semua baris di bawah **belum dijalankan dengan akun sekolah nyata**. Migration `20261118000100`–`20261118000400` juga belum diterapkan hosted, sehingga skenario yang membutuhkan tabel tersebut baru dapat dijalankan setelah persetujuan dan penerapan migration. Baris DOC dan TA juga bergantung pada `20261120040847`, `20261120043317` (dokumen) dan `20261120042600` (absensi guru) yang belum hosted menurut papan koordinasi.

| ID | Langkah | Hasil diharapkan | Layar | L/G | Catatan |
| --- | --- | --- | --- | --- | --- |
| N-01 | A/K/G/S/W buka `/notifikasi`. | Hanya notifikasi milik akun sendiri; maksimal 25 baris per halaman; label kategori dan prioritas berbahasa Indonesia. | D+M | | Butuh tabel `notifications` hosted. |
| N-02 | W tandai satu notifikasi sudah dibaca, muat ulang halaman. | Penanda "Belum dibaca" hilang dan tetap hilang setelah muat ulang; waktu baca tampil. | D+M | | Panggilan `mark_notification_read`. |
| N-03 | Putuskan koneksi saat menandai notifikasi, lalu coba lagi. | Pesan galat menyebut judul notifikasi; tombol tetap tersedia; percobaan ulang berhasil tanpa duplikasi. | D+M | | Diuji browser dengan API tiruan (suite penuh 312/312 port 5401, 20 November 2026), bukan akun nyata. |
| N-04 | S sebagai akun lain memanggil Data API `notifications` dengan sesi G. | Tidak ada baris; penolakan dari RLS. | D | | Periksa tab Network, jangan unduh data. |
| N-05 | P (pending) buka `/notifikasi` lewat URL. | Tidak ada tautan navigasi Notifikasi; bila URL dibuka langsung, tidak ada notifikasi yang tampil. | D+M | | Diuji browser dengan API tiruan (desktop + ponsel). |
| N-06 | Akun dengan 26 notifikasi membuka `/notifikasi`, tekan "Berikutnya", lalu "Sebelumnya". | Halaman 1 menampilkan 25 notifikasi dan indikator "Daftar terpotong; muat halaman berikutnya."; halaman 2 menampilkan notifikasi ke-26 tanpa indikator; penanda "Halaman N" berubah. | D+M | | Diuji browser dengan API tiruan (2/2, desktop + ponsel, 19,1 dtk, port 5191); butuh tabel `notifications` hosted untuk UAT nyata. |
| KB-01 | S atau W isi `/kebiasaan` hari ini lalu simpan. | Catatan tersimpan per tanggal; guru melihat status "Menunggu validasi guru"; wali dengan beberapa anak memilih murid lebih dulu; rekap 7 catatan terakhir tampil per indikator tanpa peringkat. | D+M | | Tanggal tanpa catatan tampil "belum diisi"; model catatan per tanggal masih boolean (PD-12 terbuka). Pemilih murid untuk wali dua anak diuji browser dengan API tiruan (POST hanya untuk anak dipilih), bukan akun nyata. |
| KB-02 | G validasi catatan setelah konfirmasi orang tua, pertama tanpa catatan lalu dengan catatan. | Tanpa catatan ditolak; dengan catatan status menjadi "Tervalidasi" dan catatan guru tercatat. | D+M | | Diuji browser dengan API tiruan (2 skenario × desktop/ponsel), bukan akun nyata. |
| KB-03 | S atau W membuka `/kebiasaan` pada tanggal tanpa isian, lalu simpan checklist kosong. | Tanggal kosong berlabel "belum diisi" (bukan "tidak dilakukan"); checklist kosong tidak tersimpan dan tidak dianggap catatan baru. | D+M | | Diuji browser dengan API tiruan, bukan akun nyata. |
| KB-04 | Periksa rekap setelah beberapa catatan terkumpul. | Rekap berlabel pertumbuhan/perkembangan anak; tidak ada kata peringkat/juara/terbaik dan tidak ada perbandingan antarmurid. | D+M | | Sesuai D6; diuji browser dengan API tiruan. |
| KB-05 | Akun berstatus menunggu membuka `/kebiasaan` lewat URL. | Ditolak "Halaman kebiasaan tidak tersedia untuk peran ini."; roster dan rekap tidak diminta; tautan 7 Kebiasaan tidak tampil. | D+M | | Diuji browser dengan API tiruan (desktop + ponsel). |
| AR-01 | W buka `/laporan-ketidakhadiran`, pilih anak, isi tanggal lampau dan alasan, kirim. | Laporan tersimpan; status "Menunggu pemeriksaan guru"; tanggal mendatang ditolak. | D+M | | Butuh migration `20261118000200` hosted. |
| AR-02 | W kirim dua laporan aktif untuk anak dan tanggal yang sama. | Laporan kedua ditolak sebagai duplikat; tidak ada baris ganda. | D+M | | Unique index laporan aktif per anak/tanggal. |
| AR-03 | G dari kelas lain berusaha melihat daftar lewat URL. | Hanya laporan kelas yang ditugaskan; murid kelas lain tidak tampil. | D | | |
| AR-04 | G konfirmasi tanpa catatan, lalu isi catatan dan putuskan. | Tanpa catatan ditolak; dengan catatan status berubah dan catatan tampil ke wali. | D+M | | |
| AR-05 | W kirim laporan, matikan koneksi tepat setelah menekan kirim, lalu tekan "Kirim ulang laporan". | Permintaan ulang memakai ID permintaan yang sama; tidak ada laporan ganda. | D+M | | Diuji browser dengan respons hilang tiruan, bukan akun nyata. |
| AR-06 | G membuka laporan yang tidak cocok dengan tepat satu sesi absensi. | Pesan 55000 tampil sebagai tindak lanjut yang jelas; status absensi tidak berubah dan tidak ada sukses palsu; G dapat kembali ke daftar. | D+M | | Butuh sesi absensi sintetis; diuji browser dengan API tiruan. |
| AR-07 | G memutuskan saat laporan sudah diubah wali di waktu yang sama (konflik revisi 40001). | Pesan meminta muat ulang; setelah muat ulang keputusan dapat dikonfirmasi dengan data terbaru. | D+M | | Diuji browser dengan API tiruan. |
| AR-08 | S atau akun menunggu membuka `/laporan-ketidakhadiran` lewat URL. | Ditolak "Halaman ini tersedia untuk wali terverifikasi dan guru kelas."; daftar laporan dan roster tidak diminta; tautan Laporan ketidakhadiran tidak tampil. | D+M | | Diuji browser dengan API tiruan (desktop + ponsel). |
| AR-09 | Wali dengan 26 laporan membuka `/laporan-ketidakhadiran`, tekan "Berikutnya", lalu "Sebelumnya". | Halaman 1 menampilkan 25 laporan dan indikator "Daftar terpotong; muat halaman berikutnya."; halaman 2 menampilkan laporan ke-26 tanpa indikator; penanda "Halaman N" berubah. | D+M | | Diuji browser dengan API tiruan (2/2, desktop + ponsel, 7,2 dtk, port 5191). |
| MK-01 | G menerbitkan materi lalu mengarsipkannya lewat dialog konfirmasi; S membuka materi terbit. | Arsip baru berubah setelah "Ya, lanjutkan"; S melihat materi terbit tanpa tombol tulis/arsip. | D+M | | Diuji browser dengan API tiruan (desktop + ponsel). |
| MJ-01 | K menyetujui modul ajar berstatus Diajukan dengan catatan, lalu mengarsipkannya. | Status berpindah Disetujui → Diarsipkan setelah konfirmasi; catatan pemeriksaan terkirim bersama persetujuan dan tampil di detail modul. | D+M | | Diuji browser dengan API tiruan (desktop + ponsel); tampilan pihak guru belum diuji pada alur ini. |
| KM-01 | G kirim pesan di `/komunikasi` saat koneksi terputus lalu coba lagi. | Pesan tidak ganda; konfirmasi tampil setelah respons diterima; halaman berikutnya memakai sentinel 25 baris. | D+M | | Diuji browser dengan API tiruan. |
| DOC-01 | G unggah draf dokumen (kategori, judul ≤160 karakter, berkas PDF/JPEG/PNG/DOCX/XLSX ≤10 MB), lalu klik "Ajukan persetujuan". | Draf hanya tampil di "Dokumen Anda"; setelah diajukan status menjadi "Menunggu persetujuan". | D+M | | Diuji browser dengan API tiruan; `school_documents` belum hosted. |
| DOC-02 | K buka "Dokumen masuk", klik "Kembalikan dengan catatan" dengan catatan kosong atau <5 karakter. | Aksi ditolak dengan pesan "Catatan revisi … wajib diisi minimal 5 karakter"; status tidak berubah dan tidak ada permintaan tulis terkirim. | D+M | | Diuji browser dengan API tiruan. |
| DOC-03 | K mengembalikan dokumen dengan catatan ≥5 karakter. | Status "Perlu revisi"; catatan tampil sebagai "Catatan pemeriksa" bagi G; G dapat mengunggah versi baru lalu mengajukan ulang. | D+M | | |
| DOC-04 | K menyetujui lalu mengarsipkan dokumen yang diajukan. | Status "Disetujui" → "Diarsipkan"; klik "Arsipkan dokumen" memunculkan dialog konfirmasi (fokus di tombol konfirmasi, Escape membatalkan), dan hanya "Ya, arsipkan" yang mengirim perubahan; riwayat versi & tinjauan mencatat setiap perpindahan beserta catatannya. | D+M | | Diuji browser dengan API tiruan, termasuk fokus dialog, jebakan Tab, dan Escape. |
| DOC-05 | A membuka `/dokumen`. | Hanya metadata teknis; tidak ada tombol unggah/setujui/kembalikan/arsip; teks menjelaskan persetujuan milik kepala sekolah. | D+M | | |
| DOC-06 | S atau W membuka `/dokumen` lewat URL; G mencoba membuka dokumen guru lain. | Halaman menolak dengan "Halaman ini tersedia untuk guru, kepala sekolah, dan administrator."; daftar dokumen guru lain tidak tampil; penegakan tetap dari RLS. | D+M | | Penolakan S, W, dan akun menunggu diuji browser dengan API tiruan tanpa pembacaan `school_documents` (6/6, desktop + ponsel); G lintas guru tetap mengandalkan RLS. |
| DOC-07 | Guru dengan 26 dokumen membuka `/dokumen`, tekan "Berikutnya", lalu "Sebelumnya". | Halaman 1 menampilkan 25 dokumen dan indikator "Daftar terpotong; muat halaman berikutnya."; halaman 2 menampilkan dokumen ke-26 tanpa indikator; judul dokumen tidak terduplikasi. | D+M | | Diuji browser dengan API tiruan (2/2, desktop + ponsel, 11,4 dtk bersama absensi guru, port 5191). |
| TA-01 | G klik "Absen masuk" lalu "Absen keluar" pada hari berjalan. | Waktu tampil di "Absensi hari ini" pada zona Asia/Jakarta; riwayat bertambah satu baris untuk tanggal tersebut. | D+M | | Diuji browser dengan API tiruan; `teacher_attendance` belum hosted. |
| TA-02 | Putuskan koneksi tepat saat "Absen masuk", lalu klik "Kirim ulang absen masuk". | Tombol berubah jadi kirim ulang; permintaan memakai ID permintaan yang sama sehingga tidak ada baris ganda setelah berhasil. | D+M | | Diuji browser dengan respons pertama digagalkan. |
| TA-03 | G mengajukan koreksi dengan alasan <5 karakter, lalu dengan alasan valid. | Alasan pendek ditolak "minimal 5 karakter"; koreksi valid berstatus "Menunggu persetujuan" dan muncul di "Koreksi saya". | D+M | | |
| TA-04 | K menyetujui satu koreksi dan menolak koreksi lain dengan catatan. | Status menjadi "Disetujui"/"Ditolak"; catatan kepala sekolah tampil; saringan status koreksi memfilter daftar. | D+M | | |
| TA-05 | A membuka `/absensi-guru`. | Riwayat absensi guru dan koreksi terbaca tanpa tombol aksi; teks menjelaskan administrator tanpa tindakan perubahan. | D+M | | |
| TA-06 | S atau W membuka `/absensi-guru` lewat URL. | Ditolak dengan "Halaman ini tersedia untuk guru, kepala sekolah, dan administrator."; tidak ada baris absensi tampil. | D+M | | Penolakan S, W, dan akun menunggu diuji browser dengan API tiruan tanpa pembacaan `teacher_attendance` (6/6, desktop + ponsel). |
| TA-07 | Guru dengan 26 baris riwayat membuka `/absensi-guru`, tekan "Berikutnya", lalu "Sebelumnya" pada riwayat absensi. | Halaman 1 menampilkan 25 baris dan indikator "Daftar terpotong; muat halaman berikutnya."; halaman 2 menampilkan baris ke-26 tanpa indikator; penanda "Halaman N" berubah. | D+M | | Diuji browser dengan API tiruan (2/2, desktop + ponsel, 11,4 dtk bersama dokumen, port 5191). |
| KM-02 | K, A, S, atau akun menunggu membuka `/komunikasi` lewat URL. | Ditolak "Fitur komunikasi hanya tersedia untuk guru dengan penugasan aktif dan wali terverifikasi."; daftar penerima/pesan tidak dimuat; tautan Komunikasi tidak tampil. | D+M | | Penolakan keempat peran diuji browser dengan API tiruan (8/8, desktop + ponsel). |
| KM-03 | Guru dengan 26 pesan membuka `/komunikasi`, tekan "Berikutnya", lalu "Sebelumnya". | Halaman 1 menampilkan 25 pesan dan indikator "Daftar terpotong; muat halaman berikutnya."; halaman 2 menampilkan pesan ke-26 tanpa indikator; tidak ada baris terlewat di batas halaman. | D+M | | Diuji browser dengan API tiruan (2/2, desktop + ponsel, 11,7 dtk, port 5191). |
| R-01 | A membuka `/sekolah` dengan lebih dari 1.000 referensi master. | Muncul pemberitahuan "Sebagian daftar referensi dipotong…" alih-alih galat. | D | | Butuh data seed besar; jangan memakai data siswa nyata. |

## 10. Setelah UAT

1. Kumpulkan semua baris `G` ke bagian "Permintaan Lintas AI" pada [AI_COORDINATION.md](AI_COORDINATION.md) beserta modul dan langkah.
2. Jangan memperbaiki kode saat sesi UAT; perbaikan dilakukan pemilik modul.
3. Jangan menulis "sudah diuji dengan akun sekolah" di README/PROJECT_STATUS sebelum seluruh skenario kritis `L`.
4. Simpan berkas terisi di luar repo atau di artefak yang disetujui pemilik; jangan mengandung data pribadi.