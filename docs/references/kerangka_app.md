**SYSTEM ARCHITECTURE DOCUMENT (SAD)**

**SI STIR HEBAT**

**Sistem Informasi Supervisi Terintegrasi, Ruang Harmonis Edukatif, Bersama Wujudkan Anak Indonesia Hebat**

**Nama Institusi:** SDN 03 Wonosari  
**NPSN:** 40500185  
**Alamat:** Jln Lingkar, Makmur, Wonosari, Boalemo, Gorontalo 96262  
**Versi Dokumen:** 1.0  
**Status Dokumen:** Rancangan Arsitektur Sistem  
**Tanggal Penyusunan:** 3 November 2026

**BAB I. PENDAHULUAN**

**1.1 Latar Belakang**

Perkembangan teknologi informasi memberikan peluang bagi institusi pendidikan untuk meningkatkan efektivitas pengelolaan administrasi, pembelajaran, supervisi, serta komunikasi antara sekolah dan orang tua. Namun, pelaksanaan kegiatan operasional sekolah masih sering melibatkan berbagai media yang terpisah, seperti dokumen cetak, lembar kerja, perangkat penyimpanan pribadi, dan aplikasi komunikasi.

Kondisi tersebut dapat menimbulkan kesulitan dalam melakukan pemantauan, pengarsipan, pencarian informasi, serta evaluasi perkembangan kegiatan sekolah. Oleh karena itu, diperlukan sebuah sistem informasi yang mampu mengintegrasikan berbagai kebutuhan tersebut dalam satu platform digital.

SI STIR HEBAT dikembangkan sebagai sistem informasi sekolah terintegrasi yang dirancang untuk mendukung kegiatan administrasi, supervisi akademik, pengelolaan pembelajaran, pencatatan kehadiran, serta keterlibatan orang tua dalam mendukung perkembangan murid.

Dokumen System Architecture Document (SAD) disusun untuk menjelaskan rancangan arsitektur teknis yang menjadi dasar pengembangan SI STIR HEBAT. Dokumen ini mencakup struktur sistem, teknologi yang digunakan, komponen aplikasi, arsitektur database, mekanisme komunikasi data, keamanan, integrasi layanan eksternal, serta strategi implementasi dan pemeliharaan sistem.

**1.2 Tujuan Dokumen**

Dokumen ini bertujuan untuk:

1.  Mendefinisikan struktur arsitektur SI STIR HEBAT secara menyeluruh.

2.  Menjelaskan hubungan antara frontend, backend, database, dan layanan eksternal.

3.  Menetapkan teknologi utama yang digunakan dalam pengembangan sistem.

4.  Menjadi pedoman teknis bagi developer dalam proses implementasi.

5.  Menentukan mekanisme pengelolaan data dan keamanan informasi.

6.  Menjelaskan alur komunikasi dan pertukaran data antar-modul.

7.  Menjadi acuan dalam pengembangan, pengujian, deployment, dan pemeliharaan.

8.  Memastikan sistem dapat dikembangkan secara bertahap tanpa mengubah keseluruhan fondasi arsitektur.

**1.3 Ruang Lingkup Dokumen**

Ruang lingkup System Architecture Document meliputi:

- Gambaran umum sistem dan prinsip arsitektur.

- Arsitektur aplikasi dan pembagian modul.

- Arsitektur teknologi dan infrastruktur.

- Arsitektur database dan pengelolaan data.

- Arsitektur autentikasi dan otorisasi.

- Arsitektur modul akademik dan administrasi.

- Arsitektur sistem kehadiran.

- Arsitektur supervisi akademik.

- Arsitektur penyimpanan dokumen.

- Integrasi dengan layanan eksternal.

- Keamanan dan perlindungan data.

- Backup dan pemulihan sistem.

- Performa dan kemampuan penggunaan offline.

- Deployment dan operasional sistem.

- Risiko teknis serta strategi mitigasi.

**1.4 Definisi dan Istilah**

| **Istilah** | **Definisi**                                               |
|-------------|------------------------------------------------------------|
| SAD         | System Architecture Document                               |
| Frontend    | Bagian aplikasi yang berinteraksi langsung dengan pengguna |
| Backend     | Komponen yang menangani proses bisnis dan pengolahan data  |
| Database    | Sistem penyimpanan dan pengelolaan data                    |
| API         | Antarmuka komunikasi antar-sistem                          |
| RBAC        | Role-Based Access Control                                  |
| RLS         | Row Level Security                                         |
| CRUD        | Create, Read, Update, Delete                               |
| CI/CD       | Continuous Integration / Continuous Deployment             |
| PWA         | Progressive Web Application                                |
| Supabase    | Platform backend berbasis layanan PostgreSQL               |
| PostgreSQL  | Sistem manajemen basis data relasional                     |
| Deployment  | Proses penerapan aplikasi ke lingkungan operasional        |

**BAB II. GAMBARAN UMUM SISTEM**

**2.1 Identitas Sistem**

SI STIR HEBAT merupakan sistem informasi sekolah berbasis web yang dikembangkan untuk SDN 03 Wonosari. Sistem ini mengintegrasikan kebutuhan pengelolaan administrasi sekolah, supervisi kepala sekolah, kegiatan pembelajaran guru, aktivitas murid, serta komunikasi dan keterlibatan orang tua.

Sistem menggunakan pendekatan berbasis peran sehingga setiap pengguna memperoleh tampilan, fungsi, dan hak akses sesuai tanggung jawabnya.

**2.2 Tujuan Pengembangan Sistem**

Pengembangan SI STIR HEBAT memiliki beberapa tujuan utama, yaitu:

1.  Meningkatkan efektivitas pelaksanaan supervisi akademik.

2.  Mempermudah pengelolaan perangkat pembelajaran dan administrasi guru.

3.  Mengintegrasikan pencatatan kehadiran murid.

4.  Mempermudah pengelolaan nilai, asesmen, dan hasil pembelajaran.

5.  Menyediakan media digital untuk dokumentasi kegiatan sekolah.

6.  Meningkatkan keterlibatan orang tua dalam pemantauan perkembangan anak.

7.  Mendukung penerapan tujuh kebiasaan anak Indonesia hebat.

8.  Menyediakan informasi yang terpusat dan mudah diakses oleh pihak berwenang.

**2.3 Pengguna Sistem**

SI STIR HEBAT dirancang untuk lima kategori pengguna utama:

**a. Administrator**

Administrator bertanggung jawab terhadap pengelolaan sistem, konfigurasi aplikasi, manajemen akun, pengaturan hak akses, dan pemeliharaan data sesuai kewenangannya.

**b. Kepala Sekolah**

Kepala sekolah memiliki kewenangan dalam melakukan supervisi akademik, memantau kinerja dan perkembangan guru, memverifikasi dokumen, mengakses laporan, serta mengelola kebutuhan administrasi sekolah.

**c. Guru**

Guru menggunakan sistem untuk mengelola perangkat pembelajaran, kehadiran, asesmen, jurnal kegiatan, laporan perkembangan murid, serta mengikuti proses supervisi akademik.

**d. Murid**

Murid menggunakan sistem untuk mengakses informasi pembelajaran, melihat tugas, memantau hasil belajar, mengisi aktivitas kebiasaan positif, dan mengembangkan portofolio.

**e. Orang Tua atau Wali Murid**

Orang tua menggunakan sistem untuk melaporkan ketidakhadiran anak, memantau informasi perkembangan anak, melihat pengumuman, serta berpartisipasi dalam kegiatan refleksi dan komunikasi sekolah.

**2.4 Ruang Lingkup Fungsional Sistem**

Sistem terdiri atas empat ruang utama:

1.  **Ruang Kepala Sekolah:** dashboard monitoring, supervisi, verifikasi dokumen, administrasi sekolah, dan laporan.

2.  **Ruang Guru:** perangkat pembelajaran, absensi, asesmen, jurnal kegiatan, hasil supervisi, dan pengelolaan kelas.

3.  **Ruang Murid:** aktivitas pembelajaran, tugas, portofolio, pencapaian, dan tujuh kebiasaan anak Indonesia hebat.

4.  **Ruang Orang Tua:** pelaporan ketidakhadiran, riwayat laporan, informasi anak, pengumuman, dan refleksi orang tua.

**BAB III. PRINSIP DAN PENDEKATAN ARSITEKTUR**

**3.1 Pendekatan Arsitektur**

SI STIR HEBAT menggunakan pendekatan Modular Web Application dengan pemisahan tanggung jawab antara lapisan antarmuka, layanan aplikasi, dan pengelolaan data.

Pendekatan ini dipilih agar setiap modul memiliki tanggung jawab yang jelas, mudah dikembangkan, dan dapat dipelihara secara terpisah tanpa mengganggu keseluruhan sistem.

Pada tahap awal, sistem menggunakan backend-as-a-service melalui Supabase. Pengolahan data dilakukan melalui layanan Supabase dan fungsi backend yang diperlukan untuk proses bisnis tertentu.

**3.2 Prinsip Dasar Arsitektur**

**a. Modularity**

Setiap fitur dikelompokkan berdasarkan fungsi dan tanggung jawabnya agar pengembangan serta pemeliharaan dapat dilakukan secara terstruktur.

**b. Scalability**

Arsitektur harus memungkinkan penambahan fitur, tabel, layanan, dan kapasitas infrastruktur sesuai kebutuhan sekolah.

**c. Security by Design**

Keamanan menjadi bagian dari proses perancangan sejak awal, bukan hanya ditambahkan setelah aplikasi selesai.

**d. Data Integrity**

Setiap proses penyimpanan dan perubahan data harus mempertahankan konsistensi serta keakuratan informasi.

**e. Role-Based Access**

Setiap pengguna hanya memperoleh akses terhadap informasi dan tindakan yang sesuai dengan kewenangannya.

**f. Responsive Design**

Sistem harus dapat digunakan melalui komputer, laptop, tablet, dan smartphone.

**g. Maintainability**

Struktur kode, database, serta dokumentasi harus dirancang agar mudah dipahami, diperbaiki, dan dikembangkan oleh developer.

**h. Progressive Enhancement**

Sistem harus tetap memberikan pengalaman penggunaan yang baik meskipun pengguna memiliki perangkat dengan spesifikasi terbatas atau koneksi internet yang tidak stabil.

**BAB IV. ARSITEKTUR TEKNOLOGI**

**4.1 Teknologi Utama**

Teknologi utama yang digunakan dalam pengembangan SI STIR HEBAT meliputi:

| **Komponen**         | **Teknologi**    | **Fungsi**                   |
|----------------------|------------------|------------------------------|
| Frontend Framework   | React            | Pengembangan antarmuka       |
| Build Tool           | Vite             | Proses development dan build |
| Programming Language | TypeScript       | Pengembangan kode bertipe    |
| Styling              | Tailwind CSS     | Pengaturan desain antarmuka  |
| Routing              | React Router     | Navigasi aplikasi            |
| Backend Platform     | Supabase         | Layanan backend              |
| Database             | PostgreSQL       | Penyimpanan data             |
| Authentication       | Supabase Auth    | Autentikasi pengguna         |
| Storage              | Supabase Storage | Penyimpanan file             |
| Version Control      | Git dan GitHub   | Pengelolaan versi kode       |
| Hosting              | Vercel           | Deployment aplikasi web      |

**4.2 Arsitektur Frontend**

Frontend dikembangkan menggunakan React, Vite, TypeScript, dan Tailwind CSS.

React digunakan untuk membangun antarmuka berbasis komponen, sedangkan Vite menyediakan lingkungan pengembangan dan proses pembangunan aplikasi yang efisien.

TypeScript digunakan untuk meningkatkan konsistensi tipe data, mengurangi kesalahan implementasi, dan mempermudah pemeliharaan kode.

Frontend bertanggung jawab terhadap:

1.  Menampilkan halaman sesuai peran pengguna.

2.  Mengelola navigasi aplikasi.

3.  Menampilkan dashboard dan informasi.

4.  Mengelola formulir input data.

5.  Melakukan validasi awal pada sisi pengguna.

6.  Mengirimkan permintaan data ke backend.

7.  Menampilkan hasil pemrosesan dan notifikasi.

8.  Mengelola kondisi loading, error, dan empty state.

**4.3 Arsitektur Backend**

Backend menggunakan Supabase sebagai platform layanan utama.

Supabase menyediakan layanan autentikasi, database PostgreSQL, API, penyimpanan file, serta mekanisme keamanan data.

Untuk proses yang membutuhkan logika bisnis khusus, seperti persetujuan, sinkronisasi, atau integrasi pihak ketiga, sistem dapat menggunakan Supabase Edge Functions atau layanan backend tambahan.

Tanggung jawab backend meliputi:

1.  Memproses permintaan data dari frontend.

2.  Memverifikasi identitas pengguna.

3.  Memastikan hak akses pengguna.

4.  Menjalankan operasi database.

5.  Mengelola proses bisnis.

6.  Menangani integrasi eksternal.

7.  Mencatat aktivitas penting.

8.  Menjaga konsistensi data.

**4.4 Arsitektur Database**

PostgreSQL melalui Supabase digunakan sebagai sistem manajemen basis data utama.

Database dirancang secara relasional dengan menggunakan primary key, foreign key, constraints, indexes, serta kebijakan keamanan Row Level Security.

Pengelompokan data dilakukan berdasarkan domain fungsional, seperti identitas pengguna, data akademik, absensi, asesmen, supervisi, dokumen, dan notifikasi.

**BAB V. ARSITEKTUR APLIKASI DAN MODUL**

**5.1 Modul Autentikasi dan Manajemen Pengguna**

Modul autentikasi berfungsi mengelola proses login, logout, sesi pengguna, serta identifikasi peran.

Setiap akun memiliki identitas yang terhubung dengan profil dan hak akses tertentu.

Sistem harus memastikan bahwa pengguna hanya dapat memasuki ruang dan menjalankan fungsi sesuai peran yang telah ditetapkan.

**5.2 Modul Dashboard**

Dashboard menjadi halaman utama yang menyajikan informasi sesuai kategori pengguna.

Informasi yang ditampilkan dapat mencakup ringkasan kehadiran, aktivitas pembelajaran, status supervisi, notifikasi, serta informasi administratif.

Dashboard kepala sekolah memiliki fokus pada monitoring dan evaluasi, sedangkan dashboard guru, murid, dan orang tua menampilkan informasi sesuai kebutuhan masing-masing.

**5.3 Modul Administrasi Akademik**

Modul akademik mengelola data yang berhubungan dengan proses pembelajaran, meliputi:

- Tahun ajaran dan semester.

- Data kelas.

- Data murid.

- Data guru.

- Mata pelajaran.

- Penugasan guru.

- Modul pembelajaran.

- Tugas dan pengumpulan.

- Asesmen dan hasil penilaian.

- Jurnal kegiatan guru.

- Portofolio murid.

**5.4 Modul Absensi**

Modul absensi menggunakan metode hybrid, yaitu pencatatan secara digital dan pencatatan manual yang kemudian diinput ke dalam sistem.

Modul ini menyediakan fitur pencatatan kehadiran, pengelolaan izin, sakit, alpa, dan dispensasi, rekapitulasi, serta integrasi Excel.

Orang tua dapat menyampaikan laporan ketidakhadiran anak melalui formulir digital. Laporan tersebut kemudian diteruskan kepada pihak sekolah sesuai alur verifikasi yang ditetapkan.

**5.5 Modul Supervisi Akademik**

Modul supervisi digunakan untuk mendukung pelaksanaan supervisi kepala sekolah terhadap guru.

Tahapan supervisi meliputi:

1.  Pra-observasi.

2.  Observasi.

3.  Pasca-observasi.

4.  Tindak lanjut.

Setiap tahapan memiliki status, data pendukung, dan dokumentasi masing-masing.

Sistem menyediakan mekanisme pengisian instrumen, pemberian skor, catatan evaluasi, verifikasi, revisi, serta publikasi hasil supervisi.

**5.6 Modul Manajemen Dokumen**

Modul ini digunakan untuk mengelola dokumen administrasi sekolah dan dokumen pembelajaran guru.

Dokumen dapat diunggah, diperbarui, diverifikasi, dan diarsipkan berdasarkan kategori.

Sistem juga perlu menyediakan riwayat versi dan informasi pemilik dokumen agar perubahan dapat ditelusuri.

**5.7 Modul Tujuh Kebiasaan Anak Indonesia Hebat**

Modul ini dirancang untuk membantu pemantauan penerapan tujuh kebiasaan anak Indonesia hebat.

Murid dapat melakukan pengisian aktivitas harian melalui antarmuka yang sederhana dan mudah dipahami.

Guru dapat memantau rekapitulasi aktivitas kelas, sedangkan kepala sekolah dapat melihat laporan perkembangan pada tingkat sekolah sesuai kewenangannya.

**5.8 Modul Notifikasi dan Komunikasi**

Modul notifikasi menyediakan informasi mengenai kegiatan, perubahan status dokumen, pengumuman, dan pengingat aktivitas.

Notifikasi utama disediakan melalui aplikasi. Integrasi WhatsApp dapat dilakukan melalui fitur click-to-chat pada tahap awal dan WhatsApp Business Platform/API pada tahap pengembangan lanjutan.

**BAB VI. ARSITEKTUR DATABASE DAN PENGELOLAAN DATA**

**6.1 Prinsip Perancangan Database**

Database dirancang dengan pendekatan relasional untuk memastikan hubungan antarentitas dapat dikelola secara konsisten.

Setiap tabel harus memiliki struktur yang jelas, identitas unik, relasi yang tepat, serta aturan validasi yang sesuai dengan kebutuhan bisnis.

**6.2 Pengelompokan Database**

Tabel database dikelompokkan menjadi beberapa domain:

**A. Identity and Access Management**

Mengelola profil, peran, akun, serta hubungan pengguna.

Contoh tabel:

- profiles

- roles

- user_roles

- teachers

- students

- parents

- parent_students

**B. Academic Management**

Mengelola data akademik dan pembelajaran.

Contoh tabel:

- academic_years

- semesters

- classes

- class_students

- subjects

- teacher_assignments

- assignments

- assessments

- assessment_results

**C. Attendance Management**

Mengelola pencatatan dan rekapitulasi kehadiran.

Contoh tabel:

- attendance_sessions

- attendance_records

- attendance_corrections

- attendance_imports

**D. Supervision Management**

Mengelola seluruh tahapan supervisi.

Contoh tabel:

- supervision_periods

- supervision_instruments

- supervision_indicators

- supervision_assignments

- supervision_observations

- supervision_scores

- supervision_verifications

- supervision_publications

**E. Document Management**

Mengelola dokumen dan riwayat versi.

Contoh tabel:

- school_documents

- document_categories

- document_versions

- document_verifications

**F. System Management**

Mengelola aktivitas dan konfigurasi sistem.

Contoh tabel:

- notifications

- audit_logs

- integration_logs

- system_settings

- backup_logs

**6.3 Relasi Antarentitas**

Relasi database harus menggambarkan hubungan antara pengguna, kelas, kegiatan pembelajaran, absensi, supervisi, dan dokumen.

Sebagai contoh, seorang guru dapat memiliki beberapa penugasan kelas. Setiap kelas dapat memiliki banyak murid. Setiap murid dapat memiliki catatan kehadiran dan hasil asesmen. Orang tua dapat terhubung dengan satu atau lebih murid melalui tabel relasi khusus.

**6.4 Pengelolaan dan Integritas Data**

Sistem harus menerapkan:

1.  Primary key untuk identifikasi setiap data.

2.  Foreign key untuk menjaga hubungan antarentitas.

3.  Unique constraint untuk mencegah data duplikat.

4.  Check constraint untuk validasi nilai.

5.  Index untuk meningkatkan performa pencarian.

6.  Transaction untuk operasi yang membutuhkan konsistensi.

7.  Audit log untuk mencatat aktivitas penting.

**BAB VII. ARSITEKTUR AUTENTIKASI DAN OTORISASI**

**7.1 Authentication**

Autentikasi menggunakan Supabase Auth untuk memverifikasi identitas pengguna.

Sistem harus mengelola session, token, proses login, logout, serta pemulihan akun sesuai kebijakan sekolah.

**7.2 Authorization**

Otorisasi menggunakan pendekatan Role-Based Access Control (RBAC) yang dikombinasikan dengan Row Level Security (RLS).

RBAC menentukan tindakan yang dapat dilakukan pengguna berdasarkan perannya, sedangkan RLS membatasi baris data yang dapat diakses berdasarkan identitas dan hubungan pengguna.

**7.3 Pembagian Hak Akses**

- Administrator: pengelolaan sistem dan akun sesuai kewenangan.

- Kepala Sekolah: pengawasan, supervisi, administrasi, dan laporan.

- Guru: pengelolaan pembelajaran dan data kelas yang menjadi tanggung jawabnya.

- Murid: akses terhadap informasi akademik dan aktivitas miliknya.

- Orang Tua: akses terhadap informasi anak yang memiliki hubungan terverifikasi.

Seluruh pembatasan akses harus diterapkan pada backend dan database, bukan hanya melalui pengaturan tampilan frontend.

**BAB VIII. ARSITEKTUR PENYIMPANAN DAN INTEGRASI**

**8.1 Penyimpanan File**

Supabase Storage digunakan sebagai penyimpanan utama dokumen dan berkas pendukung aplikasi.

Database menyimpan metadata file, seperti nama, lokasi penyimpanan, pemilik, kategori, tipe, ukuran, serta waktu unggah.

File yang bersifat pribadi harus disimpan dalam bucket privat dan hanya dapat diakses oleh pengguna yang memiliki izin.

**8.2 Integrasi Microsoft Excel**

Integrasi Excel digunakan untuk mendukung pertukaran data secara dua arah.

Fitur yang direncanakan mencakup:

- Impor data murid dan guru.

- Impor data absensi.

- Ekspor rekapitulasi kehadiran.

- Ekspor nilai dan laporan.

- Validasi format data.

- Deteksi data duplikat.

- Pelaporan kesalahan impor.

**8.3 Integrasi Google Workspace**

Integrasi Google Drive dan Google Sheets digunakan untuk mendukung penyimpanan eksternal, pengelolaan dokumen, serta pertukaran data.

Integrasi dilakukan melalui autentikasi dan izin akses resmi yang diberikan oleh pemilik akun.

**8.4 Integrasi WhatsApp**

Integrasi WhatsApp dilaksanakan secara bertahap.

Tahap pertama menggunakan click-to-chat untuk mempermudah komunikasi dengan orang tua.

Tahap selanjutnya dapat menggunakan WhatsApp Business Platform/API untuk mendukung notifikasi otomatis, dengan mempertimbangkan biaya, persetujuan penerima, serta kebijakan layanan.

**BAB IX. ARSITEKTUR KEAMANAN DAN PERLINDUNGAN DATA**

**9.1 Prinsip Keamanan**

Keamanan sistem diterapkan melalui pendekatan berlapis yang mencakup autentikasi, otorisasi, keamanan database, perlindungan file, komunikasi terenkripsi, dan pencatatan aktivitas.

**9.2 Mekanisme Keamanan**

1.  Autentikasi menggunakan Supabase Auth.

2.  Otorisasi menggunakan RBAC.

3.  Pembatasan data menggunakan RLS.

4.  Komunikasi menggunakan HTTPS.

5.  Penyimpanan file menggunakan bucket privat.

6.  Validasi input pada frontend dan backend.

7.  Perlindungan kredensial dan secret key.

8.  Audit log untuk aktivitas penting.

9.  Pembatasan akses terhadap data sensitif.

10. Pengujian keamanan secara berkala.

**9.3 Perlindungan Data Pengguna**

Sistem mengelola informasi murid, guru, orang tua, hasil asesmen, kehadiran, serta dokumen sekolah.

Pengelolaan data harus memperhatikan prinsip minimalisasi data, pembatasan akses, transparansi penggunaan, retensi, serta ketentuan perlindungan data pribadi yang berlaku.

Informasi pribadi murid tidak boleh ditampilkan atau dibagikan kepada pihak yang tidak memiliki kewenangan.

**BAB X. ARSITEKTUR BACKUP DAN PEMULIHAN SISTEM**

**10.1 Strategi Backup**

SI STIR HEBAT menerapkan strategi pencadangan data secara berkala.

Backup dilakukan melalui dua jadwal utama, yaitu harian dan mingguan.

Penyimpanan cadangan juga direncanakan menggunakan lokasi eksternal untuk mengurangi ketergantungan terhadap satu layanan penyimpanan.

**10.2 Pemulihan Data**

Proses pemulihan dilakukan apabila terjadi kehilangan data, gangguan layanan, kesalahan konfigurasi, atau kerusakan sistem.

Tahapan pemulihan meliputi:

1.  Identifikasi sumber gangguan.

2.  Pemeriksaan ketersediaan backup.

3.  Penentuan titik pemulihan.

4.  Pemulihan database.

5.  Pemulihan file Storage.

6.  Pemeriksaan integritas data.

7.  Pengujian fungsi aplikasi.

8.  Persetujuan operasional sebelum sistem kembali digunakan.

Hak untuk menjalankan pemulihan data hanya diberikan kepada operator teknis yang memiliki kewenangan khusus.

**BAB XI. ARSITEKTUR PERFORMA DAN OFFLINE**

**11.1 Optimalisasi Performa**

Sistem dirancang untuk memberikan pengalaman penggunaan yang responsif pada perangkat dengan spesifikasi terbatas.

Optimalisasi dilakukan melalui:

- Lazy loading.

- Code splitting.

- Kompresi aset.

- Optimasi gambar.

- Pagination.

- Database indexing.

- Caching data.

- Pengurangan request berulang.

- Penggunaan query yang efisien.

**11.2 Dukungan Offline**

Sistem menerapkan dukungan offline terbatas untuk mengantisipasi koneksi internet yang tidak stabil.

Fitur yang dapat dikembangkan meliputi penyimpanan draft, cache halaman tertentu, dan sinkronisasi setelah koneksi kembali tersedia.

Data yang belum dikonfirmasi tersimpan oleh server harus tetap diberi status belum tersinkronisasi. Sistem harus menyediakan mekanisme pencegahan duplikasi dan penanganan konflik data.

**BAB XII. ARSITEKTUR DEPLOYMENT DAN INFRASTRUKTUR**

**12.1 Lingkungan Pengembangan**

Pengembangan dilakukan menggunakan Visual Studio Code sebagai lingkungan kerja utama.

Git digunakan untuk pengelolaan versi, sedangkan GitHub digunakan sebagai repositori kode dan pusat kolaborasi.

**12.2 Lingkungan Sistem**

Sistem dibagi menjadi tiga lingkungan:

**Development:** digunakan untuk proses pengembangan dan pengujian awal.

**Staging:** digunakan untuk memvalidasi fitur, integrasi, dan perubahan sebelum diterapkan pada sistem produksi.

**Production:** digunakan sebagai lingkungan operasional resmi sekolah.

**12.3 Deployment**

Frontend dibangun melalui Vite dan dideploy menggunakan Vercel.

Backend dan database dijalankan melalui layanan Supabase.

Proses deployment harus memperhatikan konfigurasi environment variable, pengujian build, migrasi database, serta validasi sistem setelah pembaruan.

**12.4 Version Control**

Setiap perubahan kode dikelola menggunakan Git dan GitHub.

Penggunaan branch, commit message yang konsisten, pull request, serta peninjauan perubahan dianjurkan untuk menjaga kualitas kode.

**BAB XIII. KEBUTUHAN NON-FUNGSIONAL**

SI STIR HEBAT harus memenuhi kebutuhan non-fungsional berikut:

**1. Availability**

Sistem harus dapat diakses sesuai ketersediaan layanan hosting dan backend.

**2. Performance**

Halaman dan fitur harus memberikan respons yang baik pada kondisi jaringan sekolah.

**3. Security**

Sistem harus melindungi informasi dan membatasi akses sesuai kewenangan.

**4. Compatibility**

Aplikasi harus dapat digunakan pada browser modern.

**5. Responsiveness**

Tampilan harus menyesuaikan ukuran layar smartphone, tablet, dan desktop.

**6. Maintainability**

Kode dan database harus mudah diperbaiki serta dikembangkan.

**7. Reliability**

Sistem harus memiliki mekanisme pencadangan dan pemulihan data.

**8. Scalability**

Arsitektur harus mendukung pertumbuhan jumlah data dan penambahan fitur dalam skala kebutuhan sekolah.

**9. Usability**

Antarmuka harus mudah dipahami oleh kepala sekolah, guru, murid, dan orang tua.

**10. Data Integrity**

Setiap proses perubahan data harus menjaga konsistensi dan keakuratan informasi.

**BAB XIV. RISIKO TEKNIS DAN MITIGASI**

Beberapa risiko teknis yang berpotensi muncul selama pengembangan dan operasional SI STIR HEBAT meliputi:

1.  **Kebocoran data:** diatasi melalui RLS, pembatasan akses, enkripsi komunikasi, dan audit log.

2.  **Kesalahan hak akses:** diatasi melalui pengujian RBAC dan validasi relasi pengguna.

3.  **Duplikasi data absensi:** diatasi dengan unique constraint dan validasi transaksi.

4.  **Kegagalan integrasi Excel:** diatasi melalui validasi format dan mekanisme pelaporan kesalahan.

5.  **Koneksi internet tidak stabil:** diatasi melalui penyimpanan draft dan sinkronisasi terkontrol.

6.  **Kehilangan file:** diatasi melalui pencadangan database dan Storage secara terpisah.

7.  **Kesalahan publikasi supervisi:** diatasi melalui mekanisme verifikasi dan persetujuan.

8.  **Gangguan deployment:** diatasi melalui staging, pengujian, dan prosedur rollback.

**BAB XV. TAHAPAN IMPLEMENTASI**

Implementasi SI STIR HEBAT dilakukan secara bertahap agar setiap modul dapat diuji sebelum sistem diperluas.

**Phase 1 – System Foundation**

- Persiapan repositori GitHub.

- Setup React, Vite, dan TypeScript.

- Setup Supabase.

- Perancangan database awal.

- Implementasi autentikasi.

- Implementasi RBAC dan RLS.

- Pembuatan struktur dashboard.

**Phase 2 – Core School Management**

- Manajemen akun.

- Data guru dan murid.

- Manajemen kelas.

- Tahun ajaran dan semester.

- Sistem absensi.

- Dashboard monitoring.

**Phase 3 – Academic Management**

- Perangkat pembelajaran.

- Tugas dan pengumpulan.

- Asesmen dan hasil belajar.

- Jurnal kegiatan guru.

- Portofolio murid.

- Refleksi orang tua.

**Phase 4 – Supervision and Administration**

- Instrumen supervisi.

- Pra-observasi.

- Observasi.

- Pasca-observasi.

- Tindak lanjut.

- Verifikasi dokumen.

- Pengelolaan administrasi sekolah.

**Phase 5 – External Integrations**

- Excel import dan export.

- Google Drive.

- Google Sheets.

- WhatsApp.

- Sistem notifikasi.

**Phase 6 – Quality Assurance**

- Pengujian fungsional.

- Pengujian keamanan.

- Pengujian performa.

- Pengujian offline.

- Pengujian backup dan restore.

- User Acceptance Testing.

**Phase 7 – Production Deployment**

- Deployment aplikasi.

- Konfigurasi sistem produksi.

- Migrasi data.

- Pelatihan pengguna.

- Dokumentasi penggunaan.

- Monitoring dan pemeliharaan.

**BAB XVI. KESIMPULAN**

System Architecture Document SI STIR HEBAT menjadi dasar teknis dalam pengembangan sistem informasi sekolah yang terintegrasi, modular, aman, dan mudah dikembangkan.

Arsitektur yang dirancang memisahkan tanggung jawab antara antarmuka pengguna, layanan aplikasi, database, dan integrasi eksternal. Pendekatan ini memungkinkan setiap modul bekerja secara terstruktur dengan tetap menggunakan sumber data terpusat.

Penggunaan React, Vite, TypeScript, Supabase, dan PostgreSQL dipilih untuk membangun fondasi aplikasi yang efisien serta mendukung kebutuhan pengelolaan sekolah.

Implementasi sistem harus dilakukan secara bertahap dengan memprioritaskan fondasi autentikasi, database, keamanan, dan manajemen pengguna sebelum mengembangkan fitur akademik, supervisi, administrasi, serta integrasi lanjutan.

Dengan adanya dokumen ini, proses pengembangan SI STIR HEBAT diharapkan memiliki arah teknis yang jelas, konsisten, terdokumentasi, dan sesuai dengan kebutuhan operasional SDN 03 Wonosari.

**AKHIR DOKUMEN**

*System Architecture Document (SAD) – SI STIR HEBAT, Versi 1.0.*
