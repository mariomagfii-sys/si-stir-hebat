**DOKUMEN KEBUTUHAN PRODUK**

**SI STIR  
HEBAT**

Sistem Informasi Supervisi Terintegrasi,  
Ruang Harmonis Edukatif,  
Bersama wujudkan Anak Indonesia Hebat

**PRODUCT REQUIREMENTS DOCUMENT**

Versi 1.0 \| 30 Oktober 2026

**SDN 03 WONOSARI  
NPSN 40500185  
Jln Lingkar, Makmur, Wonosari, Kabupaten Boalemo, Gorontalo**

# KONTROL DOKUMEN

| **Informasi**      | **Keterangan**                                                                          |
|--------------------|-----------------------------------------------------------------------------------------|
| Nama produk        | SI STIR HEBAT                                                                           |
| Nama dokumen       | Product Requirements Document (PRD)                                                     |
| Versi              | 1.0                                                                                     |
| Tanggal penyusunan | 30 Oktober 2026                                                                         |
| Instansi           | SDN 03 Wonosari                                                                         |
| NPSN               | 40500185                                                                                |
| Platform           | Responsive Web Application                                                              |
| Status             | Kebutuhan utama telah divalidasi; detail operasional tertentu masih perlu dikonfirmasi. |

## Tujuan Dokumen

Dokumen ini menjadi acuan kebutuhan produk dan ruang lingkup pengembangan SI STIR HEBAT. Dokumen ditujukan bagi pihak sekolah, perancang UI/UX, pengembang frontend dan backend, pengelola database, serta pihak yang terlibat dalam pengujian dan operasional sistem.

## Catatan Status

Seluruh 16 tahap validasi kebutuhan utama telah diselesaikan. Hal tersebut tidak berarti seluruh detail operasional telah final. Beberapa keputusan seperti instrumen supervisi, aturan kehadiran, kebijakan retensi, dan konfigurasi integrasi tetap memerlukan pengesahan atau penetapan sekolah sebelum fitur terkait digunakan secara resmi.

# DAFTAR ISI

- 1\. Ringkasan Eksekutif

- 2\. Ruang Lingkup Produk

- 3\. Target Pengguna dan Hak Akses

- 4\. Master Data Sekolah

- 5\. Persyaratan Fungsional

- 6\. Autentikasi dan Keamanan

- 7\. Backup, Penyimpanan, dan Keandalan

- 8\. Persyaratan Nonfungsional

- 9\. Persyaratan UI/UX

- 10\. Arsitektur Teknis

- 11\. Privasi dan Tata Kelola Data

- 12\. Integrasi Eksternal

- 13\. Strategi Rilis

- 14\. Pengujian dan Kriteria Penerimaan

- 15\. Metrik Keberhasilan

- 16\. Roadmap Pengembangan

- 17\. Hal yang Masih Perlu Ditetapkan

- 18\. Definisi Produk Akhir

# 1. RINGKASAN EKSEKUTIF

## 1.1 Gambaran Umum

SI STIR HEBAT merupakan platform sistem informasi pendidikan berbasis web yang dikembangkan untuk mendukung pengelolaan administrasi sekolah, supervisi akademik, pemantauan perkembangan peserta didik, kegiatan pembelajaran, dan komunikasi antara pihak sekolah dengan orang tua.

Sistem mengintegrasikan lima kelompok pengguna utama, yaitu admin sekolah, kepala sekolah, guru, siswa, dan orang tua/wali. Platform dirancang sebagai pusat pengelolaan informasi sekolah yang terstruktur, aman, responsif, dan dapat digunakan pada kondisi koneksi internet terbatas.

## 1.2 Latar Belakang

Kegiatan pendidikan melibatkan proses yang saling berkaitan, seperti pengelolaan data warga sekolah, supervisi akademik, administrasi pembelajaran, kehadiran, pemantauan kebiasaan positif, penilaian, distribusi materi dan tugas, komunikasi keluarga-sekolah, serta penyusunan laporan.

Apabila proses tersebut dikelola melalui media yang terpisah, sekolah dapat mengalami kesulitan dalam mengakses informasi, memantau perkembangan, mendokumentasikan kegiatan, dan menyusun laporan. SI STIR HEBAT bertujuan mengintegrasikan proses-proses tersebut dalam satu sistem.

## 1.3 Visi Produk

Membangun ekosistem digital sekolah yang terintegrasi untuk mendukung supervisi berkualitas, pembelajaran yang terorganisasi, perkembangan karakter peserta didik, serta kolaborasi antara sekolah dan keluarga.

## 1.4 Tujuan Produk

1.  Mendigitalisasi proses supervisi kepala sekolah terhadap seluruh tenaga pendidik.

2.  Mengelola administrasi pembelajaran guru secara terpusat.

3.  Memantau tujuh kebiasaan Anak Indonesia Hebat melalui kolaborasi orang tua dan guru.

4.  Mengintegrasikan pencatatan kehadiran guru dan siswa.

5.  Memfasilitasi komunikasi antara orang tua dan pihak sekolah.

6.  Menyediakan pengelolaan nilai dan perkembangan akademik siswa.

7.  Menyediakan ruang pembelajaran digital untuk siswa.

8.  Menghasilkan laporan sekolah secara otomatis dan terstruktur.

9.  Meningkatkan keamanan, keterlacakan, dan keteraturan pengelolaan data sekolah.

# 2. RUANG LINGKUP PRODUK

## 2.1 Modul dalam Cakupan

| **No.** | **Modul**                        | **Deskripsi**                                     |
|---------|----------------------------------|---------------------------------------------------|
| 1       | Dashboard                        | Ringkasan informasi berdasarkan peran pengguna.   |
| 2       | Manajemen Pengguna               | Pengelolaan akun, peran, dan hak akses.           |
| 3       | Master Data Sekolah              | Pengelolaan kelas, siswa, guru, dan tahun ajaran. |
| 4       | Supervisi Akademik               | Pelaksanaan supervisi dalam empat tahap.          |
| 5       | Administrasi Guru                | Pengumpulan dan verifikasi dokumen pembelajaran.  |
| 6       | Kehadiran                        | Absensi guru dan siswa.                           |
| 7       | 7 Kebiasaan Anak Indonesia Hebat | Pemantauan kebiasaan positif siswa.               |
| 8       | Ruang Orang Tua                  | Komunikasi dan pemantauan perkembangan anak.      |
| 9       | Akademik                         | Pengelolaan penilaian dan hasil belajar.          |
| 10      | Ruang Belajar Siswa              | Jadwal, materi, tugas, dan pengumpulan tugas.     |
| 11      | Notifikasi                       | Pemberitahuan dan pengingat dalam aplikasi.       |
| 12      | Laporan                          | Rekapitulasi dan ekspor data sekolah.             |
| 13      | Integrasi Eksternal              | Excel, Google Drive, Google Sheets, dan WhatsApp. |
| 14      | Keamanan dan Audit               | Pengendalian akses dan pencatatan aktivitas.      |
| 15      | Backup dan Pemulihan             | Perlindungan data dan pemulihan sistem.           |

## 2.2 Di Luar Cakupan Versi Awal

- Aplikasi native Android dan iOS.

- Integrasi otomatis WhatsApp Business API.

- Penggunaan lintas banyak sekolah.

- Sistem pembayaran sekolah.

- Integrasi dengan seluruh platform pendidikan eksternal.

- Penggunaan AI untuk memberikan diagnosis atau penilaian otomatis terhadap siswa.

Fitur di luar cakupan dapat dipertimbangkan pada fase lanjutan setelah kebutuhan utama sekolah terpenuhi.

# 3. TARGET PENGGUNA DAN HAK AKSES

## 3.1 Peran Pengguna

### A. Admin Sekolah

Admin bertanggung jawab terhadap pengelolaan operasional dan konfigurasi sistem.

- Mengelola seluruh akun pengguna, membuat dan menonaktifkan akun.

- Mengelola kelas, data siswa, data guru, tahun ajaran, semester, dan penugasan guru.

- Mengimpor dan mengekspor data serta memantau seluruh modul sekolah.

- Mengelola periode pengumpulan dokumen dan konfigurasi notifikasi.

- Mengakses laporan sekolah dan pengaturan sistem sesuai kewenangan.

### B. Kepala Sekolah

Kepala sekolah memiliki akses manajemen sekolah dan supervisi sesuai kewenangannya.

- Mengakses dashboard dan laporan sekolah.

- Mengelola akun serta data master bersama admin.

- Menyusun instrumen dan jadwal supervisi serta melaksanakan empat tahap supervisi.

- Memberikan penilaian, catatan, rekomendasi, dan tindak lanjut.

- Memverifikasi administrasi guru dan memantau kehadiran serta perkembangan siswa.

- Mengelola pengumuman dan memantau aktivitas sekolah.

Admin dan kepala sekolah menggunakan akun individual yang terpisah; kredensial tidak boleh digunakan bersama.

### C. Guru

- Mengelola profil pribadi dan melakukan absensi mandiri.

- Mencatat kehadiran siswa serta menerima dan memverifikasi laporan ketidakhadiran orang tua.

- Mengunggah administrasi pembelajaran dan melihat hasil supervisi setelah dipublikasikan.

- Menginput nilai sesuai kelas dan mata pelajaran yang ditugaskan.

- Mengelola materi, tugas, umpan balik, dan komunikasi dengan orang tua.

- Memantau kebiasaan siswa serta mengakses laporan sesuai tanggung jawab.

### D. Siswa

- Melihat profil pribadi dan mengajukan perubahan data.

- Melihat jadwal, materi, tugas, pengumuman, dan notifikasi.

- Mengirim jawaban tugas dan melihat status pengumpulan.

- Melihat hasil penilaian yang telah dipublikasikan.

### E. Orang Tua/Wali

- Melihat data anak yang telah terhubung dan diverifikasi.

- Melaporkan ketidakhadiran anak dan memantau status kehadiran.

- Mengisi dan melihat rekap tujuh kebiasaan.

- Melihat nilai dan perkembangan anak yang telah dipublikasikan atau dibagikan.

- Menghubungi wali kelas, guru mata pelajaran, dan kepala sekolah.

- Menerima pengumuman dan mengirim lampiran foto atau dokumen.

## 3.2 Prinsip Hak Akses

10. Setiap akun memiliki identitas unik.

11. Hak akses ditentukan oleh peran dan penugasan.

12. Guru hanya mengelola data sesuai kelas dan mata pelajaran yang menjadi tanggung jawabnya.

13. Siswa hanya dapat melihat data miliknya.

14. Orang tua hanya dapat mengakses data anak yang terhubung dan telah diverifikasi.

15. Admin dan kepala sekolah memiliki akses manajemen penuh sesuai kewenangan.

16. Operator teknis memiliki izin khusus untuk pemeliharaan dan pemulihan sistem.

17. Seluruh aktivitas penting dicatat dalam audit log.

# 4. MASTER DATA SEKOLAH

## 4.1 Identitas Sekolah

| **Informasi**  | **Data**                       |
|----------------|--------------------------------|
| Nama sekolah   | SDN 03 Wonosari                |
| NPSN           | 40500185                       |
| Alamat         | Jln Lingkar, Makmur, Wonosari  |
| Kabupaten      | Boalemo                        |
| Provinsi       | Gorontalo                      |
| Kepala sekolah | Khoyum Supardi, S.Pd.SD, M.Pd. |

## 4.2 Data Guru Awal

| **Kelas/Peran** | **Nama**                        |
|-----------------|---------------------------------|
| Kelas 1         | Darmiati, S.Pd.                 |
| Kelas 2         | Fadilatul Jannah Samsuru, S.Pd. |
| Kelas 3         | Trin Sugiarti, S.Pd.            |
| Kelas 4         | Waode Suriani, S.Pd.            |
| Kelas 5         | Ima Kusmawati, S.Pd.            |
| Kelas 6         | Pipit Nanda Suprapto, S.Pd.     |
| PJOK            | Data penugasan perlu dilengkapi |
| PAI             | Data penugasan perlu dilengkapi |

Data guru di atas merupakan data awal dan dapat diperbarui melalui master data oleh pihak yang berwenang.

## 4.3 Pengelolaan Kelas

- Mendukung kelas 1 sampai kelas 6.

- Pengelolaan siswa berdasarkan tahun ajaran.

- Penugasan wali kelas dan guru mata pelajaran.

- Riwayat perpindahan kelas dan perubahan tahun ajaran.

- Pengelolaan semester.

## 4.4 Hubungan Orang Tua dan Siswa

- Satu siswa dapat memiliki lebih dari satu wali.

- Satu wali dapat terhubung dengan lebih dari satu siswa.

- Hubungan harus diverifikasi oleh sekolah.

- Akses data mengikuti hubungan yang telah diverifikasi.

- Riwayat perubahan hubungan harus tersimpan.

## 4.5 Import Data

Admin dan kepala sekolah dapat memasukkan data melalui formulir manual maupun import Excel. Proses import harus menyediakan template, validasi kolom wajib, deteksi duplikasi, pratinjau, konfirmasi penyimpanan, serta laporan data berhasil dan gagal diimpor.

# 5. PERSYARATAN FUNGSIONAL

## 5.1 Dashboard

| **Peran**      | **Informasi utama**                                                                                           |
|----------------|---------------------------------------------------------------------------------------------------------------|
| Admin          | Jumlah siswa, guru, kelas, status akun, kehadiran, administrasi, supervisi, aktivitas, dan notifikasi sistem. |
| Kepala sekolah | Ringkasan sekolah, progres supervisi, administrasi guru, kehadiran, akademik, kebiasaan, dan kegiatan.        |
| Guru           | Jadwal mengajar, absensi, jumlah siswa, tugas, administrasi, supervisi, dan notifikasi.                       |
| Siswa          | Jadwal hari ini, materi, tugas aktif, status pengumpulan, pengumuman, dan hasil belajar terpublikasi.         |
| Orang tua      | Ringkasan anak, kehadiran, kebiasaan, akademik, pengumuman, dan pesan guru.                                   |

## 5.2 Modul Supervisi Akademik

### Tujuan dan Sasaran

Modul ini mendigitalisasi supervisi kepala sekolah terhadap guru kelas 1–6, guru PJOK, guru PAI, dan tenaga pendidik lain yang ditetapkan sekolah.

### Tahapan Supervisi

| **Tahap**           | **Fitur utama**                                                                                                                 |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------|
| 1\. Pra-Observasi   | Penjadwalan, pemilihan guru, identitas supervisi, diskusi awal, persiapan pembelajaran, fokus observasi, dan penyimpanan draft. |
| 2\. Observasi       | Indikator penilaian, pengelompokan indikator, skor, catatan observasi, progres, autosave, dan validasi indikator belum dinilai. |
| 3\. Pasca-Observasi | Refleksi guru, diskusi hasil, penilaian akhir, catatan kepala sekolah, rekomendasi, dan kesepakatan tindak lanjut.              |
| 4\. Tindak Lanjut   | Rekomendasi, rencana perbaikan, target waktu, status pelaksanaan, bukti tindak lanjut, dan evaluasi lanjutan.                   |

| **Skor** | **Makna**                 |
|----------|---------------------------|
| 1        | Perlu pembinaan intensif  |
| 2        | Mulai berkembang          |
| 3        | Berkembang sesuai harapan |
| 4        | Sangat baik               |

Skala dan deskripsi final harus ditinjau serta disetujui sekolah sebelum digunakan secara resmi.

### Aturan Bisnis Supervisi

18. Satu sesi supervisi memiliki satu guru sasaran dan empat tahap yang saling terhubung.

19. Draft tidak terlihat oleh guru.

20. Hasil hanya dapat dilihat guru setelah dipublikasikan.

21. Hasil supervisi disimpan sebagai riwayat.

22. Perubahan penting dicatat dalam audit log.

23. Indikator dapat dikembangkan sesuai kebutuhan sekolah.

24. Tahap tidak dapat diselesaikan jika persyaratan wajib belum terpenuhi.

## 5.3 Modul Administrasi Guru

Modul mengelola pengumpulan dan verifikasi dokumen administrasi pembelajaran. Daftar dokumen berikut merupakan rancangan awal dan perlu disahkan sekolah.

| **Kategori** | **Dokumen awal**                                |
|--------------|-------------------------------------------------|
| Perencanaan  | Prota, Promes                                   |
| Kurikulum    | CP, ATP                                         |
| Pembelajaran | Modul Ajar, bahan ajar                          |
| Penilaian    | KKTP, instrumen asesmen, analisis hasil belajar |
| Pelaksanaan  | Jurnal mengajar, daftar hadir                   |
| Dokumentasi  | Dokumentasi pembelajaran                        |
| Evaluasi     | Refleksi pembelajaran, laporan hasil belajar    |

Format yang didukung: PDF, DOCX, XLSX, PPTX, JPG, dan PNG.

| **Status**   | **Keterangan**              |
|--------------|-----------------------------|
| Draft        | Dokumen belum dikirim.      |
| Dikirim      | Dokumen telah diserahkan.   |
| Disetujui    | Dokumen telah diverifikasi. |
| Perlu Revisi | Dokumen perlu diperbaiki.   |

- Upload dan preview dokumen.

- Kategori dan periode pengumpulan fleksibel.

- Deadline dapat diatur untuk setiap dokumen.

- Verifikasi dapat dilakukan admin atau kepala sekolah secara independen.

- Catatan pemeriksa, riwayat revisi, dan riwayat unggahan.

- Notifikasi perubahan status.

## 5.4 Modul Kehadiran

### A. Absensi Guru

- Guru melakukan absensi melalui akun masing-masing.

- Mendukung check-in dan check-out apabila diberlakukan sekolah.

- Mencatat tanggal, waktu, status, dan riwayat absensi.

- Menyediakan rekap berdasarkan periode.

- Koreksi dilakukan melalui persetujuan pihak berwenang.

Metode tambahan seperti lokasi atau foto kehadiran perlu ditetapkan sekolah sebelum diaktifkan.

### B. Absensi Siswa

- Guru mencatat kehadiran berdasarkan kelas dan tanggal.

- Mendukung pengisian massal, koreksi, riwayat, dan rekap harian maupun periodik.

- Status awal: Hadir, Sakit, Izin, Alpa, serta status khusus sesuai kebijakan sekolah.

### C. Laporan Orang Tua

25. Orang tua mengirim laporan ketidakhadiran.

26. Guru menerima dan memeriksa laporan.

27. Guru mengonfirmasi atau meminta perbaikan.

28. Status kehadiran diperbarui berdasarkan verifikasi.

Laporan orang tua yang belum dikonfirmasi tidak otomatis menjadi catatan kehadiran final.

### D. Mode Offline

- Pencatatan absensi tertentu dapat dilakukan secara offline.

- Data sementara disimpan secara lokal dan ditandai belum tersinkronisasi.

- Data dikirim saat koneksi kembali tersedia.

- Sistem mendeteksi duplikasi dan menangani konflik data.

- Perubahan penting tetap memerlukan otorisasi server.

## 5.5 Modul 7 Kebiasaan Anak Indonesia Hebat

| **No.** | **Kebiasaan**           |
|---------|-------------------------|
| 1       | Bangun pagi             |
| 2       | Beribadah               |
| 3       | Berolahraga             |
| 4       | Makan sehat dan bergizi |
| 5       | Gemar belajar           |
| 6       | Bermasyarakat           |
| 7       | Tidur cepat             |

Orang tua mengisi checklist berdasarkan pengamatan aktivitas anak di rumah. Guru dan orang tua memantau perkembangan sesuai kewenangan.

- Checklist harian dan catatan orang tua.

- Pemantauan guru dan rekap mingguan.

- Grafik perkembangan, bintang apresiasi, streak, dan achievement.

- Data yang belum diisi harus dibedakan dari kebiasaan yang tidak dilakukan.

- Motivasi bersifat positif; sistem tidak memberikan hukuman digital atau mempermalukan maupun membandingkan siswa.

## 5.6 Modul Ruang Orang Tua

- Pesan langsung dalam aplikasi.

- Kontak dengan wali kelas, guru mata pelajaran, dan kepala sekolah.

- Pengumuman kategori sekolah, kelas, kegiatan, akademik, dan mendesak.

- Akses kehadiran, kebiasaan, penilaian, dokumen yang diizinkan, serta catatan perkembangan yang dibagikan.

- Lampiran foto dan dokumen dengan kontrol akses.

## 5.7 Modul Akademik dan Penilaian

Guru mata pelajaran menginput nilai sesuai penugasan. Wali kelas dapat mengakses dan mengelola rekap kelas sesuai kewenangan. Admin dan kepala sekolah memiliki akses pengawasan.

- Jenis penilaian: formatif, sumatif, proyek, praktik/keterampilan, serta sikap dan karakter.

- Mencakup seluruh mata pelajaran sesuai kurikulum dan penugasan, termasuk PJOK dan PAI.

- Nilai hanya dapat dilihat siswa dan orang tua setelah dipublikasikan.

- Mendukung input, perubahan dengan riwayat, rekap, grafik perkembangan, catatan guru, dan laporan akademik.

## 5.8 Modul Ruang Belajar Siswa

### Jadwal

Admin mengatur jadwal utama. Guru dapat mengusulkan perubahan. Jadwal ditampilkan berdasarkan kelas dan hari.

### Materi

Guru dapat mengunggah, mengelompokkan, memperbarui, dan memberikan deskripsi materi.

### Tugas

- Guru membuat tugas, instruksi, tenggat, dan lampiran.

- Siswa melihat tugas dan mengirimkan jawaban atau lampiran.

- Guru memeriksa hasil dan memberikan umpan balik.

- Sistem menampilkan status pengumpulan.

Ruang mata pelajaran mencakup mata pelajaran umum, PJOK, dan PAI.

## 5.9 Modul Notifikasi

Saluran utama notifikasi adalah pusat notifikasi di dalam aplikasi.

- Pemicu: supervisi, administrasi guru, kehadiran, tugas, pengumuman, pesan, dan tujuh kebiasaan.

- Mendukung notifikasi otomatis, pengingat manual, status dibaca/belum dibaca, deadline, dan prioritas.

- Pengguna dapat mengatur preferensi sesuai kebijakan notifikasi wajib dari admin.

- Notifikasi mendesak memperoleh prioritas tinggi di dalam aplikasi.

## 5.10 Modul Laporan

Jenis laporan meliputi kehadiran guru dan siswa, supervisi dan tindak lanjut, administrasi guru, akademik, tujuh kebiasaan, kegiatan sekolah, serta komunikasi dan laporan orang tua.

Format ekspor: XLSX, PDF, dan CSV. Filter meliputi tanggal, periode, kelas, guru, mata pelajaran, tahun ajaran, dan semester.

Hak akses laporan mengikuti peran dan tanggung jawab. Setiap ekspor memuat identitas sekolah, periode, tanggal pembuatan, pembuat laporan, dan cakupan data.

## 5.11 Integrasi Eksternal

| **Layanan**            | **Kebutuhan**                                  | **Tahap**      |
|------------------------|------------------------------------------------|----------------|
| Excel                  | Impor dan ekspor data; bukan database utama.   | Fase awal      |
| Google Drive           | Penyimpanan dan pengelolaan dokumen pendukung. | Fase integrasi |
| Google Sheets          | Pengolahan dan pertukaran data spreadsheet.    | Fase integrasi |
| WhatsApp Click-to-Chat | Tombol untuk menghubungi pihak sekolah.        | Fase awal      |
| WhatsApp Business API  | Integrasi pesan/notifikasi otomatis.           | Fase lanjutan  |

Integrasi eksternal harus menggunakan autentikasi resmi dan izin yang sesuai. Sinkronisasi perlu mencegah duplikasi dan perubahan data tanpa kontrol.

# 6. AUTENTIKASI DAN KEAMANAN

## 6.1 Login dan Identitas

Sistem menggunakan login berbasis identitas dan kata sandi.

- NISN digunakan sebagai identitas siswa.

- NIP digunakan untuk guru yang memilikinya.

- Orang tua dan pengguna tanpa NISN/NIP menggunakan ID akun internal yang unik.

- Tidak semua pengguna diwajibkan memiliki NISN atau NIP.

## 6.2 Pembuatan dan Pemulihan Akun

- Akun dibuat oleh admin; pendaftaran mandiri tidak tersedia.

- Setiap pengguna memiliki akun individual.

- Admin dapat mengaktifkan atau menonaktifkan akun.

- Pemulihan kata sandi dilakukan melalui admin sesuai prosedur verifikasi identitas.

## 6.3 Manajemen Sesi

- Login dan logout.

- Masa berlaku sesi.

- Logout karena tidak aktif.

- Pengelolaan perangkat.

- Pencabutan sesi oleh admin atau pihak berwenang.

## 6.4 Audit Log

Audit log mencatat aktivitas login/logout, pembuatan akun, perubahan data, perubahan nilai, unggah dan verifikasi dokumen, aktivitas supervisi, perubahan hak akses, restore, serta aktivitas administratif penting.

## 6.5 Persyaratan Keamanan Teknis

- Role-Based Access Control (RBAC) dan Supabase Row Level Security (RLS).

- Validasi input pada sisi server.

- Koneksi terenkripsi dan pengelolaan secrets di server.

- Penyimpanan file privat serta signed URL untuk akses terbatas.

- Proteksi API dan audit trail.

- Supabase Service Role Key tidak boleh ditempatkan pada frontend atau variabel lingkungan yang diekspos ke browser.

# 7. BACKUP, PENYIMPANAN, DAN KEANDALAN

| **Aspek**        | **Keputusan tervalidasi**            | **Ketentuan**                                                                         |
|------------------|--------------------------------------|---------------------------------------------------------------------------------------|
| Frekuensi backup | Harian dan mingguan                  | Backup database dan file dikelola sebagai proses yang saling melengkapi.              |
| Retensi          | Jangka panjang                       | Riwayat tahun ajaran sebelumnya dipertahankan sesuai kebijakan dan ketentuan.         |
| Penyimpanan      | Supabase Storage dan cloud eksternal | Supabase sebagai penyimpanan operasional; cloud eksternal sebagai pendukung/cadangan. |
| Kapasitas        | Fleksibel                            | Kapasitas dipantau dan ditingkatkan sesuai kebutuhan.                                 |
| Ketersediaan     | Normal                               | Pemeliharaan dijadwalkan di luar jam kegiatan sekolah.                                |
| Hak restore      | Operator teknis khusus               | Pemulihan hanya dilakukan operator yang diberi wewenang.                              |

- Backup perlu diuji berkala melalui simulasi pemulihan.

- Restore harus memiliki alasan, persetujuan sesuai prosedur, dokumentasi hasil, dan pemeriksaan integritas.

- Setiap aktivitas restore dicatat dalam audit log.

- Operator teknis menggunakan akun individual dengan izin terbatas.

# 8. PERSYARATAN NONFUNGSIONAL

| **Aspek**     | **Persyaratan**                                                                                                  |
|---------------|------------------------------------------------------------------------------------------------------------------|
| Perangkat     | Smartphone Android/iPhone, tablet, laptop, dan komputer sekolah.                                                 |
| Koneksi       | Mendukung koneksi lambat dan mode offline untuk fitur tertentu.                                                  |
| Browser       | Browser modern berbasis standar web, termasuk Chrome, Edge, Firefox, dan Safari.                                 |
| Performa      | Dioptimalkan untuk perangkat spesifikasi rendah dan koneksi lambat.                                              |
| Skalabilitas  | Mendukung pertumbuhan pengguna dalam satu sekolah.                                                               |
| Responsif     | Mobile-first; target 360–428 px untuk ponsel, sekitar 768 px untuk tablet, dan 1280 px atau lebih untuk desktop. |
| Aksesibilitas | Kontras memadai, label jelas, navigasi keyboard, tombol mudah disentuh, dan pesan kesalahan mudah dipahami.      |

## 8.1 Target Performa

Halaman inti diupayakan memiliki waktu pemuatan awal sekitar tiga detik atau kurang pada koneksi yang memadai. Target akhir harus diuji menggunakan perangkat dan jaringan yang mewakili kondisi sekolah.

## 8.2 Persyaratan Offline

- Data sementara disimpan secara aman.

- Status sinkronisasi ditampilkan kepada pengguna.

- Terdapat antrean sinkronisasi.

- Duplikasi dan konflik perubahan ditangani.

- Validasi dan otorisasi server tetap diterapkan ketika data disinkronkan.

# 9. PERSYARATAN UI/UX

## 9.1 Prinsip Desain

29. Mobile-first dan responsif.

30. Navigasi sederhana dan konsisten.

31. Tampilan profesional sekaligus ramah.

32. Bahasa Indonesia yang jelas dan mudah dipahami.

33. Formulir ringkas dengan status sistem yang terlihat.

34. Mengutamakan keterbacaan dan aksesibilitas.

## 9.2 Karakter Visual

- Profesional untuk admin dan kepala sekolah.

- Efisien untuk guru.

- Ramah anak untuk siswa.

- Sederhana dan informatif untuk orang tua.

## 9.3 Palet Warna

| **Penggunaan** | **Kode warna** |
|----------------|----------------|
| Primary        | \#4C1D95       |
| Lilac          | \#C4B5FD       |
| Light Lilac    | \#EDE9FE       |
| Light Blue     | \#7DD3FC       |
| Pale Blue      | \#E0F2FE       |
| Pink Accent    | \#F9A8D4       |
| Background     | \#FAF9FF       |
| Main Text      | \#1F1B2E       |
| Muted Text     | \#6B6880       |
| Success        | \#22C55E       |
| Warning        | \#F59E0B       |
| Danger         | \#EF4444       |
| Information    | \#38BDF8       |

## 9.4 Tipografi

- Heading: Plus Jakarta Sans.

- Body: Inter atau Nunito.

- Ruang siswa: Fredoka atau Baloo 2 sebagai aksen.

## 9.5 UX Siswa

- Tombol besar dan mudah disentuh.

- Ikon mudah dikenali.

- Teks singkat dan navigasi sederhana.

- Tampilan tidak terlalu padat dan sesuai kebutuhan pengguna sekolah dasar.

# 10. ARSITEKTUR TEKNIS

## 10.1 Teknologi Utama

| **Lapisan**     | **Teknologi**                        |
|-----------------|--------------------------------------|
| Frontend        | React + Vite                         |
| Bahasa          | TypeScript                           |
| Styling         | Tailwind CSS                         |
| Backend         | Next.js App Router / Route Handlers  |
| Database        | Supabase PostgreSQL                  |
| Authentication  | Supabase Auth                        |
| File Storage    | Supabase Storage dan cloud eksternal |
| Validasi        | Zod                                  |
| Version Control | GitHub                               |
| Deployment      | Vercel                               |
| Spreadsheet     | Excel dan Google Sheets              |

## 10.2 Pendekatan Arsitektur

Sistem menggunakan pendekatan modular monolith dalam satu monorepo. Frontend dan backend dipisahkan sebagai aplikasi, sementara tipe data, validasi, konstanta, dan konfigurasi dapat dibagikan melalui package bersama.

## 10.3 Struktur Repository Awal

> si-stir-hebat/  
> ├── apps/  
> │ ├── web/ \# React + Vite  
> │ │ └── src/  
> │ │ ├── app/  
> │ │ ├── components/  
> │ │ ├── layouts/  
> │ │ ├── pages/  
> │ │ ├── features/  
> │ │ ├── hooks/  
> │ │ ├── contexts/  
> │ │ ├── services/  
> │ │ ├── routes/  
> │ │ ├── types/  
> │ │ └── styles/  
> │ └── api/ \# Next.js API  
> │ └── src/  
> │ ├── app/api/v1/  
> │ ├── lib/  
> │ ├── modules/  
> │ ├── middleware/  
> │ ├── schemas/  
> │ └── types/  
> ├── packages/  
> │ ├── shared-types/  
> │ ├── validation/  
> │ ├── constants/  
> │ └── config/  
> ├── supabase/  
> │ ├── migrations/  
> │ ├── seed.sql  
> │ └── tests/  
> ├── docs/  
> │ ├── architecture/  
> │ ├── database/  
> │ ├── api/  
> │ ├── security/  
> │ └── development/  
> ├── .github/workflows/  
> ├── .env.example  
> ├── .gitignore  
> ├── package.json  
> └── README.md

## 10.4 Arsitektur Database

Supabase PostgreSQL menjadi database operasional utama. Database dirancang secara modular berdasarkan domain Identity & Authentication, School Master Data, Academic Management, Supervision, Teacher Administration, Attendance, Student Habits, Parent Communication, Learning Management, Notifications, Reports, dan Audit Logs.

Detail tabel, foreign key, indeks, trigger, RLS, dan migration ditetapkan dalam Database Blueprint terpisah.

## 10.5 Tanggung Jawab Backend

- Validasi permintaan dan otorisasi.

- Pengelolaan aturan bisnis.

- Integrasi eksternal.

- Operasi data dan pengelolaan file.

- Pelaporan dan proses sinkronisasi.

Express.js atau PHP tidak digunakan sebagai backend utama paralel pada versi awal. Penambahan layanan terpisah hanya dipertimbangkan jika kebutuhan teknis khusus muncul.

# 11. PRIVASI DAN TATA KELOLA DATA

Sistem menangani informasi pribadi guru, siswa, dan orang tua. Pengelolaan data harus mengikuti kebijakan resmi sekolah dan ketentuan perlindungan data yang berlaku.

35. Persetujuan dan pemberitahuan pengelolaan data mengikuti prosedur resmi sekolah.

36. Akses data dibatasi sesuai kewenangan.

37. Data anak tidak dapat diakses wali yang belum terverifikasi.

38. Data akademik tidak ditampilkan sebelum dipublikasikan.

39. File sensitif disimpan secara privat.

40. Aktivitas penting dicatat.

41. Ekspor data mengikuti pembatasan akses.

42. Data tidak digunakan di luar tujuan yang ditetapkan tanpa dasar yang sesuai.

43. Kebijakan retensi dan penghapusan harus terdokumentasi.

44. Penggunaan foto siswa memperhatikan persetujuan dan kebijakan sekolah.

# 12. INTEGRASI EKSTERNAL

| **Integrasi**          | **Tujuan**                                  | **Tahapan**    |
|------------------------|---------------------------------------------|----------------|
| Excel                  | Impor dan ekspor data sekolah.              | Fase awal      |
| Google Drive           | Penyimpanan dan pengelolaan dokumen.        | Fase integrasi |
| Google Sheets          | Pengolahan dan pertukaran data spreadsheet. | Fase integrasi |
| WhatsApp Click-to-Chat | Menghubungi pihak sekolah melalui WhatsApp. | Fase awal      |
| WhatsApp Business API  | Komunikasi dan notifikasi otomatis.         | Fase lanjutan  |

Notifikasi utama tetap berada di dalam aplikasi. WhatsApp Business API belum menjadi saluran notifikasi aktif pada versi awal.

# 13. STRATEGI RILIS

| **Tahap**                              | **Fokus**               | **Aktivitas**                                                                                       |
|----------------------------------------|-------------------------|-----------------------------------------------------------------------------------------------------|
| 1\. Persiapan admin dan kepala sekolah | Konfigurasi awal        | Pembuatan akun, pengaturan role, input data sekolah, guru, siswa, kelas, dan tahun ajaran.          |
| 2\. Uji coba guru                      | Alur kerja guru         | Absensi, administrasi pembelajaran, supervisi, nilai, materi, dan tugas.                            |
| 3\. Uji coba siswa dan orang tua       | Alur keluarga dan siswa | Login, ruang belajar, pengumpulan tugas, laporan absensi, kebiasaan, komunikasi, dan hasil belajar. |
| 4\. Peluncuran sekolah                 | Operasional sekolah     | Aktivasi modul sesuai kesiapan, monitoring, pengumpulan feedback, perbaikan bug, dan evaluasi.      |

# 14. PENGUJIAN DAN KRITERIA PENERIMAAN

| **Area**          | **Kriteria penerimaan utama**                                                                                      |
|-------------------|--------------------------------------------------------------------------------------------------------------------|
| Autentikasi       | Login valid; akses tanpa izin ditolak; pemulihan melalui admin; sesi berakhir sesuai kebijakan.                    |
| Hak akses         | Orang tua hanya melihat anak terhubung; guru terbatas pada penugasan; siswa tidak melihat nilai sebelum publikasi. |
| Supervisi         | Empat tahap dapat dikelola; draft privat; hasil terlihat setelah publikasi; riwayat tersimpan.                     |
| Administrasi guru | Upload, verifikasi, revisi, perubahan status, dan riwayat berjalan benar.                                          |
| Kehadiran         | Absensi guru dan siswa tercatat; laporan orang tua diverifikasi; sinkronisasi offline mencegah duplikasi.          |
| Kebiasaan         | Checklist dan rekap mingguan tersedia; data kosong dibedakan dari aktivitas tidak dilakukan.                       |
| Akademik          | Input sesuai penugasan; publikasi terkontrol; riwayat perubahan tercatat.                                          |
| Ruang belajar     | Jadwal, materi, tugas, pengumpulan jawaban, dan umpan balik berfungsi.                                             |
| Laporan           | Filter dan ekspor XLSX, PDF, CSV berjalan; hak akses diterapkan.                                                   |
| Keandalan         | Backup berjalan; restore diuji operator berwenang; audit log dan sinkronisasi diuji.                               |

Pengujian mencakup unit test, integration test, role/access test, security test, usability test, performance test, dan user acceptance test (UAT).

# 15. METRIK KEBERHASILAN

| **Area**     | **Indikator**                                               |
|--------------|-------------------------------------------------------------|
| Adopsi       | Persentase akun pengguna yang berhasil diaktifkan.          |
| Supervisi    | Persentase proses supervisi yang terdokumentasi.            |
| Administrasi | Persentase dokumen terkumpul dan terverifikasi.             |
| Kehadiran    | Kelengkapan pencatatan kehadiran.                           |
| Kebiasaan    | Konsistensi pengisian pemantauan mingguan.                  |
| Akademik     | Kelengkapan input dan publikasi penilaian.                  |
| Komunikasi   | Keberhasilan penyampaian informasi kepada orang tua.        |
| Sistem       | Tingkat keberhasilan proses utama.                          |
| Keamanan     | Jumlah insiden akses tidak sah dan penyelesaiannya.         |
| Kepuasan     | Feedback admin, kepala sekolah, guru, siswa, dan orang tua. |

Target angka ditentukan bersama sekolah setelah pengukuran kondisi awal (baseline).

# 16. ROADMAP PENGEMBANGAN

| **Fase** | **Fokus**              | **Output utama**                                             |
|----------|------------------------|--------------------------------------------------------------|
| 1        | Foundation             | Repository, struktur aplikasi, konfigurasi, dan autentikasi. |
| 2        | Database               | Skema PostgreSQL, relasi, RLS, dan migration.                |
| 3        | Master Data            | Pengguna, kelas, guru, siswa, dan tahun ajaran.              |
| 4        | Supervision            | Empat tahap supervisi.                                       |
| 5        | Teacher Administration | Upload dan verifikasi dokumen.                               |
| 6        | Attendance             | Absensi guru/siswa dan laporan orang tua.                    |
| 7        | Habits                 | Pemantauan tujuh kebiasaan.                                  |
| 8        | Parent Space           | Komunikasi dan pengumuman.                                   |
| 9        | Academic               | Nilai dan perkembangan akademik.                             |
| 10       | Learning Space         | Materi, jadwal, dan tugas.                                   |
| 11       | Notifications          | Pusat notifikasi dan pengingat.                              |
| 12       | Reporting              | Dashboard, rekap, dan ekspor.                                |
| 13       | Integrations           | Excel, Drive, Sheets, dan WhatsApp.                          |
| 14       | Reliability            | Offline, backup, restore, dan monitoring.                    |
| 15       | Testing                | Security, integration, usability, dan performance.           |
| 16       | Deployment             | Uji coba dan peluncuran sekolah.                             |

# 17. HAL YANG MASIH PERLU DITETAPKAN

Walaupun 16 tahap validasi kebutuhan utama telah selesai, detail operasional berikut masih perlu ditetapkan sebelum implementasi fitur terkait:

45. Instrumen supervisi final dan indikator penilaian yang disahkan sekolah.

46. Jadwal dan aturan kehadiran guru.

47. Aturan keterlambatan dan status kehadiran siswa.

48. Dokumen administrasi yang benar-benar wajib.

49. Periode pengumpulan setiap dokumen.

50. Skema penilaian akademik sesuai kurikulum sekolah.

51. Kebijakan resmi publikasi nilai.

52. Penugasan guru PJOK dan PAI.

53. Template import Excel final.

54. Akun Google dan mekanisme izin integrasi Drive/Sheets.

55. Penyedia cloud eksternal dan strategi backup.

56. Kebijakan retensi, persetujuan, dan penghapusan data.

57. Batas kapasitas unggahan.

58. Operator teknis yang ditunjuk dan prosedur restore.

59. Ketentuan penggunaan offline setiap modul.

Daftar ini tidak mengubah tujuan utama produk, tetapi harus dikonfirmasi sebelum fitur terkait dinyatakan siap digunakan.

# 18. DEFINISI PRODUK AKHIR

SI STIR HEBAT adalah sistem informasi sekolah berbasis web yang mengintegrasikan supervisi akademik, administrasi pembelajaran, kehadiran, pemantauan karakter, pengelolaan akademik, ruang belajar, komunikasi orang tua, dan pelaporan dalam satu ekosistem digital.

Sistem dibangun dengan pendekatan modular, mobile-first, aman, responsif, serta mendukung koneksi internet terbatas. Pengembangan dilakukan secara bertahap dengan fondasi autentikasi, database, manajemen peran, dan keamanan sebagai prioritas pertama.

## Prinsip Utama Pengembangan

- Satu sistem untuk seluruh proses utama sekolah.

- Setiap pengguna memperoleh akses sesuai tanggung jawab.

- Setiap data penting memiliki riwayat dan keterlacakan.

- Setiap proses memiliki status yang jelas.

- Privasi siswa dan keluarga menjadi prioritas.

- Teknologi harus membantu kegiatan pendidikan, bukan menambah kerumitan.

**— AKHIR DOKUMEN —**
