**2. CAKUPAN INFORMASI (SCOPE OF INFORMATION)**

**2.1 Gambaran Umum**

Cakupan informasi merupakan penjelasan mengenai batasan, jenis, dan ruang lingkup informasi yang dikelola dalam sistem Role-Based Access Control (RBAC) pada aplikasi SI STIR (Sistem Informasi Supervisi Terintegrasi Ruang Guru, Ruang Murid, dan Ruang Orang Tua).

RBAC dirancang untuk memastikan bahwa setiap pengguna hanya dapat mengakses informasi dan menjalankan aktivitas sesuai dengan peran, tanggung jawab, serta kewenangan yang telah ditetapkan oleh sekolah.

Sistem ini mencakup pengelolaan hak akses terhadap data pengguna, administrasi sekolah, kegiatan pembelajaran, supervisi akademik, kehadiran, asesmen, dokumen sekolah, serta informasi perkembangan siswa.

Penerapan RBAC tidak hanya mengatur tampilan menu pada aplikasi, tetapi juga mengendalikan akses terhadap data dan proses pengelolaan informasi melalui mekanisme autentikasi, otorisasi, serta kebijakan keamanan database.

**2.2 Cakupan Pengguna Sistem**

Sistem RBAC SI STIR mencakup lima kategori pengguna utama, yaitu:

**1. Administrator (Admin)**

Administrator memiliki kewenangan dalam pengelolaan teknis dan administratif sistem, meliputi pengelolaan akun, profil pengguna, role, permission, data master, konfigurasi aplikasi, serta pemantauan aktivitas sistem. Administrator tidak secara otomatis memiliki kewenangan untuk menyetujui dokumen akademik atau mengambil keputusan resmi sekolah.

**2. Kepala Sekolah**

Kepala sekolah memiliki kewenangan untuk memantau aktivitas sekolah, mengelola supervisi akademik, memeriksa dokumen pembelajaran, memberikan evaluasi, mengelola administrasi sekolah, serta menyetujui dokumen sesuai dengan tanggung jawab dan kebijakan yang berlaku.

**3. Guru**

Guru memiliki kewenangan untuk mengelola kegiatan pembelajaran, perangkat ajar, asesmen, jurnal kegiatan, kehadiran, serta dokumentasi akademik. Akses guru terhadap data siswa dibatasi berdasarkan kelas dan penugasan yang menjadi tanggung jawabnya.

**4. Siswa**

Siswa memiliki akses terhadap informasi pembelajaran yang berkaitan dengan dirinya, seperti jadwal pelajaran, materi, tugas, pengumuman, kehadiran, dan hasil asesmen yang diizinkan oleh sekolah.

**5. Orang Tua/Wali Murid**

Orang tua memiliki akses untuk memantau informasi pendidikan anak, meliputi kehadiran, tugas, pengumuman, perkembangan pembelajaran, dan informasi asesmen yang diperbolehkan. Akses hanya diberikan terhadap siswa yang memiliki hubungan orang tua-anak yang telah diverifikasi dalam sistem.

**2.3 Cakupan Modul Informasi**

Penerapan RBAC mencakup pengaturan hak akses pada modul-modul utama SI STIR sebagai berikut.

**1. Modul Manajemen Pengguna**

Mencakup pengelolaan akun, profil pengguna, status akun, penetapan role, serta pengaturan permission. Pengelolaan dilakukan oleh administrator sesuai kewenangannya.

**2. Modul Data Sekolah**

Mencakup data guru, siswa, orang tua, kelas, mata pelajaran, tahun ajaran, serta hubungan antara pengguna dan lingkungan akademik. Akses terhadap informasi disesuaikan dengan tanggung jawab masing-masing role.

**3. Modul Perangkat Pembelajaran**

Mencakup pembuatan, pengunggahan, pemeriksaan, revisi, persetujuan, dan pengarsipan modul ajar serta dokumen pembelajaran lainnya.

**4. Modul Supervisi Akademik**

Mencakup pengelolaan jadwal supervisi, pelaksanaan observasi, pengisian instrumen penilaian, pencatatan hasil evaluasi, pemberian umpan balik, dan tindak lanjut supervisi.

**5. Modul Asesmen dan Penilaian**

Mencakup pengelolaan instrumen asesmen, pencatatan hasil penilaian, pengolahan data akademik, serta penyajian informasi perkembangan belajar siswa sesuai hak akses pengguna.

**6. Modul Jurnal Kegiatan Guru**

Mencakup pencatatan aktivitas pembelajaran, materi yang disampaikan, kegiatan kelas, dokumentasi, serta riwayat kegiatan guru.

**7. Modul Administrasi Sekolah**

Mencakup pengelolaan dokumen Kurikulum Satuan Pendidikan (KSP), Rencana Kerja Tahunan (RKT), Rencana Kegiatan dan Anggaran Sekolah (RKAS), serta Surat Keputusan (SK). Akses dan persetujuan dokumen mengikuti kewenangan resmi sekolah.

**8. Modul Kehadiran dan Absensi**

Mencakup pencatatan kehadiran guru dan siswa, pengelolaan status kehadiran, koreksi data, rekapitulasi, serta proses impor dan ekspor data melalui Microsoft Excel.

**9. Modul Siswa dan Orang Tua**

Mencakup penyediaan informasi pembelajaran, jadwal, tugas, pengumuman, kehadiran, serta perkembangan pendidikan siswa. Pembatasan akses diterapkan berdasarkan identitas pengguna dan hubungan yang terverifikasi.

**10. Modul Notifikasi dan Pengumuman**

Mencakup pengelolaan serta penyampaian informasi kepada pengguna berdasarkan kategori, role, kelas, dan penerima yang telah ditentukan.

**11. Modul Laporan dan Rekapitulasi**

Mencakup penyajian laporan supervisi, kehadiran, asesmen, aktivitas guru, dan administrasi sekolah. Hak untuk melihat, mengunduh, maupun mengekspor laporan ditentukan berdasarkan permission.

**12. Modul Audit dan Aktivitas Sistem**

Mencakup pencatatan aktivitas penting pengguna, perubahan data, pengelolaan role, persetujuan dokumen, serta aktivitas administratif lainnya sebagai bentuk pengawasan dan pertanggungjawaban sistem.

**2.4 Cakupan Jenis Hak Akses**

Sistem RBAC menggunakan enam jenis operasi utama untuk menentukan tindakan yang dapat dilakukan pengguna terhadap informasi.

| **Kode** | **Jenis Hak Akses** | **Penjelasan**                                                    |
|----------|---------------------|-------------------------------------------------------------------|
| V        | View                | Hak untuk melihat dan membaca informasi.                          |
| C        | Create              | Hak untuk membuat atau menambahkan informasi baru.                |
| U        | Update              | Hak untuk mengubah informasi yang sudah tersedia.                 |
| D        | Delete              | Hak untuk menghapus informasi sesuai ketentuan.                   |
| A        | Approve             | Hak untuk memeriksa, menyetujui, atau mengembalikan dokumen.      |
| E        | Export              | Hak untuk mengunduh atau mengekspor informasi ke format tertentu. |

Setiap jenis hak akses ditetapkan secara terpisah berdasarkan role dan modul. Kepemilikan hak untuk melihat informasi tidak secara otomatis memberikan hak untuk mengubah, menghapus, menyetujui, atau mengekspor informasi tersebut.

**2.5 Cakupan Pembatasan Akses Data**

Selain berdasarkan role, sistem menerapkan pembatasan akses berdasarkan ruang lingkup data (Data Scope). Hal ini bertujuan untuk memastikan bahwa pengguna tidak dapat mengakses informasi di luar tanggung jawabnya.

Pembatasan tersebut meliputi:

1.  **Pembatasan berdasarkan identitas pengguna:** Pengguna hanya dapat mengakses dan mengubah informasi profil pribadinya sesuai kebijakan sistem.

2.  **Pembatasan berdasarkan kelas:** Guru hanya dapat mengakses data siswa dan aktivitas pembelajaran pada kelas yang menjadi tanggung jawabnya.

3.  **Pembatasan berdasarkan penugasan:** Akses guru terhadap mata pelajaran dan kegiatan akademik mengikuti penugasan yang tercatat dalam sistem.

4.  **Pembatasan berdasarkan hubungan orang tua dan siswa:** Orang tua hanya dapat mengakses informasi siswa yang memiliki hubungan resmi dan telah diverifikasi.

5.  **Pembatasan berdasarkan kewenangan jabatan:** Kepala sekolah dan administrator memperoleh akses sesuai tanggung jawab masing-masing.

6.  **Pembatasan berdasarkan kepemilikan dokumen:** Pengelolaan dokumen dibatasi berdasarkan pembuat, penanggung jawab, serta pihak yang memiliki kewenangan pemeriksaan atau persetujuan.

**2.6 Cakupan Keamanan dan Pengendalian Informasi**

Penerapan RBAC mencakup pengendalian keamanan informasi melalui beberapa mekanisme berikut:

1.  **Authentication:** Memastikan identitas pengguna melalui mekanisme login dan autentikasi.

2.  **Authorization:** Memastikan setiap tindakan sesuai dengan role dan permission pengguna.

3.  **Row Level Security (RLS):** Membatasi akses data secara langsung pada tingkat database PostgreSQL.

4.  **Data Validation:** Memastikan informasi yang dimasukkan sesuai dengan ketentuan sistem.

5.  **Audit Logging:** Mencatat aktivitas penting untuk mendukung pemantauan dan pemeriksaan.

6.  **Session Management:** Mengelola sesi pengguna agar akses aplikasi tetap terlindungi.

7.  **Access Control:** Mencegah pengguna mengakses modul dan data di luar kewenangannya.

8.  **Document Protection:** Membatasi akses terhadap dokumen dan berkas berdasarkan hak akses pengguna.

Seluruh mekanisme tersebut dirancang untuk mengurangi risiko akses tidak sah, penyalahgunaan akun, perubahan data tanpa kewenangan, serta kebocoran informasi sekolah.

**2.7 Batasan Cakupan**

Dokumen RBAC Matrix ini berfokus pada perancangan dan pengaturan hak akses pengguna dalam aplikasi SI STIR. Dokumen ini tidak secara khusus membahas seluruh proses operasional sekolah, kebijakan akademik, maupun prosedur administratif secara terperinci.

Beberapa hal yang menjadi batasan dalam penerapannya adalah:

1.  Penetapan role dan permission harus mengikuti kebijakan resmi SDN 03 Wonosari.

2.  Hak akses terhadap dokumen resmi sekolah mengikuti kewenangan dan prosedur persetujuan yang berlaku.

3.  Akses terhadap data pribadi siswa dan orang tua dibatasi sesuai kebutuhan operasional dan ketentuan perlindungan data yang berlaku.

4.  Administrator tidak otomatis memperoleh seluruh kewenangan akademik dan administratif kepala sekolah.

5.  Sistem RBAC tidak menggantikan kebijakan pengelolaan sekolah, melainkan menjadi mekanisme teknis untuk menerapkan kebijakan tersebut.

6.  Perubahan role, permission, dan kebijakan akses harus melalui proses pengelolaan yang terkontrol dan tercatat.

**2.8 Hasil yang Diharapkan**

Melalui penerapan cakupan informasi RBAC, SI STIR diharapkan memiliki sistem pengelolaan hak akses yang terstruktur, konsisten, dan dapat dipertanggungjawabkan.

Setiap pengguna dapat menjalankan aktivitas sesuai peran dan tanggung jawabnya tanpa memperoleh akses yang tidak diperlukan. Selain itu, perlindungan informasi sekolah, khususnya data guru, siswa, dan orang tua, dapat ditingkatkan melalui pembatasan akses yang diterapkan secara konsisten pada antarmuka aplikasi maupun database.

Dengan demikian, RBAC menjadi salah satu fondasi utama dalam membangun SI STIR sebagai sistem informasi sekolah yang aman, terintegrasi, dan berkelanjutan.
