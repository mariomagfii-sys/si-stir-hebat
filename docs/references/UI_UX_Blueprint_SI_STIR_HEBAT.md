**SI STIR HEBAT**

**UI/UX  
BLUEPRINT**

Dokumen Perancangan Antarmuka dan Pengalaman Pengguna

**Sistem Informasi Supervisi Terintegrasi  
Ruang Guru, Ruang Murid, dan Ruang Orang Tua**

SDN 03 WONOSARI  
Versi 1.0 \| 30 Oktober 2026

# Informasi Dokumen

| **Elemen**        | **Keterangan**                                                                                                                  |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Nama dokumen      | UI/UX Blueprint SI STIR HEBAT                                                                                                   |
| Versi             | 1.0                                                                                                                             |
| Tanggal           | 30 Oktober 2026                                                                                                                 |
| Produk            | Sistem Informasi Supervisi Terintegrasi Ruang Guru, Ruang Murid, dan Ruang Orang Tua                                            |
| Satuan pendidikan | SDN 03 Wonosari                                                                                                                 |
| Tujuan            | Menjadi acuan perancangan antarmuka, navigasi, interaksi, responsivitas, dan pengalaman pengguna sebelum implementasi frontend. |

# Daftar Isi

- 1\. Pendahuluan

- 2\. Visi Produk dan Prinsip UX

- 3\. Pengguna dan Kebutuhannya

- 4\. Arsitektur Informasi dan Sitemap

- 5\. Design System

- 6\. Spesifikasi Dashboard

- 7\. Alur Pengguna (User Flow)

- 8\. Strategi Desain Responsif

- 9\. Pola Navigasi dan Interaksi

- 10\. Pengalaman Formulir dan Pengelolaan Data

- 11\. Kondisi Sistem (UI States)

- 12\. Aksesibilitas dan Usability

- 13\. Keamanan dalam Pengalaman Pengguna

- 14\. Standar Template Halaman

- 15\. Pengujian dan Kriteria Penerimaan

- 16\. Tahapan Implementasi

- 17\. Penutup

# 1. Pendahuluan

SI STIR HEBAT merupakan platform informasi sekolah yang dirancang untuk mengintegrasikan aktivitas administrasi, pembelajaran, supervisi, pemantauan perkembangan siswa, serta komunikasi antara sekolah dan orang tua. Platform ini menghubungkan lima kelompok pengguna utama, yaitu Admin, Kepala Sekolah, Guru, Siswa, dan Orang Tua/Wali.

Dokumen UI/UX Blueprint ini menetapkan arah desain dan standar pengalaman pengguna sebagai landasan pengembangan antarmuka. Dokumen mencakup struktur informasi, kebutuhan pengguna, sistem visual, spesifikasi dashboard, alur interaksi, desain responsif, aksesibilitas, keamanan, serta kriteria pengujian.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Ruang lingkup<br />
</strong>Blueprint ini berfokus pada rancangan pengalaman dan antarmuka. Detail implementasi API, skema basis data, kebijakan akses teknis, dan infrastruktur dijabarkan dalam dokumen teknis terpisah.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 2. Visi Produk dan Prinsip UX

## 2.1 Visi Produk

SI STIR HEBAT bertujuan menyediakan satu lingkungan digital yang memudahkan setiap warga sekolah menjalankan tugasnya sesuai peran dan kewenangan. Sistem harus menyajikan informasi yang relevan, membantu pengguna menyelesaikan pekerjaan, dan menjaga keteraturan proses administrasi maupun pembelajaran.

## 2.2 Prinsip Pengalaman Pengguna

| **Prinsip**          | **Penerapan dalam SI STIR**                                                                  |
|----------------------|----------------------------------------------------------------------------------------------|
| Sederhana            | Menu, istilah, dan langkah kerja dibuat jelas serta tidak berlebihan.                        |
| Berbasis peran       | Dashboard dan navigasi menampilkan fungsi yang sesuai dengan tanggung jawab pengguna.        |
| Konsisten            | Warna, tipografi, komponen, dan pola interaksi digunakan secara konsisten.                   |
| Responsif            | Antarmuka beradaptasi dengan ponsel, tablet, dan komputer.                                   |
| Efisien              | Tugas utama dapat dijangkau dengan langkah yang ringkas.                                     |
| Aksesibel            | Informasi mudah dibaca dan dioperasikan oleh pengguna dengan kemampuan digital yang beragam. |
| Dapat dipercaya      | Sistem memberikan status, konfirmasi, dan pesan kesalahan yang informatif.                   |
| Mengutamakan privasi | Data siswa dan informasi pribadi hanya ditampilkan kepada pihak yang berwenang.              |

# 3. Pengguna dan Kebutuhannya

SI STIR HEBAT memiliki lima kelompok pengguna. Setiap kelompok memiliki kebutuhan, prioritas informasi, dan aktivitas yang berbeda.

| **Pengguna**   | **Kebutuhan utama**                                                                            | **Prioritas UX**                                               |
|----------------|------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| Admin          | Mengelola akun, data siswa dan guru, kelas, tahun ajaran, konfigurasi, serta aktivitas sistem. | Kontrol administrasi, kejelasan data, validasi, dan efisiensi. |
| Kepala Sekolah | Memantau kondisi sekolah, melaksanakan supervisi, meninjau dokumen, dan mengevaluasi laporan.  | Ringkasan strategis, pemantauan, dan tindak lanjut.            |
| Guru           | Mengelola modul ajar, asesmen, jurnal, supervisi, kehadiran, kelas, dan daftar tugas.          | Produktivitas, kemudahan input, dan pengelolaan dokumen.       |
| Siswa          | Melihat jadwal, tugas, nilai, kehadiran, dan pengumuman.                                       | Tampilan sederhana, ramah anak, dan mudah dipahami.            |
| Orang Tua/Wali | Memantau kehadiran dan perkembangan anak serta menerima informasi sekolah.                     | Transparansi, keterbacaan, dan kemudahan pemantauan.           |

## 3.1 Prinsip Penyajian Berdasarkan Peran

Kelima pengguna menggunakan satu platform, tetapi tidak menggunakan dashboard yang identik. Sistem harus menampilkan menu dan informasi sesuai peran, kelas, serta hubungan pengguna dengan siswa. Apabila satu orang tua terhubung dengan lebih dari satu anak, antarmuka menyediakan pemilih profil anak yang hanya menampilkan anak yang telah terhubung secara sah.

# 4. Arsitektur Informasi dan Sitemap

Arsitektur informasi mengatur pengelompokan menu agar pengguna dapat menemukan fungsi dengan cepat. Struktur berikut merupakan rancangan navigasi awal dan dapat disesuaikan setelah validasi kebutuhan sekolah.

## 4.1 Admin

- Dashboard dan ringkasan sistem

- Manajemen pengguna: data siswa, data guru, data orang tua, dan akun

- Manajemen akademik: kelas, tahun ajaran, mata pelajaran, dan jadwal

- Manajemen dokumen dan pengumuman

- Monitoring aktivitas dan audit log

- Pengaturan sistem

## 4.2 Kepala Sekolah

- Dashboard dan ringkasan sekolah

- Supervisi: jadwal, instrumen, hasil, dan evaluasi guru

- Dokumen sekolah: KSP, RKT, RKAS, dan Surat Keputusan

- Monitoring guru dan siswa

- Laporan sekolah dan pengumuman

## 4.3 Guru

- Dashboard dan beranda

- Ruang Guru: modul ajar, asesmen, jurnal kegiatan, supervisi, dan daftar tugas

- Kelas Saya: data siswa, kehadiran, nilai, dan perkembangan siswa

- Jadwal mengajar, pengumuman, dan profil

## 4.4 Siswa

- Dashboard dan beranda

- Jadwal pelajaran

- Kehadiran saya

- Tugas dan nilai

- Pengumuman dan profil

## 4.5 Orang Tua/Wali

- Dashboard dan beranda

- Profil anak yang terhubung

- Kehadiran dan perkembangan akademik

- Jadwal pelajaran

- Pengumuman dan informasi sekolah

- Profil orang tua/wali

# 5. Design System

Design system menjadi pedoman visual dan komponen antarmuka agar seluruh halaman memiliki identitas yang konsisten. Arah visual yang digunakan adalah modern, bersih, ramah, dan profesional dengan aksen ungu serta warna pastel.

## 5.1 Palet Warna

| **Token**        | **Kode warna** | **Penggunaan**                                  |
|------------------|----------------|-------------------------------------------------|
| Primary Purple   | \#4C1D95       | Warna utama, navigasi aktif, dan tombol primer. |
| Secondary Purple | \#7C3AED       | Aksen, tautan, dan elemen interaktif.           |
| Light Lilac      | \#EDE9FE       | Latar lembut dan penanda area pilihan.          |
| Soft Blue        | \#DBEAFE       | Informasi sekunder dan variasi aksen.           |
| Pink Accent      | \#FCE7F3       | Aksen dekoratif terbatas, terutama area siswa.  |
| Background       | \#F8FAFC       | Latar utama halaman.                            |
| Main Text        | \#1E293B       | Teks utama.                                     |
| Secondary Text   | \#64748B       | Deskripsi dan metadata.                         |
| Border           | \#E2E8F0       | Garis pembatas dan batas komponen.              |
| Success          | \#16A34A       | Status berhasil atau selesai.                   |
| Warning          | \#D97706       | Status yang memerlukan perhatian.               |
| Error            | \#DC2626       | Kesalahan atau tindakan gagal.                  |
| Information      | \#2563EB       | Informasi dan status netral.                    |

## 5.2 Tipografi

| **Jenis huruf**   | **Penggunaan**                                      |
|-------------------|-----------------------------------------------------|
| Plus Jakarta Sans | Judul halaman, heading, dan elemen identitas utama. |
| Inter             | Teks antarmuka, formulir, tabel, dan informasi.     |
| Nunito            | Teks dengan nuansa ramah dan mudah dibaca.          |
| Fredoka           | Aksen dekoratif terbatas pada antarmuka siswa.      |

Ukuran tipografi yang disarankan: judul utama 28–32 pt; subjudul 18–24 pt; heading bagian 14–20 pt; teks isi 10–12 pt; dan keterangan 9–10 pt. Ukuran aktual pada antarmuka web perlu mengikuti skala responsif.

## 5.3 Komponen Antarmuka

| **Komponen** | **Standar desain**                                                                                  |
|--------------|-----------------------------------------------------------------------------------------------------|
| Button       | Memiliki variasi primary, secondary, tertiary, dan destructive; label berupa kata kerja yang jelas. |
| Input        | Label selalu terlihat, placeholder sebagai contoh, dan pesan validasi dekat dengan field.           |
| Card         | Digunakan untuk ringkasan, informasi, dan kelompok konten dengan hierarki yang jelas.               |
| Badge        | Menunjukkan status seperti Selesai, Menunggu, Diproses, atau Ditolak.                               |
| Modal/Dialog | Digunakan untuk konfirmasi atau tugas singkat; hindari modal berlapis.                              |
| Table        | Mendukung pencarian, filter, pengurutan, pagination, dan tampilan alternatif pada layar kecil.      |
| Toast/Alert  | Memberikan umpan balik singkat setelah tindakan pengguna.                                           |

# 6. Spesifikasi Dashboard

Dashboard harus mengutamakan informasi dan tindakan yang paling relevan bagi pengguna. Komponen berikut merupakan rekomendasi isi awal.

| **Dashboard**  | **Komponen utama**                                                                                                            |
|----------------|-------------------------------------------------------------------------------------------------------------------------------|
| Admin          | Statistik pengguna; jumlah siswa dan guru; ringkasan kelas; aktivitas terbaru; pintasan pengelolaan data; status sistem.      |
| Kepala Sekolah | Ringkasan sekolah; status supervisi; agenda; dokumen yang perlu ditinjau; monitoring guru dan siswa; laporan.                 |
| Guru           | Jadwal mengajar hari ini; daftar tugas; modul ajar terakhir; asesmen; jurnal kegiatan; ringkasan kehadiran; status supervisi. |
| Siswa          | Sapaan personal; jadwal pelajaran; tugas; ringkasan kehadiran; informasi nilai; pengumuman dan kegiatan.                      |
| Orang Tua/Wali | Profil anak; ringkasan kehadiran; perkembangan akademik; jadwal; pengumuman; informasi dari sekolah.                          |

## 6.1 Aturan Prioritas Konten

- Informasi yang memerlukan tindakan ditempatkan pada area yang mudah terlihat.

- Ringkasan angka hanya ditampilkan apabila sumber datanya jelas dan definisinya konsisten.

- Grafik harus memiliki judul, label, dan keterangan yang dapat dipahami.

- Jangan menampilkan data pribadi siswa pada dashboard umum tanpa dasar kewenangan.

- Jumlah kartu statistik dibatasi agar dashboard tidak terasa padat.

# 7. Alur Pengguna (User Flow)

## 7.1 Login dan Pengalihan Dashboard

1.  Pengguna membuka halaman login dan memasukkan kredensial.

2.  Sistem memvalidasi kredensial serta status akun.

3.  Sistem mengidentifikasi peran dan memeriksa hak akses.

4.  Pengguna diarahkan ke dashboard sesuai perannya.

5.  Jika validasi gagal, sistem menampilkan pesan yang jelas tanpa membocorkan informasi sensitif.

## 7.2 Guru Membuat Modul Ajar

6.  Guru membuka menu Ruang Guru dan memilih Modul Ajar.

7.  Guru memilih tindakan untuk membuat modul baru.

8.  Guru mengisi informasi modul melalui formulir terstruktur.

9.  Guru dapat menyimpan sebagai draft apabila belum selesai.

10. Setelah diperiksa, guru mengajukan atau memublikasikan sesuai alur persetujuan sekolah.

11. Sistem menampilkan status penyimpanan dan status proses.

## 7.3 Kepala Sekolah Melaksanakan Supervisi

12. Kepala sekolah membuka menu Supervisi.

13. Kepala sekolah memilih guru dan membuat jadwal.

14. Instrumen supervisi diisi sesuai prosedur sekolah.

15. Hasil ditinjau dan dilengkapi catatan atau rekomendasi.

16. Hasil disimpan dan dapat diakses oleh pihak yang berwenang.

17. Guru menerima pemberitahuan bahwa hasil supervisi tersedia.

## 7.4 Orang Tua Memantau Anak

18. Orang tua masuk ke Parent Portal.

19. Orang tua memilih profil anak yang telah terhubung apabila memiliki lebih dari satu anak.

20. Orang tua membuka informasi kehadiran, perkembangan akademik, jadwal, atau pengumuman.

21. Sistem hanya menampilkan data anak yang memiliki relasi akses sah.

# 8. Strategi Desain Responsif

| **Perangkat** | **Rentang lebar acuan** | **Pola tampilan**                                                                       |
|---------------|-------------------------|-----------------------------------------------------------------------------------------|
| Ponsel        | 320–767 px              | Navigasi bawah atau menu ringkas; konten satu kolom; tabel diubah menjadi daftar/kartu. |
| Tablet        | 768–1023 px             | Navigasi dapat menggunakan drawer; konten dua kolom jika sesuai.                        |
| Desktop       | 1024 px ke atas         | Sidebar; header lengkap; dashboard multi-kolom; tabel lebih luas.                       |

- Layout utama tidak boleh menimbulkan scroll horizontal.

- Area sentuh interaktif disarankan sekurang-kurangnya 44 × 44 piksel.

- Formulir menggunakan satu kolom pada ponsel dan dapat menjadi dua kolom pada layar lebar jika urutannya tetap logis.

- Modal pada ponsel dapat berubah menjadi halaman penuh atau bottom sheet.

- Informasi penting tidak boleh hanya dibedakan melalui warna.

- Komponen dan aset visual perlu dioptimalkan agar tetap ringan pada koneksi internet yang terbatas.

# 9. Pola Navigasi dan Interaksi

## 9.1 Navigasi Desktop

Navigasi desktop menggunakan sidebar yang memuat identitas SI STIR, menu utama sesuai peran, submenu, indikator menu aktif, akses profil, dan tindakan keluar. Sidebar dapat diciutkan apabila ruang layar terbatas.

## 9.2 Navigasi Mobile

Navigasi ponsel menampilkan maksimal lima tujuan utama yang paling sering digunakan oleh masing-masing peran. Menu sekunder ditempatkan pada halaman Semua Menu atau drawer.

## 9.3 Umpan Balik Interaksi

| **Tindakan pengguna** | **Respons sistem yang diharapkan**                                  |
|-----------------------|---------------------------------------------------------------------|
| Menyimpan data        | Notifikasi berhasil hanya setelah server mengonfirmasi penyimpanan. |
| Penyimpanan gagal     | Pesan kesalahan yang menjelaskan langkah berikutnya.                |
| Menghapus data        | Dialog konfirmasi sebelum tindakan dijalankan.                      |
| Memuat data           | Skeleton loading atau indikator proses yang kontekstual.            |
| Tidak ada data        | Empty state dengan penjelasan dan tindakan yang relevan.            |
| Tidak memiliki akses  | Halaman atau pesan akses ditolak yang tidak membocorkan data.       |
| Koneksi terputus      | Indikator offline dan informasi status sinkronisasi.                |

# 10. Pengalaman Formulir dan Pengelolaan Data

## 10.1 Standar Formulir

- Setiap input memiliki label yang terlihat dan deskripsi bila diperlukan.

- Field wajib diberi penanda yang konsisten.

- Placeholder digunakan sebagai contoh, bukan pengganti label.

- Validasi dilakukan pada sisi antarmuka dan tetap diverifikasi oleh server.

- Pesan kesalahan diletakkan dekat dengan field yang bermasalah.

- Formulir panjang dibagi menjadi beberapa bagian yang logis.

- Draft disediakan untuk proses yang berpotensi memerlukan waktu.

- Tombol utama dan tombol pembatalan memiliki posisi serta label yang konsisten.

## 10.2 Standar Tabel dan Daftar

- Tabel menyediakan pencarian, filter, pengurutan, dan pagination sesuai kebutuhan.

- Aksi edit, hapus, dan ekspor hanya ditampilkan kepada pengguna yang memiliki izin.

- Pada layar kecil, tabel dapat disajikan sebagai kartu atau daftar ringkas.

- Data yang sensitif ditampilkan seminimal mungkin sesuai kebutuhan tugas pengguna.

# 11. Kondisi Sistem (UI States)

| **Kondisi**  | **Perilaku antarmuka**                                                                              |
|--------------|-----------------------------------------------------------------------------------------------------|
| Loading      | Tampilkan skeleton atau indikator proses dengan konteks.                                            |
| Empty        | Jelaskan bahwa data belum tersedia dan berikan tindakan yang sesuai.                                |
| Error        | Gunakan bahasa yang jelas, hindari kode teknis mentah, dan sediakan opsi mencoba kembali jika aman. |
| Offline      | Tampilkan status koneksi dan waktu sinkronisasi terakhir bila tersedia.                             |
| Pending sync | Bedakan perubahan lokal yang belum terkirim dari data yang sudah tersimpan di server.               |
| Success      | Berikan konfirmasi setelah sistem menerima hasil tindakan.                                          |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Ketentuan penting<br />
</strong>Antarmuka tidak boleh menyatakan data berhasil tersimpan apabila server belum memberikan konfirmasi. Draft lokal dan data yang telah tersinkron harus dibedakan secara visual dan tekstual.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 11.1 Strategi Penggunaan pada Koneksi Terbatas

- Prioritaskan pemuatan konten inti dan kurangi aset visual yang tidak penting.

- Gunakan cache hanya untuk data yang aman dan memang diperlukan.

- Jika fitur draft offline disediakan, jelaskan bahwa data belum tersimpan di server.

- Jangan menyimpan data sensitif pada perangkat bersama tanpa perlindungan yang sesuai.

- Berikan mekanisme pemulihan atau pengiriman ulang yang tidak menggandakan data.

# 12. Aksesibilitas dan Usability

Antarmuka perlu mengakomodasi pengguna dengan rentang usia dan tingkat literasi digital yang berbeda. Rancangan diarahkan untuk mengikuti prinsip WCAG 2.2 tingkat AA sejauh relevan dan dapat diterapkan.

- Pastikan kontras teks dan latar memadai.

- Sediakan navigasi keyboard dan indikator fokus yang terlihat.

- Gunakan label yang jelas pada tombol, tautan, dan input.

- Tambahkan teks alternatif pada gambar yang menyampaikan informasi.

- Jangan mengandalkan warna sebagai satu-satunya penanda status.

- Gunakan bahasa Indonesia yang sederhana, sopan, dan konsisten.

- Batasi animasi yang tidak mendukung tugas pengguna.

- Untuk siswa sekolah dasar, gunakan ikon yang mudah dikenali dan instruksi singkat.

# 13. Keamanan dalam Pengalaman Pengguna

Pengalaman pengguna harus mencerminkan kebijakan keamanan sistem. Antarmuka tidak menggantikan pengamanan backend; pembatasan akses harus ditegakkan melalui mekanisme otorisasi dan kebijakan basis data.

| **Aspek**             | **Ketentuan pengalaman pengguna**                                            |
|-----------------------|------------------------------------------------------------------------------|
| Role-based access     | Menu dan tindakan disesuaikan dengan peran serta izin pengguna.              |
| Pembatasan kelas      | Guru hanya melihat data kelas yang menjadi kewenangannya.                    |
| Relasi orang tua-anak | Orang tua hanya dapat mengakses siswa yang telah terhubung dan diverifikasi. |
| Data sensitif         | Informasi pribadi ditampilkan sesuai kebutuhan dan kewenangan.               |
| Audit aktivitas       | Aktivitas penting dicatat untuk kebutuhan penelusuran dan akuntabilitas.     |
| Sesi pengguna         | Sediakan mekanisme logout dan penanganan sesi yang berakhir.                 |
| Akses tidak sah       | Tampilkan pemberitahuan akses ditolak tanpa mengungkap data yang dilindungi. |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Catatan implementasi<br />
</strong>Menyembunyikan menu atau tombol pada frontend tidak cukup untuk melindungi data. Otorisasi harus diterapkan dan diuji pada backend serta kebijakan Row Level Security (RLS) Supabase.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 14. Standar Template Halaman

Halaman internal menggunakan pola struktur yang konsisten agar pengguna tidak perlu mempelajari ulang tata letak pada setiap modul.

22. Header: identitas aplikasi, notifikasi, dan akses profil.

23. Breadcrumb: menunjukkan posisi halaman apabila struktur navigasi bertingkat.

24. Judul halaman: menjelaskan fungsi halaman secara langsung.

25. Deskripsi singkat: memberikan konteks bila diperlukan.

26. Konten utama: formulir, tabel, kartu, grafik, atau informasi.

27. Tindakan utama: ditempatkan secara konsisten dan mudah ditemukan.

28. Status sistem: loading, empty, error, success, atau offline sesuai keadaan.

# 15. Pengujian dan Kriteria Penerimaan

Pengujian dilakukan dengan melibatkan perwakilan dari kelima kelompok pengguna. Skenario harus berangkat dari tugas nyata, bukan hanya penilaian estetika.

| **Area pengujian** | **Kriteria penerimaan**                                                              |
|--------------------|--------------------------------------------------------------------------------------|
| Navigasi           | Pengguna dapat menemukan menu dan fungsi utama tanpa kebingungan yang berarti.       |
| Penyelesaian tugas | Pengguna dapat menyelesaikan tugas utama sesuai alur yang dirancang.                 |
| Responsivitas      | Halaman dapat digunakan pada ponsel, tablet, dan desktop tanpa kerusakan tata letak. |
| Aksesibilitas      | Teks terbaca, fokus terlihat, label tersedia, dan kontrol dapat dioperasikan.        |
| Umpan balik        | Pengguna memahami apakah tindakan berhasil, gagal, atau masih diproses.              |
| Hak akses          | Pengguna tidak dapat melihat atau mengubah data di luar kewenangannya.               |
| Kinerja            | Halaman inti tetap dapat digunakan pada kondisi jaringan yang terbatas.              |

## 15.1 Checklist Kesiapan UI/UX

- Dashboard untuk kelima peran telah dirancang.

- Sitemap telah ditinjau bersama kebutuhan dan kewenangan pengguna.

- Design tokens dan komponen utama telah ditetapkan.

- Versi desktop, tablet, dan ponsel telah dirancang.

- Formulir memiliki validasi dan umpan balik.

- Loading, empty, error, offline, dan pending-sync states telah tersedia.

- Navigasi konsisten pada seluruh modul.

- Data sensitif mengikuti batas akses yang ditetapkan.

- Prototipe diuji menggunakan skenario dari masing-masing peran.

- Temuan pengujian dicatat dan ditindaklanjuti.

# 16. Tahapan Implementasi

| **Tahap**                          | **Ruang lingkup**                                                                        | **Hasil yang diharapkan**           |
|------------------------------------|------------------------------------------------------------------------------------------|-------------------------------------|
| 1\. Foundation Design              | Design tokens, tipografi, ikon, tombol, input, kartu, modal, dan navigasi.               | Fondasi design system.              |
| 2\. Shared Layout & Authentication | Login, layout utama, header, sidebar, navigasi mobile, dan pengalihan berdasarkan peran. | Kerangka aplikasi dan autentikasi.  |
| 3\. Admin & Kepala Sekolah         | Dashboard, manajemen data, supervisi, dokumen, dan monitoring.                           | Area administrasi dan kepemimpinan. |
| 4\. Guru Workspace                 | Modul ajar, asesmen, jurnal, kehadiran, kelas, dan daftar tugas.                         | Area kerja guru.                    |
| 5\. Siswa & Orang Tua              | Jadwal, tugas, nilai, kehadiran, perkembangan, dan pengumuman.                           | Portal siswa dan orang tua.         |
| 6\. Quality & Responsive           | Optimasi responsif, aksesibilitas, status sistem, dan performa.                          | Antarmuka siap diuji.               |
| 7\. Usability Testing              | Pengujian kelima peran, dokumentasi temuan, dan perbaikan.                               | Validasi pengalaman pengguna.       |

# 17. Penutup

UI/UX Blueprint ini menjadi acuan awal dalam membangun pengalaman digital SI STIR HEBAT. Keberhasilan desain tidak hanya diukur dari tampilan visual, tetapi juga dari kemampuan sistem membantu setiap pengguna menyelesaikan tugas secara jelas, efisien, aman, dan konsisten.

Seluruh rancangan perlu divalidasi bersama pihak sekolah dan calon pengguna sebelum implementasi final. Perubahan terhadap alur kerja, kebijakan sekolah, atau hak akses harus tercermin pada sitemap, prototipe, dan spesifikasi antarmuka.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Arah akhir desain<br />
</strong>SI STIR HEBAT dirancang sebagai satu platform dengan lima pengalaman pengguna yang saling terhubung. Konsistensi design system, navigasi berbasis peran, aksesibilitas, privasi, dan keandalan menjadi fondasi utama.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>
