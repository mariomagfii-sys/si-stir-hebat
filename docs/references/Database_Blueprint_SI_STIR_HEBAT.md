**SI STIR HEBAT**

**DATABASE  
BLUEPRINT**

Dokumen Perancangan Basis Data

**Sistem Informasi Supervisi Terintegrasi  
Ruang Guru, Ruang Murid, Ruang Orang Tua**

SDN 03 Wonosari  
Versi Dokumen 1.0  
3 November 2026

**DOKUMEN PERANCANGAN TEKNIS**

# Informasi Dokumen

| **Elemen**         | **Keterangan**                                                                   |
|--------------------|----------------------------------------------------------------------------------|
| Nama sistem        | SI STIR HEBAT                                                                    |
| Nama lengkap       | Sistem Informasi Supervisi Terintegrasi Ruang Guru, Ruang Murid, Ruang Orang Tua |
| Institusi          | SDN 03 Wonosari                                                                  |
| Jenis dokumen      | Database Blueprint                                                               |
| Versi              | 1.0                                                                              |
| Tanggal            | 3 November 2026                                                                  |
| Database utama     | Supabase PostgreSQL                                                              |
| Autentikasi        | Supabase Auth                                                                    |
| Penyimpanan berkas | Supabase Storage                                                                 |
| Kontrol akses      | RBAC dan Row Level Security (RLS)                                                |
| Status             | Rancangan teknis untuk ditinjau dan divalidasi sebelum implementasi              |

## Riwayat Perubahan

| **Versi** | **Tanggal**     | **Deskripsi**                                     |
|-----------|-----------------|---------------------------------------------------|
| 1.0       | 3 November 2026 | Penyusunan awal Database Blueprint SI STIR HEBAT. |

# Daftar Isi

- 1\. Pendahuluan dan Tujuan

- 2\. Ruang Lingkup dan Prinsip Perancangan

- 3\. Arsitektur Database

- 4\. Domain Data dan Struktur Tabel

- 5\. Relasi dan Aturan Integritas

- 6\. Keamanan, RBAC, dan RLS

- 7\. Supabase Storage

- 8\. Integrasi Excel

- 9\. Indeks dan Optimasi

- 10\. Backup dan Pemulihan

- 11\. Tahapan Implementasi

- 12\. Keputusan yang Perlu Dikonfirmasi

- 13\. Kriteria Penerimaan

- 14\. Rekomendasi dan Penutup

# 1. Pendahuluan dan Tujuan

SI STIR HEBAT merupakan sistem informasi sekolah berbasis web yang dirancang untuk mengintegrasikan kegiatan administrasi, pembelajaran, supervisi, kehadiran, perkembangan siswa, dan komunikasi antara sekolah dengan orang tua. Database menjadi fondasi utama agar setiap modul menggunakan data yang konsisten, terstruktur, dan dapat dipertanggungjawabkan.

Dokumen Database Blueprint ini menjelaskan rancangan struktur basis data, hubungan antartabel, aturan integritas, kebijakan keamanan, penyimpanan berkas, integrasi Excel, serta tahapan implementasi. Dokumen menjadi acuan bagi pengembang, administrator sistem, dan pihak sekolah ketika membangun maupun memelihara SI STIR HEBAT.

## 1.1 Tujuan

- Menetapkan struktur data yang mendukung seluruh modul SI STIR HEBAT.

- Menyediakan satu sumber data utama untuk mengurangi duplikasi dan inkonsistensi.

- Menentukan hubungan data siswa, guru, kelas, orang tua, pembelajaran, dan supervisi.

- Menetapkan standar keamanan dan pembatasan akses berdasarkan peran pengguna.

- Mendukung pencatatan kehadiran secara hybrid serta pertukaran data melalui Excel.

- Menjadi dasar penyusunan migration SQL, API, dan pengujian database.

# 2. Ruang Lingkup dan Prinsip Perancangan

Rancangan mencakup data identitas dan hak akses, data akademik, data siswa dan guru, kehadiran, pembelajaran, supervisi, perkembangan siswa, administrasi sekolah, notifikasi, audit, serta integrasi.

## 2.1 Prinsip

- Integrasi: seluruh modul menggunakan struktur data yang saling terhubung.

- Normalisasi: data disimpan secara terstruktur untuk mengurangi redundansi.

- Integritas referensial: relasi dijaga dengan primary key, foreign key, dan constraint.

- Least privilege: pengguna hanya memperoleh akses minimum yang dibutuhkan.

- Auditabilitas: perubahan penting dapat ditelusuri melalui log.

- Privasi sejak perancangan: data pribadi siswa dilindungi sejak tahap desain.

- Skalabilitas: skema dapat berkembang mengikuti kebutuhan sekolah.

- Migrasi terkendali: perubahan struktur dilakukan melalui migration yang terdokumentasi.

## 2.2 Teknologi

| **Komponen**        | **Teknologi / Peran**                                         |
|---------------------|---------------------------------------------------------------|
| Frontend            | React + Vite                                                  |
| Database            | Supabase PostgreSQL                                           |
| Authentication      | Supabase Auth                                                 |
| File storage        | Supabase Storage                                              |
| Authorization       | Role-Based Access Control (RBAC) dan Row Level Security (RLS) |
| Integrasi data      | Excel XLSX dan CSV                                            |
| Version control     | GitHub                                                        |
| Deployment frontend | Vercel atau Cloudflare Pages, sesuai konfigurasi proyek       |

# 3. Arsitektur Database

Frontend berkomunikasi dengan Supabase melalui Supabase Client menggunakan koneksi HTTPS. Autentikasi dikelola oleh Supabase Auth, sedangkan PostgreSQL menyimpan data aplikasi. Kebijakan RLS diterapkan untuk membatasi akses pada tingkat database. Supabase Storage digunakan untuk dokumen dan lampiran, sementara integrasi Excel diproses melalui alur validasi sebelum data disimpan.

| **Lapisan**                           | **Tanggung jawab**                                                |
|---------------------------------------|-------------------------------------------------------------------|
| React + Vite                          | Antarmuka, navigasi, formulir, dan tampilan berdasarkan role.     |
| Supabase Auth                         | Autentikasi dan identitas akun pengguna.                          |
| Application services / Edge Functions | Validasi proses bisnis dan operasi yang memerlukan hak server.    |
| PostgreSQL                            | Penyimpanan relasional, constraint, transaksi, dan query.         |
| RLS                                   | Pembatasan akses baris data berdasarkan identitas dan kewenangan. |
| Supabase Storage                      | Penyimpanan dokumen, foto, dan lampiran.                          |
| Excel integration                     | Impor, validasi, pratinjau, ekspor, dan pencatatan proses.        |

PostgreSQL ditetapkan sebagai single source of truth. File Excel bukan database utama dan tidak boleh menjadi satu-satunya tempat penyimpanan data operasional.

# 4. Domain Data dan Struktur Tabel

Nama tabel menggunakan format snake_case. Primary key utama direkomendasikan menggunakan UUID. Kolom waktu menggunakan TIMESTAMPTZ agar informasi waktu tersimpan secara konsisten. Tipe data dan constraint final perlu disesuaikan dengan hasil audit skema Supabase.

## 4.1 Identity and Access Management

| **Tabel**       | **Kolom utama**                                                                                                                 | **Keterangan**                                                    |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| profiles        | id UUID PK/FK auth.users.id; full_name TEXT; email TEXT; phone TEXT; avatar_url TEXT; is_active BOOLEAN; created_at; updated_at | Profil aplikasi yang terhubung dengan akun Supabase Auth.         |
| user_roles      | id UUID PK; user_id UUID FK; role TEXT/ENUM; assigned_by UUID; created_at                                                       | Pemetaan pengguna ke role; kombinasi user_id dan role harus unik. |
| school_settings | id UUID PK; school_name; address; phone; email; logo_url; updated_at                                                            | Identitas dan konfigurasi sekolah.                                |

Role yang direncanakan: admin, principal, teacher, student, parent, dan staff. Daftar role harus dikendalikan melalui definisi yang konsisten, misalnya ENUM PostgreSQL atau tabel referensi. Jika satu akun dapat memiliki beberapa role, tabel user_roles menjadi relasi satu-ke-banyak dari profiles.

## 4.2 School Management

| **Tabel**           | **Kolom utama**                                                    | **Keterangan**                                                      |
|---------------------|--------------------------------------------------------------------|---------------------------------------------------------------------|
| academic_years      | id; name; start_date; end_date; is_active                          | Periode tahun ajaran.                                               |
| semesters           | id; academic_year_id FK; name; start_date; end_date                | Semester dalam tahun ajaran.                                        |
| classes             | id; name; grade_level; homeroom_teacher_id; academic_year_id FK    | Data rombongan belajar.                                             |
| subjects            | id; name; subject_code; description                                | Data mata pelajaran.                                                |
| teacher_assignments | id; teacher_id FK; class_id FK; subject_id FK; academic_year_id FK | Penugasan guru berdasarkan kelas, mata pelajaran, dan tahun ajaran. |

Data kelas dan penugasan harus mempertahankan konteks tahun ajaran agar riwayat tahun sebelumnya tetap tersedia dan tidak tertimpa.

## 4.3 Student Management

| **Tabel**                    | **Kolom utama**                                                                                                      | **Keterangan**                                                           |
|------------------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| students                     | id UUID PK; user_id UUID FK nullable; student_number; full_name; birth_date; gender; address; admission_date; status | Data induk siswa. user_id dapat kosong jika siswa belum memiliki akun.   |
| class_memberships            | id; student_id FK; class_id FK; academic_year_id FK; start_date; end_date; status                                    | Riwayat penempatan siswa pada kelas.                                     |
| parents                      | id; user_id FK; occupation; address                                                                                  | Data orang tua atau wali yang terhubung ke profil pengguna.              |
| student_parent_relationships | id; student_id FK; parent_id FK; relationship_type; is_verified                                                      | Relasi siswa dan orang tua/wali; mendukung banyak wali untuk satu siswa. |

Nomor induk siswa dan NISN, jika digunakan, harus diperlakukan sebagai atribut identitas yang berbeda. Penetapan identitas utama perlu mengikuti kebijakan administrasi sekolah. Relasi orang tua-siswa harus diverifikasi sebelum akses portal orang tua diberikan.

## 4.4 Teacher Management

| **Tabel**        | **Kolom utama**                                                                                                                             | **Keterangan**                     |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| teachers         | id; user_id FK; employee_number; full_name; employment_status; specialization; is_active                                                    | Data induk guru.                   |
| teacher_journals | id; teacher_id FK; class_id FK; subject_id FK; academic_year_id FK; activity_date; topic; activity_description; reflection; attachment_path | Jurnal kegiatan dan refleksi guru. |
| teacher_tasks    | id; teacher_id FK; title; description; priority; due_date; status; completed_at                                                             | Daftar tugas dan pekerjaan guru.   |

Identitas guru pada tabel teachers sebaiknya terhubung ke profiles melalui user_id. Nomor pegawai/NIP/NUPTK disimpan hanya jika tersedia dan relevan.

## 4.5 Attendance Management

| **Tabel**                 | **Kolom utama**                                                                                                                          | **Keterangan**                                   |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| attendance_sessions       | id; class_id FK; academic_year_id FK; attendance_date; session_type; opened_by; status                                                   | Sesi kehadiran untuk kelas dan tanggal tertentu. |
| attendance_records        | id; session_id FK; student_id FK; status; recorded_by; recording_method; recorded_at; notes; source_reference                            | Catatan kehadiran setiap siswa.                  |
| attendance_corrections    | id; attendance_record_id FK; requested_by; approved_by; old_status; requested_status; reason; approval_status; requested_at; reviewed_at | Pengajuan dan persetujuan koreksi kehadiran.     |
| attendance_import_batches | id; file_name; uploaded_by; status; total_rows; success_rows; failed_rows                                                                | Riwayat batch impor kehadiran.                   |
| attendance_export_logs    | id; exported_by; export_type; filters; file_path; created_at                                                                             | Riwayat ekspor data kehadiran.                   |

Metode pencatatan yang direncanakan adalah hybrid, mencakup pencatatan manual, QR Code, dan impor Excel. Pencatatan berbasis lokasi hanya dapat ditambahkan jika disetujui sekolah dan memiliki dasar kebutuhan yang jelas. GPS tidak boleh dianggap sebagai bukti kehadiran yang selalu akurat.

Status kehadiran yang disarankan: present (hadir), sick (sakit), excused (izin), absent (alpa), late (terlambat), dan dispensation (dispensasi). Status final perlu disepakati dengan sekolah.

Constraint penting: kombinasi session_id dan student_id pada attendance_records harus unik untuk mencegah pencatatan ganda dalam satu sesi.

## 4.6 Learning Management

| **Tabel**          | **Kolom utama**                                                                                               | **Keterangan**                                 |
|--------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------------------|
| learning_modules   | id; teacher_id FK; class_id FK; subject_id FK; title; description; document_path; status                      | Modul ajar dan status pengajuannya.            |
| learning_materials | id; teacher_id FK; class_id FK; subject_id FK; title; content; file_path; published_at                        | Materi pembelajaran yang dapat dipublikasikan. |
| assessments        | id; teacher_id FK; class_id FK; subject_id FK; title; assessment_type; assessment_date; maximum_score; status | Instrumen atau kegiatan asesmen.               |
| assessment_results | id; assessment_id FK; student_id FK; score; feedback; graded_by; published_at                                 | Hasil asesmen per siswa.                       |

Hasil asesmen perlu memiliki aturan publikasi. Murid dan orang tua hanya dapat melihat hasil yang telah dipublikasikan dan sesuai dengan hak aksesnya. Constraint hasil penilaian perlu mencegah duplikasi untuk asesmen dan siswa yang sama, kecuali sekolah menetapkan mekanisme percobaan berulang.

## 4.7 Supervision Management

| **Tabel**               | **Kolom utama**                                                              | **Keterangan**                        |
|-------------------------|------------------------------------------------------------------------------|---------------------------------------|
| supervision_periods     | id; name; start_date; end_date; status                                       | Periode pelaksanaan supervisi.        |
| supervision_instruments | id; name; description; version; is_active                                    | Instrumen supervisi dan versinya.     |
| supervision_indicators  | id; instrument_id FK; category; indicator_text; weight; sort_order           | Indikator penilaian dalam instrumen.  |
| supervision_assignments | id; period_id FK; supervisor_id; teacher_id; scheduled_at; status            | Penugasan supervisor kepada guru.     |
| supervision_results     | id; assignment_id FK; summary; total_score; recommendation; submitted_at     | Ringkasan hasil supervisi.            |
| supervision_assessments | id; assignment_id FK; indicator_id FK; score; notes; evidence_path           | Penilaian per indikator.              |
| supervision_followups   | id; assignment_id FK; teacher_id; action_plan; due_date; status; reviewed_by | Rencana dan pemantauan tindak lanjut. |

Skala penilaian, bobot, kategori indikator, dan tahapan persetujuan harus mengikuti instrumen resmi sekolah. Versi instrumen perlu dipertahankan agar hasil supervisi lama tetap dapat ditafsirkan sesuai instrumen pada saat penilaian dilakukan.

Akses ke hasil supervisi harus dibatasi secara ketat kepada pihak yang memiliki kewenangan, misalnya supervisor, kepala sekolah, dan guru terkait sesuai kebijakan sekolah.

## 4.8 Student Development

| **Tabel**                   | **Kolom utama**                                                                                | **Keterangan**                            |
|-----------------------------|------------------------------------------------------------------------------------------------|-------------------------------------------|
| habit_categories            | id; name; description; is_active                                                               | Kategori pembiasaan atau kebiasaan siswa. |
| habit_records               | id; student_id FK; category_id FK; record_date; status; notes; recorded_by                     | Catatan pelaksanaan kebiasaan siswa.      |
| student_development_reports | id; student_id FK; academic_year_id FK; period_start; period_end; summary; prepared_by; status | Laporan perkembangan siswa.               |
| student_achievements        | id; student_id FK; title; description; achievement_date; level; evidence_path                  | Prestasi dan pencapaian siswa.            |

Data perkembangan siswa harus digunakan untuk mendukung pembinaan dan komunikasi pendidikan. Pengumpulan data dibatasi pada informasi yang relevan dan diperlukan.

## 4.9 School Administration

| **Tabel**        | **Kolom utama**                                                                                                                   | **Keterangan**                                            |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| school_documents | id; title; document_type; document_number; academic_year_id FK; file_path; version; status; uploaded_by; approved_by; approved_at | Metadata KSP, RKT, RKAS, SK, dan dokumen sekolah lainnya. |
| announcements    | id; title; content; created_by; target_role; target_class_id; published_at; expires_at; status                                    | Pengumuman dengan target audiens.                         |
| notifications    | id; recipient_id; title; message; notification_type; reference_table; reference_id; is_read; read_at; created_at                  | Notifikasi kepada pengguna.                               |

File dokumen disimpan di Supabase Storage. Database menyimpan metadata dan path file. Pengaturan versi dokumen disarankan agar perubahan tidak menghilangkan arsip sebelumnya.

## 4.10 System Monitoring and Integration

| **Tabel**        | **Kolom utama**                                                                              | **Keterangan**                   |
|------------------|----------------------------------------------------------------------------------------------|----------------------------------|
| audit_logs       | id; actor_id; action; entity_type; entity_id; old_values; new_values; ip_address; created_at | Catatan aktivitas penting.       |
| system_settings  | id; setting_key; setting_value; updated_by; updated_at                                       | Konfigurasi sistem.              |
| import_batches   | id; file_name; import_type; uploaded_by; status; total_rows; success_rows; failed_rows       | Riwayat impor data umum.         |
| integration_logs | id; integration_type; event_type; status; message; created_at                                | Log integrasi dan proses sistem. |

Audit log tidak boleh menyimpan password, access token, refresh token, atau rahasia autentikasi. Akses terhadap log harus dibatasi kepada administrator atau petugas teknis yang berwenang.

# 5. Relasi dan Aturan Integritas

## 5.1 Relasi utama

- auth.users memiliki relasi satu-ke-satu dengan profiles.

- profiles memiliki relasi satu-ke-banyak dengan user_roles.

- academic_years memiliki banyak semesters, classes, dan teacher_assignments.

- teachers terhubung ke kelas dan mata pelajaran melalui teacher_assignments.

- students terhubung ke kelas melalui class_memberships untuk mempertahankan riwayat kelas.

- students dan parents memiliki relasi banyak-ke-banyak melalui student_parent_relationships.

- attendance_sessions memiliki banyak attendance_records.

- assessments memiliki banyak assessment_results.

- supervision_periods memiliki banyak supervision_assignments.

- supervision_assignments memiliki hasil indikator, ringkasan, dan tindak lanjut.

## 5.2 Standar integritas

| **Aspek**   | **Ketentuan**                                                                                           |
|-------------|---------------------------------------------------------------------------------------------------------|
| Primary key | Gunakan UUID untuk identitas utama.                                                                     |
| Foreign key | Pastikan setiap referensi mengarah ke data yang valid.                                                  |
| Unique      | Terapkan pada email/nomor identitas yang memang harus unik dan kombinasi relasi yang tidak boleh ganda. |
| NOT NULL    | Gunakan pada atribut wajib sesuai proses bisnis.                                                        |
| CHECK       | Validasi rentang nilai, tanggal, dan status.                                                            |
| Timestamp   | Gunakan TIMESTAMPTZ untuk waktu pencatatan.                                                             |
| Penghapusan | Tentukan ON DELETE secara eksplisit; hindari cascade pada data historis yang perlu dipertahankan.       |
| Soft delete | Gunakan status arsip/nonaktif apabila data harus tetap tersedia untuk audit.                            |
| Transaksi   | Gunakan transaksi untuk proses yang melibatkan beberapa tabel.                                          |
| Migrasi     | Seluruh perubahan skema harus dicatat dalam file migration.                                             |

## 5.3 Contoh validasi bisnis

- Tanggal akhir tahun ajaran tidak boleh lebih awal daripada tanggal mulai.

- Nilai asesmen tidak boleh melebihi nilai maksimum yang ditentukan.

- Satu siswa tidak boleh memiliki dua catatan pada sesi kehadiran yang sama.

- Satu pengguna tidak boleh memiliki role yang sama lebih dari satu kali.

- Satu siswa hanya memiliki satu keanggotaan kelas aktif pada tahun ajaran yang sama, kecuali ada aturan khusus yang disetujui.

# 6. Keamanan, RBAC, dan RLS

Keamanan harus diterapkan pada lapisan database, bukan hanya melalui pembatasan tampilan pada frontend. Semua tabel yang terekspos melalui Supabase API harus memiliki kebijakan RLS yang sesuai. Kebijakan harus diuji menggunakan akun untuk setiap role.

| **Role**            | **Ruang lingkup akses yang direncanakan**                              |
|---------------------|------------------------------------------------------------------------|
| Admin               | Mengelola data dan konfigurasi sesuai tanggung jawab administrasi.     |
| Kepala sekolah      | Mengakses supervisi, laporan, dan dokumen sekolah sesuai kewenangan.   |
| Guru                | Mengakses kelas, pembelajaran, dan data siswa sesuai penugasan.        |
| Murid               | Mengakses data pribadi dan informasi pembelajaran yang dipublikasikan. |
| Orang tua           | Mengakses data anak yang relasinya telah diverifikasi.                 |
| Tenaga kependidikan | Mengakses modul sesuai penugasan.                                      |

## 6.1 Ketentuan keamanan

- Gunakan Supabase Auth untuk autentikasi; jangan menyimpan password pada tabel aplikasi.

- Terapkan RBAC dan RLS untuk operasi SELECT, INSERT, UPDATE, dan DELETE.

- Verifikasi relasi orang tua-siswa sebelum mengizinkan akses.

- Batasi akses guru berdasarkan kelas dan penugasan yang berlaku.

- Batasi akses murid pada data miliknya sendiri.

- Lindungi hasil supervisi dari pengguna yang tidak berkepentingan.

- Jangan menempatkan service_role key pada frontend atau repository publik.

- Simpan secret pada environment variables atau secret manager.

- Validasi input dan file pada sisi server.

- Catat aktivitas sensitif dalam audit log.

## 6.2 Contoh kebijakan RLS untuk profil

> ALTER TABLE public.profiles  
> ENABLE ROW LEVEL SECURITY;  
>   
> CREATE POLICY "Users can view own profile"  
> ON public.profiles  
> FOR SELECT  
> TO authenticated  
> USING (id = auth.uid());  
>   
> CREATE POLICY "Users can update own profile"  
> ON public.profiles  
> FOR UPDATE  
> TO authenticated  
> USING (id = auth.uid())  
> WITH CHECK (id = auth.uid());

Contoh di atas merupakan kebijakan dasar, bukan keseluruhan kebijakan produksi. Kebijakan admin dan role lain harus dirancang sesuai RBAC. Fungsi pemeriksaan role perlu dibuat dengan hati-hati agar tidak menimbulkan rekursi RLS atau membuka akses yang tidak semestinya.

# 7. Supabase Storage

Dokumen dan lampiran disimpan dalam Supabase Storage, sedangkan PostgreSQL menyimpan metadata, pemilik, kategori, dan path file. Bucket yang berisi dokumen internal atau data pribadi harus bersifat private.

| **Bucket**           | **Jenis file**         | **Kebijakan akses**                        |
|----------------------|------------------------|--------------------------------------------|
| profile-avatars      | Foto profil            | Terbatas sesuai kebutuhan tampilan profil. |
| student-documents    | Dokumen siswa          | Private; hanya pihak berwenang.            |
| learning-materials   | Materi pembelajaran    | Sesuai kelas dan penugasan.                |
| teacher-documents    | Dokumen guru           | Private.                                   |
| supervision-evidence | Bukti supervisi        | Sangat terbatas.                           |
| school-documents     | KSP, RKT, RKAS, SK     | Private; sesuai kewenangan.                |
| attendance-exports   | Hasil ekspor kehadiran | Private; pembuat dan pihak berwenang.      |
| import-files         | File sumber impor      | Private; petugas yang memproses.           |

- Validasi tipe MIME dan ukuran file.

- Gunakan nama file dan struktur folder yang aman.

- Simpan path dan metadata file pada tabel terkait.

- Gunakan signed URL dengan masa berlaku terbatas bila diperlukan.

- Jangan menempatkan dokumen sensitif pada bucket publik.

- Tetapkan prosedur penghapusan dan retensi file.

# 8. Integrasi Excel

## 8.1 Proses impor

1.  Pengguna memilih dan mengunggah file XLSX atau CSV.

2.  Sistem memvalidasi format file, ukuran, dan struktur kolom.

3.  Sistem memeriksa data kosong, duplikat, dan format yang tidak sesuai.

4.  Sistem menampilkan pratinjau dan ringkasan kesalahan.

5.  Pengguna yang berwenang mengonfirmasi proses impor.

6.  Backend memproses data secara terkontrol dan menggunakan transaksi bila sesuai.

7.  Sistem menyimpan ringkasan hasil ke tabel import_batches atau attendance_import_batches.

## 8.2 Proses ekspor

8.  Pengguna memilih jenis laporan dan filter.

9.  Sistem memverifikasi kewenangan pengguna.

10. Backend mengambil data sesuai filter dan cakupan akses.

11. Sistem membuat file XLSX atau CSV.

12. File diberikan melalui jalur unduhan yang aman.

13. Aktivitas ekspor dicatat dalam attendance_export_logs atau log ekspor terkait.

Format yang disarankan adalah XLSX untuk laporan terstruktur dan CSV untuk pertukaran data sederhana. Setiap template perlu memiliki dokumentasi nama kolom, tipe data, format tanggal, serta aturan validasi. Excel berfungsi sebagai media pertukaran data, bukan sumber data utama.

# 9. Indeks dan Optimasi

Indeks disarankan pada kolom yang sering digunakan untuk pencarian, filter, pengurutan, join, dan pemeriksaan kebijakan akses. Indeks final perlu ditentukan berdasarkan pola query dan hasil pemantauan performa.

| **Tabel**               | **Kolom yang disarankan**              |
|-------------------------|----------------------------------------|
| profiles                | id, email                              |
| user_roles              | user_id, role                          |
| students                | student_number, full_name              |
| teachers                | user_id, employee_number               |
| class_memberships       | student_id, class_id, academic_year_id |
| teacher_assignments     | teacher_id, class_id, academic_year_id |
| attendance_sessions     | class_id, attendance_date              |
| attendance_records      | session_id, student_id, status         |
| assessments             | teacher_id, class_id, assessment_date  |
| assessment_results      | assessment_id, student_id              |
| supervision_assignments | teacher_id, supervisor_id, period_id   |
| notifications           | recipient_id, is_read, created_at      |
| audit_logs              | actor_id, entity_type, created_at      |

- Gunakan pagination pada daftar dengan jumlah data besar.

- Pilih kolom yang diperlukan; hindari SELECT \* pada query produksi yang tidak membutuhkannya.

- Periksa query dengan EXPLAIN ANALYZE ketika terjadi perlambatan.

- Hindari indeks berlebihan karena dapat memperlambat operasi tulis.

- Tinjau indeks yang digunakan oleh filter RLS dan foreign key.

# 10. Backup dan Pemulihan

Strategi backup harus mengikuti kemampuan paket Supabase yang digunakan dan kebijakan operasional sekolah. Backup database dan file Storage perlu diperhitungkan secara terpisah.

- Aktifkan backup sesuai paket dan konfigurasi Supabase.

- Tetapkan jadwal, retensi, dan lokasi penyimpanan salinan cadangan.

- Lindungi backup dengan enkripsi dan pembatasan akses.

- Uji pemulihan secara berkala pada lingkungan terpisah.

- Dokumentasikan prosedur pemulihan dan penanggung jawabnya.

- Tentukan RPO dan RTO bersama pihak sekolah berdasarkan kebutuhan operasional.

# 11. Tahapan Implementasi

| **Tahap**            | **Pekerjaan utama**                                                                   | **Hasil yang diharapkan**       |
|----------------------|---------------------------------------------------------------------------------------|---------------------------------|
| 1\. Audit            | Periksa skema Supabase, tabel, kolom, relasi, kebijakan RLS, dan data yang sudah ada. | Laporan kondisi database.       |
| 2\. Foundation       | Profil, role, pengaturan sekolah, tahun ajaran, dan semester.                         | Fondasi identitas dan akademik. |
| 3\. School Data      | Guru, siswa, kelas, orang tua, dan penugasan.                                         | Data master dan relasi sekolah. |
| 4\. Attendance       | Sesi, catatan, koreksi, dan log impor/ekspor.                                         | Modul kehadiran.                |
| 5\. Learning         | Modul ajar, materi, asesmen, dan hasil.                                               | Database pembelajaran.          |
| 6\. Supervision      | Periode, instrumen, indikator, penugasan, hasil, tindak lanjut.                       | Database supervisi.             |
| 7\. Administration   | Dokumen, pengumuman, notifikasi.                                                      | Administrasi sekolah.           |
| 8\. Integration      | Excel, audit log, dan log integrasi.                                                  | Pertukaran data dan monitoring. |
| 9\. Security Testing | Uji RLS, RBAC, Storage, dan akses lintas role.                                        | Validasi keamanan.              |

Setiap tahap harus diuji sebelum melanjutkan ke tahap berikutnya. Migrasi produksi harus dilakukan setelah backup dan persetujuan pihak yang berwenang.

# 12. Keputusan yang Perlu Dikonfirmasi

Beberapa keputusan operasional belum ditetapkan secara final. Keputusan tersebut perlu dikonfirmasi sebelum pembuatan migration SQL dan kebijakan RLS produksi.

| **No.** | **Topik**       | **Keputusan yang diperlukan**                                                   |
|---------|-----------------|---------------------------------------------------------------------------------|
| 1       | Struktur akun   | Apakah seluruh siswa dan orang tua akan memiliki akun sendiri?                  |
| 2       | Multi-role      | Apakah satu akun boleh memiliki lebih dari satu role?                           |
| 3       | Identitas siswa | Apakah NIS, NISN, atau nomor internal menjadi identitas utama?                  |
| 4       | Riwayat kelas   | Bagaimana aturan kenaikan kelas, perpindahan, dan alumni?                       |
| 5       | Kehadiran       | Metode mana yang akan diaktifkan: manual, QR, impor, atau lokasi?               |
| 6       | Excel           | Apakah sekolah telah memiliki template resmi untuk impor dan ekspor?            |
| 7       | Supervisi       | Siapa yang dapat melihat, mengesahkan, dan menindaklanjuti hasil supervisi?     |
| 8       | Nilai           | Kapan hasil asesmen boleh dilihat siswa dan orang tua?                          |
| 9       | Dokumen         | Siapa yang dapat mengunggah, merevisi, dan menyetujui KSP, RKT, RKAS, serta SK? |
| 10      | Retensi         | Berapa lama data siswa, dokumen, dan log harus disimpan?                        |

# 13. Kriteria Penerimaan

Database dinyatakan siap untuk diintegrasikan ke aplikasi apabila seluruh kriteria berikut telah dipenuhi dan diuji.

- [ ] Seluruh tabel utama dibuat dan terdokumentasi.

- [ ] Primary key, foreign key, dan constraint telah diterapkan.

- [ ] Relasi siswa, orang tua, guru, kelas, dan tahun ajaran berjalan dengan benar.

- [ ] Riwayat kelas dan penugasan tidak menimpa data tahun sebelumnya.

- [ ] Pencatatan kehadiran mencegah duplikasi.

- [ ] Data asesmen tersimpan sesuai siswa, kelas, dan mata pelajaran.

- [ ] Data supervisi memiliki relasi indikator, hasil, dan tindak lanjut yang benar.

- [ ] RLS diterapkan pada seluruh tabel yang terekspos sesuai kebutuhan.

- [ ] Pengujian akses setiap role berhasil.

- [ ] Storage memiliki kebijakan akses yang tepat.

- [ ] Impor dan ekspor Excel dapat dijalankan dan dicatat.

- [ ] Audit log merekam aktivitas penting tanpa menyimpan rahasia autentikasi.

- [ ] Backup dan prosedur pemulihan telah diuji.

- [ ] Migrasi tidak merusak data yang sudah ada.

# 14. Rekomendasi dan Penutup

Database Blueprint ini menjadi rancangan dasar pengembangan database SI STIR HEBAT. Rancangan menempatkan PostgreSQL sebagai sumber data utama, Supabase Auth sebagai layanan autentikasi, Supabase Storage sebagai penyimpanan file, serta RBAC dan RLS sebagai mekanisme pengendalian akses.

Langkah teknis berikutnya adalah melakukan audit terhadap database Supabase yang saat ini digunakan. Hasil audit harus dibandingkan dengan rancangan ini untuk mengidentifikasi tabel yang sudah tersedia, struktur yang perlu disesuaikan, relasi yang belum ada, dan kebijakan keamanan yang perlu diperbaiki.

Migration SQL final tidak boleh langsung dijalankan pada database produksi sebelum dilakukan pemeriksaan skema, pencadangan, pengujian pada lingkungan pengembangan, serta persetujuan pihak yang berwenang.

**Prinsip utama:** Bangun database SI STIR HEBAT secara aman, konsisten, terdokumentasi, dan bertahap agar dapat mendukung kebutuhan operasional sekolah dalam jangka panjang.
