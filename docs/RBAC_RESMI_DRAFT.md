# Draf Matriks RBAC Resmi

Status: **DRAF untuk disahkan pemilik** — bukan kebijakan resmi
Tanggal: 15 November 2026
Penulis: Qoder
Sumber utama: `docs/AUDIT_RINGKASAN_PROYEK.md` bagian 7, dikoreksi dengan pembacaan policy RLS pada migration lokal
Sifat: baca-saja. Tidak ada perubahan policy, schema, kode, atau data hosted. Tidak ada baris data pengguna yang dibaca.

## 1. Cara membaca

Matriks ini adalah pembacaan policy RLS, bukan hasil UAT akun sekolah. UI dapat menyembunyikan menu, tetapi otoritas akses tetap ditentukan PostgreSQL/RLS. Sel bertanda `PD-xx` belum final dan harus diputuskan pemilik sebelum matriks disahkan.

Keterangan:

- **K** — kelola: tambah/ubah sesuai alur, constraint, dan trigger.
- **K+** — tambah saja (append-only); tidak ada update/hapus untuk pengguna.
- **B** — baca data modul secara luas.
- **B\*** — baca teknis lebih luas daripada yang diharapkan; perlu keputusan (lihat PD-03).
- **T** — baca terbatas: diri sendiri, anak sendiri, kelas, atau penugasan aktif.
- **-** — tidak ada akses eksplisit.
- **PD-xx** — sel perlu keputusan pemilik; jangan dianggap final.
- **Pending** hanya dapat mengakses profil/akun sendiri. **Anonim** hanya halaman publik, login, dan pemulihan kata sandi.
- `K via RPC` berarti penulisan tidak dilakukan langsung ke tabel, melainkan melalui fungsi database yang memeriksa peran dan alasan.

## 2. Administrasi dan data pokok

| Modul | Admin | Kepala | Guru | Siswa | Wali | Pending |
| --- | --- | --- | --- | --- | --- | --- |
| Profil/akun sendiri | T | T | T | T | T | T |
| Pengumuman | K, B | K, B | T published | T published | T published | - |
| Data master | K, B | B | B | B | B | - |
| Registri guru/siswa | K, B | B | T diri sendiri **PD-01** | T diri sendiri | - | - |
| Relasi akun | K via RPC, B | - **PD-02** | - | - | - | - |
| Jadwal | K via RPC, B | B | T; usulan sendiri | T | T | - |
| Bukti supervisi (Storage) | B\* | B\* | B\* | B\* **PD-03** | B\* **PD-03** | B\* **PD-03** |
| Komunikasi guru–wali | - **PD-04** | - **PD-04** | K, T pasangan aktif | - | K, T pasangan aktif | - |
| Kebiasaan 7 hari (lokal) | B | B | T penugasan | - | T anak sendiri | - |

Catatan:

- Baris **Kebiasaan 7 hari** berasal dari migration lokal `20261114000139_student_habits.sql` yang belum tercatat hosted. Baris ini belum boleh dianggap fitur produksi.
- Baris **Komunikasi** belum memiliki UI dan migration-nya belum hosted.
- **Registri**: policy `people_read` hanya mengizinkan administrator, kepala sekolah, dan pemilik baris guru/siswa (`supabase/migrations/20261110082821_people_registry.sql:36`). Audit sebelumnya menyebut guru dapat membaca siswa yang diajar; itu tidak sesuai dengan policy SELECT registri. Kebutuhan operasional guru harus dipenuhi lewat RPC/query terbatas atau policy baru yang disetujui.
- **Relasi akun**: hanya administrator yang memiliki policy SELECT (`supabase/migrations/20261111074620_account_relationships.sql:32`). Kepala sekolah tidak dapat membaca relasi. Perlu keputusan apakah itu disengaja.
- **Bukti supervisi**: policy Storage `supervision_evidence_read` hanya memeriksa bucket dan `stage = 4`, tanpa memeriksa peran (`supabase/migrations/20261111082822_supervision_evidence.sql:29-39`). Akibatnya semua akun authenticated, termasuk pending, dapat membaca berkas pada tahap tersebut. Ini temuan S-02, bukan perilaku yang disahkan.

## 3. Pembelajaran dan supervisi

| Modul | Admin | Kepala | Guru | Siswa | Wali | Pending |
| --- | --- | --- | --- | --- | --- | --- |
| Absensi | B | B | K, T penugasan | T diri sendiri | T via portal, 30 status terakhir | - |
| Jurnal mengajar | B | B | K+, T milik sendiri | - | - | - |
| Modul ajar | T non-draft | K approval, B | K, T milik sendiri | - | - | - |
| Materi dan tugas | T non-draft | T non-draft | K, T penugasan | T published | T published anak | - |
| Pengumpulan tugas | - | - | B, T tugas miliknya | K+, T milik sendiri | - | - |
| Umpan balik | B, termasuk draf **PD-05** | B, termasuk draf **PD-05** | K, T milik sendiri | T published | T published anak | - |
| Asesmen dan hasil | B, termasuk draf **PD-06** | B, termasuk draf **PD-06** | K, T milik sendiri | T published | T published anak | - |
| Supervisi (tabel) | - | K, B seluruh | T hasil sendiri setelah publikasi | - | - | - |
| Portal wali | - | - | - | - | T anak sendiri | - |

Catatan:

- **Jurnal** dan **pengumpulan tugas** bersifat append-only: pengguna dapat menambah, tetapi tidak mendapat grant update/hapus. `K+` dipakai agar tidak menyiratkan hak koreksi.
- **Umpan balik**: policy SELECT mengizinkan administrator dan kepala sekolah membaca semua baris, termasuk `draft` (`supabase/migrations/20261111233649_task_feedback.sql:50-54`). Dua opsi perbaikan ada di `docs/DECISIONS.md` bagian “Opsi terbuka — draf umpan balik (K3)”.
- **Asesmen**: policy SELECT juga mengizinkan administrator dan kepala sekolah membaca asesmen draft (`supabase/migrations/20261111234856_academic_assessments.sql:81-85`). Apakah ini disengaja belum diputuskan.
- **Supervisi tabel** terpisah dari **Bukti supervisi (Storage)**. Tabel dapat dibatasi, tetapi berkasnya memiliki kebocoran baca pada PD-03.
- **Absensi wali** berasal dari RPC portal terbatas 30 status terakhir, bukan SELECT langsung ke seluruh tabel absensi.

## 4. Sel yang perlu keputusan pemilik

| ID | Sel/Modul | Keadaan saat ini | Keputusan yang diminta |
| --- | --- | --- | --- |
| PD-01 | Registri guru/siswa — Guru | Guru hanya membaca baris registri dirinya sendiri | Apakah guru memerlukan daftar nama siswa pada kelas penugasan? Jika ya, tentukan apakah lewat RPC/query terbatas atau policy SELECT baru. |
| PD-02 | Relasi akun — Kepala sekolah | Hanya administrator dapat membaca | Apakah kepala sekolah perlu membaca relasi wali–anak untuk supervisi? Jika ya, tambahkan policy dan uji; jika tidak, biarkan tertutup. |
| PD-03 | Bukti supervisi Storage — semua authenticated | Semua akun authenticated dapat membaca berkas `stage = 4` | Tetapkan peran yang boleh membaca (kepala sekolah, guru pemilik setelah publikasi, atau keduanya). Perbaikan policy dan tes wajib; jangan menyatakan aman sebelum diuji. |
| PD-04 | Komunikasi guru–wali — Admin/Kepala | Tidak ada akses | Apakah pengawasan/moderasi diperlukan? Jika ya, tentukan baca-saja, alasan akses, dan retensinya. Migration komunikasi juga belum hosted. |
| PD-05 | Umpan balik — Admin/Kepala | Dapat membaca draf | Pilih opsi (a) draf hanya penulis atau (b) admin/kepala boleh membaca draf. Lihat `docs/DECISIONS.md`; policy belum diubah. |
| PD-06 | Asesmen — Admin/Kepala | Dapat membaca draf | Apakah draf asesmen boleh dibaca staf sebelum publikasi? Jika tidak, samakan perbaikannya dengan PD-05. |
| PD-07 | Navigasi vs RLS | Admin melihat beberapa menu pembelajaran, tetapi tidak otomatis berhak menulis | Tentukan apakah menu disembunyikan atau RLS diberi hak tulis. Jangan mengandalkan UI sebagai otorisasi. |
| PD-08 | Data master — Siswa/Wali | Dapat membaca data master | Konfirmasi apakah seluruh data master (tahun ajaran, kelas, mapel) memang layak dibaca siswa/wali, atau perlu dibatasi. |

## 5. Koreksi terhadap `AUDIT_RINGKASAN_PROYEK.md` bagian 7

| No | Catatan audit lama | Keadaan policy yang terbaca | Dampak |
| --- | --- | --- | --- |
| 1 | Relasi akun: Kepala = B | Kepala = - | Matriks audit terlalu luas; jangan dipakai untuk menyatakan kepala sekolah dapat membaca relasi. |
| 2 | Registri: Guru = T siswa yang diajar | Guru = T diri sendiri | Kebutuhan daftar siswa belum terpenuhi oleh SELECT registri; perlu keputusan PD-01. |
| 3 | Bukti supervisi: hanya Kepala/Guru tertentu | Semua authenticated pada `stage = 4` | Temuan S-02; akses lebih luas dari yang tertulis. |
| 4 | Asesmen: Admin/Kepala = B | B termasuk draf | Perlu keputusan PD-06. |
| 5 | Jurnal/Pengumpulan: K | K+ (append-only) | Tidak ada hak koreksi/hapus; jangan menjanjikan edit. |
| 6 | Jadwal: Guru = T | T + usulan sendiri melalui RPC | Guru dapat mengusulkan, bukan mengubah jadwal utama. |

## 6. Di luar cakupan

- Tidak ada pengujian dengan akun sekolah nyata; matriks belum membuktikan perilaku end-to-end.
- Tidak ada pemeriksaan Storage hosted, Auth redirect, email, atau sesi nyata.
- Tidak ada penilaian UI/aksesibilitas; PD-07 hanya mencatat ketidaksesuaian navigasi dan RLS.
- `20261114000139_student_habits` dan `20261114083827_komunikasi` belum hosted; baris terkait adalah rancangan lokal.
- Matriks ini tidak menetapkan retensi, penghapusan, atau dasar hukum pemrosesan data anak (D4 masih **BELUM DIPUTUSKAN**).

## 7. Pengesahan pemilik

Setelah PD-01 sampai PD-08 diputuskan, isi kolom berikut. Sampai itu, matriks tetap draf dan tidak boleh disebut “RBAC resmi”.

| Peran | Nama | Tanggal | Keputusan/inti persetujuan |
| --- | --- | --- | --- |
| Pemilik sekolah |  |  |  |
| Kepala sekolah |  |  |  |
| Administrator teknis |  |  |  |
