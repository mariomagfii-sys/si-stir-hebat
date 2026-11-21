# Matriks RBAC dari RLS — Draf

Status: draf Qoder, **belum resmi** dan belum disetujui pemilik
Diperbarui: 20 November 2026
Sumber: policy RLS, grant kolom, trigger, dan RPC pada 38 berkas `supabase/migrations/*.sql` (hasil `node scripts/check-migrations.mjs`: 38 berkas per 20 November 2026; laporan Codex yang menyebut 39 belum cocok dan tidak dipakai di sini).
Sifat: matriks ini disusun dari database, bukan dari dokumen RBAC resmi. Bila berbeda dengan keinginan sekolah, yang berubah adalah migration baru, bukan dokumen ini.

## Cara membaca

- **V** = lihat/baca (`select`).
- **C** = buat (`insert`), termasuk insert kolom terbatas.
- **U** = ubah (`update`) sesuai grant kolom, trigger, dan revisi.
- **D** = hapus (`delete`) langsung oleh klien.
- **A** = menyetujui/mengubah status alur (transisi lewat trigger atau RPC).
- **E** = mengeksekusi RPC/fungsi (security definer atau invoker terkontrol).
- **-T** = terbatas: diri sendiri, anak sendiri, kelas, atau penugasan aktif.
- **\*** = cakupan lebih luas dari niat modul; lihat temuan S-02.
- **-** = tidak ada akses eksplisit; RLS menolak.
- Pending hanya dapat mengakses profil/akun sendiri dan notifikasi miliknya. Anonim hanya halaman publik, login, dan pemulihan kata sandi.
- Menyembunyikan menu di UI bukan otorisasi; RLS adalah otoritas sebenarnya.
- Tidak ada policy `delete` untuk tabel domain mana pun selain objek Storage. "D" hanya muncul pada Storage.

## 1. Administrasi, akses, dan komunikasi

| Modul | Admin | Kepala | Guru | Siswa | Wali | Pending | Anon | Sumber policy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Profil/akun sendiri | V-T, U-T (`full_name`) | sama | sama | sama | sama | sama | - | `20261110075255_profiles.sql:19-23` |
| Pengumuman | V, C, U, A(status) | V, C, U, A(status) | V-T terbit | V-T terbit | V-T terbit | - | - | `20261110075305_announcements.sql:21-42` |
| Data master sekolah | V, C, U | V | V | V | V | - | - | `20261110081258_school_master_data.sql:82-99` |
| Kelas dan penugasan mengajar | V, C, U | V | V-T penugasan, V-T siswa di kelas | V-T keanggotaan sendiri | - | - | - | `20261110084348_class_enrollments_assignments.sql:92-134` |
| Registri guru/siswa | V, C, U | V | V-T diri sendiri | V-T diri sendiri | - | - | - | `20261110082821_people_registry.sql:25-41` |
| Relasi akun/wali | V, C, U lewat E(`set_account_relationship`) | - | - | - | - | - | - | `20261111074620_account_relationships.sql:32-40,118` |
| Jadwal pelajaran | V, C, U lewat E(`save_lesson_schedule`) | V | V-T penugasan, C lewat E(`propose_schedule`) | V-T kelas | V-T kelas anak | - | - | `20261113000504_lesson_schedules.sql:51-59,121` |
| Usulan perubahan jadwal | V, A lewat E(`decide_schedule_proposal`) | V | V-T, C lewat E(`propose_schedule`) | - | - | - | - | `20261113061010_schedule_proposals.sql:29-33,51-82` |
| Komunikasi guru–wali | - | - | V-T, C | - | V-T, C | - | - | `20261114083827_komunikasi.sql:39-46` |
| Pusat notifikasi | V-T milik sendiri, U lewat E(`mark_notification_read`) | sama | sama | sama | sama | sama | - | `20261118000300_notifications.sql:20-31` |
| Notifikasi otomatis (fanout) | - | - | - | - | - | - | - | Trigger `notify_school_event`: pengumuman terbit, status dokumen/modul ajar, hasil supervisi terbit, laporan absen baru, pesan baru; `20261120041306_notification_event_fanout.sql:27-111` |

Catatan:

- Kepala sekolah **tidak** otomatis membaca tabel relasi wali; policy hanya memberi akses kepada administrator.
- Guru **tidak** membaca seluruh registri siswa. Daftar siswa untuk absensi, materi, kebiasaan, dan penilaian diperoleh melalui penugasan/kelas aktif, bukan registri.
- Administrator tidak dapat mengusulkan jadwal: `propose_schedule` memerlukan penugasan mengajar. Administrator hanya mengubah jadwal utama dan memutuskan usulan lewat RPC.
- Notifikasi tidak dapat dibuat klien. Hanya trigger security definer yang menulis; klien hanya membaca miliknya dan menandai sudah dibaca.
- `public.todos` contoh dihapus oleh `20261114083828_security_foundation.sql` setelah dipastikan kosong.

## 2. Pembelajaran dan supervisi

| Modul | Admin | Kepala | Guru | Siswa | Wali | Pending | Anon | Sumber policy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Absensi harian | V | V | V-T, C/U lewat E(`record_attendance`) | V-T diri sendiri | V-T lewat E(`guardian_attendance`, 30 catatan) | - | - | `20261110091137_attendance_core.sql:104-161`, `20261111075356_guardian_attendance.sql:3-37` |
| Impor Excel absensi | V riwayat | V riwayat | V-T, E(`import_attendance`) | - | - | - | - | `20261110093304_attendance_imports.sql:15-58` |
| Jurnal mengajar | V | V | V-T, C (append-only) | - | - | - | - | `20261111070725_teaching_journals.sql:56-66` |
| Modul ajar | V non-draf | V non-draf, A(kembalikan/setujui/arsip) | V-T, C, U-T, A(ajukan) | - | - | - | - | `20261111080033_teaching_modules.sql:32-58` |
| Materi kelas | V non-draf | V non-draf | V-T, C, U-T, A(terbit/arsip) | V-T terbit | V-T terbit anak | - | - | `20261111092126_class_materials.sql:41-59` |
| Tugas kelas (`class_materials.kind='task'`) | V non-draf | V non-draf | V-T, C, U-T sebelum terbit, A(terbit/arsip) | V-T terbit | V-T terbit anak | - | - | `20261111092744_class_tasks.sql:3-31` |
| Pengumpulan tugas | - | - | V-T tugas miliknya | V-T, C (sekali, sebelum tenggat) | - | - | - | `20261111232717_task_submissions.sql:17-35` |
| Umpan balik tugas | V terbit | V terbit | V-T draf, C, U, A(terbit) | V-T terbit | V-T terbit anak | - | - | `20261114083828_security_foundation.sql:39-64` |
| Asesmen dan hasil | V termasuk draf (K3) | V termasuk draf (K3) | V-T, C, U-T, A(terbit/koreksi) | V-T terbit | V-T terbit anak | - | - | `20261111234856_academic_assessments.sql:73-104` |
| Supervisi akademik | - | V, C, U, A(terbit) | V-T hasil setelah terbit | - | - | - | - | `20261111080735_academic_supervision.sql:42-67` |
| Bukti supervisi (Storage) | V\* | V\*, C/D pada sesi tahap 4 belum terbit\* | V\* | V\* | V\* | V\* | - | `20261111082822_supervision_evidence.sql:29-46` |
| Portal wali | - | - | - | - | V-T anak lewat E(`guardian_attendance`) | - | - | `20261111075356_guardian_attendance.sql` |
| 7 Kebiasaan | V | V | V-T, U(validasi) | V-T, C, U-T sendiri | V-T, C, U-T anak | - | - | `20261118000100_student_habits_validation.sql:11-51`, `20261120041637_habits_catalog_and_validation_reset.sql:16-17` |
| Laporan ketidakhadiran wali | V | V | V-T, A lewat E(`review_guardian_absence_report`) | - | V-T, C | - | - | `20261118000200_guardian_absence_reports.sql:59-83`, `20261120050000_guardian_absence_attendance.sql` |
| Absensi guru (check-in/out) | V | V, A lewat E(`review_teacher_attendance_correction`) | V-T, E(`record_teacher_attendance`, `request_teacher_attendance_correction`) | - | - | - | - | `20261120042600_teacher_attendance_with_approval.sql:64-205` |
| Dashboard ringkasan | E(`dashboard_overview`) | E(`dashboard_overview`) | - | - | - | - | - | `20261120044500_dashboard_overview.sql:5-71` |

Catatan:

- **S-02 belum ditutup:** policy baca Storage hanya memeriksa `stage = 4`, tanpa peran, hubungan guru, atau `published_at`. Setiap akun login yang mengetahui/menemukan nama objek dapat membaca bukti sesi tahap 4, termasuk siswa, wali, dan pengguna pending. Policy tulis hanya untuk kepala sekolah pada sesi tahap 4 yang belum terbit; tidak ada kolom "kepala sekolah pemilik sesi", sehingga kepala sekolah mana pun dapat menulis ke sesi tahap 4 mana pun. Sel "V\*" menggambarkan policy aktual, bukan niat modul.
- **K3:** administrator/kepala sekolah dapat membaca draf asesmen, tetapi **tidak** lagi membaca draf umpan balik setelah `security_foundation`. Draf modul/materi tetap tidak terbaca oleh keduanya. Keputusan pemilik masih diperlukan.
- **7 Kebiasaan:** sejak `20261118000100`, siswa dapat membaca dan mengisi catatan sendiri; wali dapat membaca/mengisi untuk anak; guru penugasan memvalidasi dengan catatan wajib. Katalog tetap dan rekap mingguan (`habit_weekly_summary`) tersedia. Pembeda "belum diisi" vs "tidak dilakukan" (PD-12) belum selesai di data.
- **Dokumen sekolah:** guru mengunggah draf miliknya dan mengajukan; kepala sekolah menyetujui/mengembalikan/mengarsipkan dan mengisi catatan; administrator hanya dapat mengubah metadata tanpa mengubah status (guard `20261120040847`). Versi, review, dan event ditulis trigger, bukan klien. Siswa/wali tidak punya akses.
- **Absensi guru:** tidak ada grant insert/update langsung; check-in/out dan koreksi hanya lewat RPC dengan ID permintaan idempoten. Koreksi hanya disetujui kepala sekolah.
- **Laporan absen wali:** hanya keputusan `confirmed` menulis status `absent` ke absensi, dan hanya bila tepat satu sesi/roster cocok; jika tidak, RPC mengembalikan `55000` dan laporan tetap `submitted`.
- Jurnal dan pengumpulan tugas bersifat append-only: tidak ada grant ubah/hapus untuk klien.
- Modul ajar: administrator dan kepala sekolah hanya membaca data non-draf; kepala sekolah melakukan transisi status, bukan mengubah isi.

## 3. Tabel pendukung

| Tabel | Akses baca | Akses tulis | Sumber |
| --- | --- | --- | --- |
| Event/audit per modul (absensi, jurnal, modul, supervisi, asesmen, umpan balik, jadwal, dokumen, absensi guru, kebiasaan) | Mengikuti izin tabel induk | Hanya trigger security definer | migration terkait |
| Versi/review dokumen | Mengikuti izin dokumen | Hanya trigger | `20261120040847_school_document_versions_reviews.sql:73-145` |
| Kategori dokumen | Semua akun login untuk kategori aktif; admin/kepala juga nonaktif | Admin (U) | `20261120040847...:73-77` |
| Katalog kebiasaan | Admin, kepala, guru, siswa, wali (V) | - | `20261120041637...:16-17` |
| Notifikasi | Pemilik baris (V-T) | Trigger fanout; pemilik lewat RPC tanda-baca | `20261118000300`, `20261120041306` |
| Storage dokumen sekolah | Mengikuti izin dokumen (V) | Admin teknis; guru pemilik draf/perlu revisi | `20261118000400_school_documents.sql:90-125` |

## 4. Modul yang belum memiliki tabel/policy

| Modul | Kondisi | Dampak RBAC |
| --- | --- | --- |
| Email/WhatsApp keluar | Belum ada | Tidak ada policy; notifikasi hanya dalam aplikasi |
| Audit log terpadu | Belum ada | Audit tersebar per modul dan tidak dapat dibaca lintas modul |
| Operator teknis/backup | Belum ada peran aplikasi | Tidak ada aktor RBAC; prosedur di luar aplikasi |
| Google Drive/Sheets, offline/PWA | Ditunda setelah UI | Tidak ada tabel/policy |

## 5. Keputusan yang masih terbuka

1. Pengesahan matriks role × modul ini sebagai matriks resmi.
2. Apakah kepala sekolah boleh membaca relasi wali, atau cukup administrator.
3. Apakah guru boleh membaca registri siswa yang diajar secara langsung, atau tetap melalui kelas/penugasan.
4. Apakah administrator/kepala sekolah boleh membaca draf asesmen (K3) dan siapa yang boleh melihat draf umpan balik.
5. Cakupan perbaikan S-02: siapa yang boleh membaca bukti, apakah hanya kepala sekolah pembuat sesi, dan apakah guru terkait boleh membaca setelah terbit.
6. Apakah administrator boleh membaca bukti supervisi; saat ini terjadi sebagai efek samping S-02.
7. Siapa aktor resmi untuk backup/restore dan audit log.
8. Pembeda data "belum diisi" vs "tidak dilakukan" untuk 7 Kebiasaan (PD-12).

## 6. Laporan sesi

```
Tugas: Q6 | Agen: Qoder | Branch: working tree (tidak ada commit)
Hasil: Matriks RBAC disusun ulang dari policy aktual memakai kode V/C/U/D/A/E; modul baru (notifikasi, dokumen, laporan absen wali, absensi guru, dashboard, rekap kebiasaan) ditambahkan; temuan S-02 dan K3 dipertahankan.
Bukti: telaah 38 berkas migration lokal; node scripts/check-migrations.mjs melaporkan 38 berkas. Tidak menjalankan suite browser pada tugas dokumen ini.
Berkas: docs/RBAC_MATRIX.md, docs/AI_COORDINATION.md.
Belum diverifikasi: policy hosted (15 migration lokal belum hosted), akun sekolah nyata, persetujuan matriks oleh pemilik, selisih jumlah migration 38 vs 39 pada laporan Codex.
Butuh pemilik: keputusan sel RBAC terbuka dan perbaikan S-02.
```
