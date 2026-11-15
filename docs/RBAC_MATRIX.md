# Matriks RBAC dari RLS — Draf L01

Status: draf Qoder, **belum resmi** dan belum disetujui pemilik
Tanggal: 15 November 2026
Sumber: policy RLS dan grant kolom pada 25 berkas `supabase/migrations/*.sql`
Sifat: matriks ini disusun dari database, bukan dari dokumen RBAC resmi. Bila berbeda dengan keinginan sekolah, yang berubah adalah migration baru, bukan dokumen ini.

## Cara membaca

- **K** = kelola: dapat menambah/mengubah sesuai alur, grant kolom, dan trigger.
- **K+** = hanya menambah; tidak ada grant ubah/hapus untuk klien.
- **B** = baca luas sesuai cakupan modul.
- **T** = baca terbatas: diri sendiri, anak sendiri, kelas, atau penugasan aktif.
- **B\*** = baca yang lebih luas dari niat modul; lihat temuan S-02.
- **-** = tidak ada akses eksplisit.
- Pending hanya dapat mengakses profil/akun sendiri.
- Anonim hanya halaman publik, login, dan pemulihan kata sandi.
- Menyembunyikan menu di UI bukan otorisasi; RLS adalah otoritas sebenarnya.

## 1. Administrasi dan akses

| Modul | Admin | Kepala | Guru | Siswa | Wali | Pending | Anon | Sumber policy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Profil/akun sendiri | T | T | T | T | T | T | - | `20261110075255_profiles.sql:19-23` |
| Pengumuman | K, B | K, B | T terbit | T terbit | T terbit | - | - | `20261110075305_announcements.sql:21-42` |
| Data master sekolah | K, B | B | B | B | B | - | - | `20261110081258_school_master_data.sql:82-99` |
| Kelas dan penugasan mengajar | K, B | B | T penugasan, T siswa di kelas | T keanggotaan sendiri | - | - | - | `20261110084348_class_enrollments_assignments.sql:92-114` |
| Registri guru/siswa | K, B | B | T diri sendiri | T diri sendiri | - | - | - | `20261110082821_people_registry.sql:25-41` |
| Relasi akun/wali | K, B | - | - | - | - | - | - | `20261111074620_account_relationships.sql:32-40` |
| Jadwal pelajaran | K via RPC, B | B | T penugasan | T kelas | T kelas anak | - | - | `20261113000504_lesson_schedules.sql:51-59` |
| Usulan perubahan jadwal | K via RPC, B | B | K/T usulan sendiri | - | - | - | - | `20261113061010_schedule_proposals.sql:29-33` |
| Komunikasi guru–wali | - | - | K+, T pasangan aktif | - | K+, T pasangan aktif | - | - | `20261114083827_komunikasi.sql:39-46` |
| `todos` contoh | K milik sendiri | K milik sendiri | K milik sendiri | K milik sendiri | K milik sendiri | K milik sendiri | - | `20261113074045_create_private_todos.sql:10-30` |

Catatan:

- Kepala sekolah **tidak** otomatis membaca tabel relasi wali. Policy hanya memberi akses kepada administrator. Ini mengoreksi matriks ringkasan audit sebelumnya.
- Guru **tidak** membaca seluruh registri siswa. Policy registri hanya memberi baca diri sendiri. Daftar siswa untuk absensi dan materi diperoleh melalui kelas/penugasan yang aktif, bukan dengan membuka registri.
- Administrator dapat mengusulkan jadwal? Tidak: `propose_schedule` memerlukan penugasan mengajar. Administrator hanya mengubah jadwal utama dan memutuskan usulan melalui RPC.
- `todos` adalah tabel contoh owner-only untuk semua akun login; bukan modul sekolah dan tidak dipakai UI. Keputusannya ada di L09/K1.

## 2. Pembelajaran dan supervisi

| Modul | Admin | Kepala | Guru | Siswa | Wali | Pending | Anon | Sumber policy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Absensi harian | B | B | K via RPC, T penugasan | T diri sendiri | T via RPC (30 catatan) | - | - | `20261110091137_attendance_core.sql:104-119`, `20261111075356_guardian_attendance.sql:3-37` |
| Impor Excel absensi | B riwayat | B riwayat | K via RPC, T penugasan | - | - | - | - | `20261110093304_attendance_imports.sql:15-20` |
| Jurnal mengajar | B | B | K+, T milik sendiri | - | - | - | - | `20261111070725_teaching_journals.sql:56-66` |
| Modul ajar | T non-draf | K persetujuan, T non-draf | K/T milik sendiri | - | - | - | - | `20261111080033_teaching_modules.sql:32-58` |
| Materi kelas | T non-draf | T non-draf | K/T penugasan | T terbit | T terbit anak | - | - | `20261111092126_class_materials.sql:41-59` |
| Tugas kelas | T non-draf | T non-draf | K/T penugasan | T terbit | T terbit anak | - | - | `20261111092744_class_tasks.sql:1-33` |
| Pengumpulan tugas | - | - | B, T tugas miliknya | K+, T milik sendiri | - | - | - | `20261111232717_task_submissions.sql:17-35` |
| Umpan balik tugas | B termasuk draf (K3) | B termasuk draf (K3) | K/T milik sendiri | T terbit | T terbit anak | - | - | `20261111233649_task_feedback.sql:45-81` |
| Asesmen dan hasil | B termasuk draf (K3) | B termasuk draf (K3) | K/T milik sendiri | T terbit | T terbit anak | - | - | `20261111234856_academic_assessments.sql:73-104` |
| Supervisi akademik | - | K, B seluruh | T hasil sendiri setelah terbit | - | - | - | - | `20261111080735_academic_supervision.sql:42-67` |
| Bukti supervisi (Storage) | B\* | K+, B\* | B\* | B\* | B\* | B\* | - | `20261111082822_supervision_evidence.sql:29-46` |
| Portal wali | - | - | - | - | T anak sendiri | - | - | `20261111075356_guardian_attendance.sql` |
| 7 Kebiasaan (lokal) | B | B | T siswa yang diajar | - | K+, T anak | - | - | `20261114000139_student_habits.sql:2-57` |

Catatan:

- **S-02:** policy baca Storage hanya memeriksa `stage = 4`, tanpa memeriksa peran, hubungan guru, atau `published_at`. Setiap akun login yang mengetahui/menemukan nama objek dapat membaca bukti sesi tahap 4, termasuk siswa, wali, dan pengguna pending. Sel “B\*” menggambarkan policy aktual, bukan niat modul. Policy tulis hanya untuk kepala sekolah pada sesi tahap 4 yang belum terbit; tidak ada kolom “kepala sekolah pemilik sesi”, sehingga kepala sekolah mana pun dapat menulis ke sesi tahap 4 mana pun. Lihat `AUDIT_L09_KRITERIA_PENERIMAAN.md`.
- **K3:** administrator/kepala sekolah dapat membaca draf umpan balik. Draf **asesmen** juga terbaca oleh keduanya, sedangkan draf modul/materi tidak. Ini inkonsistensi yang perlu keputusan pemilik.
- **7 Kebiasaan:** siswa belum memiliki akses baca ke catatan sendiri pada migration lokal; hanya wali yang dapat menulis. Ini bertentangan dengan kemungkinan “murid mengisi sendiri” dan harus diputuskan sebelum migration hosted.
- Jurnal dan pengumpulan tugas bersifat append-only: tidak ada grant ubah/hapus untuk klien. “K+” berarti menambah, bukan mengedit.
- Modul ajar: administrator dan kepala sekolah hanya membaca data non-draf. Kepala sekolah dapat melakukan transisi `submitted → returned/approved` dan `approved → archived`; bukan mengubah isi modul.

## 3. Modul yang belum memiliki UI atau policy

| Modul | Kondisi | Dampak RBAC |
| --- | --- | --- |
| Komunikasi guru–wali | Backend lokal, belum hosted, belum ada UI | Tidak ada rute; policy sudah ada |
| 7 Kebiasaan | Migration lokal, belum hosted, belum ada UI | Aturan tulis/baca belum final |
| Administrasi dokumen (KSP/RKT/RKAS/SK) | Belum ada | Tidak ada tabel/policy |
| Notifikasi in-app/email | Belum ada | Tidak ada tabel/policy |
| Absensi guru | Belum ada | Tidak ada tabel/policy |
| Audit log terpadu | Belum ada | Audit tersebar per modul |
| Operator teknis/backup | Belum ada peran aplikasi | Tidak ada aktor RBAC; prosedur di luar aplikasi |

## 4. Perbedaan dengan matriks di `AUDIT_RINGKASAN_PROYEK.md`

Matriks ini menggantikan sel berikut sampai audit tersebut diperbarui:

| Sel | Matriks audit lama | Temuan dari policy |
| --- | --- | --- |
| Relasi akun — kepala sekolah | B | **-**; hanya administrator yang memiliki policy baca |
| Registri guru/siswa — guru | T siswa yang diajar | **T diri sendiri**; akses siswa melalui kelas/penugasan, bukan registri |
| Bukti supervisi — semua peran login | T milik sendiri setelah publikasi | **B\***; policy baca hanya `stage = 4` |
| 7 Kebiasaan — siswa | Tidak dicatat | **-**; belum ada baca diri sendiri |
| Umpan balik/asesmen — admin/kepala | B termasuk draf | Sesuai policy, tetapi keputusan K3 dan draf asesmen belum disetujui |
| Usulan jadwal — guru | Tidak dicatat | **K/T usulan sendiri**; guru dapat mengusulkan |

## 5. Keputusan yang masih terbuka

1. Lokasi dan versi resmi tujuh dokumen acuan di `docs/references/`.
2. Pengesahan matriks role × modul ini sebagai matriks resmi.
3. Apakah kepala sekolah boleh membaca relasi wali, atau cukup administrator.
4. Apakah guru boleh membaca registri siswa yang diajar secara langsung, atau tetap melalui kelas/penugasan.
5. Apakah siswa boleh membaca/menulis 7 Kebiasaan sendiri, atau hanya wali/guru.
6. Apakah administrator/kepala sekolah boleh membaca draf umpan balik dan draf asesmen (K3).
7. Cakupan perbaikan S-02: siapa yang boleh membaca bukti, apakah hanya kepala sekolah pembuat sesi, dan apakah guru terkait boleh membaca setelah terbit.
8. Apakah administrator boleh membaca bukti supervisi; saat ini terjadi sebagai efek samping S-02, bukan keputusan.
9. Siapa aktor resmi untuk backup/restore dan audit log.

## 6. Laporan sesi

```
Tugas: L01 (parsial) | Agen: Qoder | Branch: working tree ai/codex-pdf-splitting (tidak ada commit)
Hasil: Matriks RBAC dari RLS disusun; enam sel yang berbeda dari audit lama dikoreksi; ADR stack dicatat di DECISIONS; indeks tujuh acuan dibuat tanpa menyalin dokumen yang tidak tersedia.
Bukti: telaah 25 migration; verifikasi unit terakhir 109/109 lulus (15 November 2026); tidak menjalankan suite browser pada tugas ini.
Berkas: docs/RBAC_MATRIX.md, docs/DECISIONS.md, docs/references/README.md, docs/AI_COORDINATION.md.
Belum diverifikasi: policy hosted, akun sekolah nyata, persetujuan matriks oleh pemilik, keberadaan/versi tujuh dokumen acuan di repo.
Butuh pemilik: keputusan sel RBAC terbuka dan lokasi/versi dokumen acuan.
```
