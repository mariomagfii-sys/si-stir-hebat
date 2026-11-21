# Draf Kebijakan Retensi dan Penghapusan Data Anak — L16

Status: **DRAF**, belum disahkan; bukan nasihat hukum
Tanggal: 15 November 2026
Penulis: Qoder
Ruang lingkup: D-01 (retensi/penghapusan), D-02 (bukti supervisi), dan usulan backup/pemulihan
Sifat: usulan untuk keputusan pemilik. Tidak ada data sekolah atau orang nyata yang dibaca, diubah, atau dibuat. Tidak ada migration, kode, atau hosted yang diubah.

## 1. Ringkasan

Saat ini aplikasi belum memiliki kebijakan retensi, prosedur penghapusan yang dapat diaudit, atau bukti backup terjadwal. Tabel akademik dan audit bersifat append-only; hanya `todos` dan objek bukti supervisi yang memiliki grant hapus bagi klien. Menghapus akun Auth juga berpotensi gagal karena banyak foreign key ke `profiles` tidak memiliki aksi hapus.

Draf ini mengusulkan:

1. Jadwal retensi per kategori data sebagai titik awal diskusi.
2. Dua opsi penghapusan: **anonymisasi/soft-delete** (disarankan untuk data yang perlu diaudit) atau **hard-delete** setelah ekspor dan pelepasan relasi.
3. Prosedur permintaan penghapusan yang mencatat persetujuan dan bukti tanpa menyimpan data pribadi berlebihan.
4. Aturan retensi bukti supervisi dan larangan mengunggah konten anak yang tidak diperlukan.
5. Rencana backup harian/mingguan, salinan eksternal terenkripsi, dan uji restore.

Angka pada draf ini adalah **usulan operasional**, bukan kewajiban hukum. Pemilik sekolah dan penasihat hukum/arsiparis harus menetapkan angka final, dasar pemrosesan, dan pengecualian arsip resmi.

## 2. Prinsip

- **Minimisasi:** simpan hanya data yang dibutuhkan fungsi sekolah.
- **Retensi terbatas:** setiap kategori memiliki masa simpan dan pemicu penghapusan.
- **Akuntabilitas:** permintaan, persetujuan, dan tindakan penghapusan dicatat.
- **Keutuhan arsip:** data resmi sekolah dan audit tidak dihapus tanpa keputusan pemilik.
- **Privasi anak:** bukti yang memuat wajah/karya anak hanya diunggah bila diperlukan.
- **Tidak ada klaim aman:** dokumen ini tidak menyatakan sistem memenuhi UU PDP atau standar lain sampai ditinjau pemilik/penasihat hukum.

## 3. Kondisi teknis saat ini

| Kategori | Tabel utama | Kemampuan hapus saat ini | Catatan |
| --- | --- | --- | --- |
| Akun/profil | `auth.users`, `profiles` | Auth user dihapus operator; profil ikut cascade | Banyak FK ke `profiles` tanpa aksi hapus; penghapusan dapat gagal. |
| Registri | `teachers`, `students` | Klien tidak dapat menghapus; administrator hanya mengubah status | `profile_id` unik tanpa aksi hapus; `created_by` wajib. |
| Keanggotaan/penugasan | `class_enrollments`, `teacher_assignments` | Tidak ada grant hapus; dinonaktifkan | Riwayat nonaktif dipertahankan. |
| Absensi | `attendance_sessions`, `attendance_records`, `attendance_changes`, `attendance_imports` | Tidak ada grant hapus; koreksi melalui RPC | Snapshot nama/kode tetap ada setelah siswa keluar. |
| Pembelajaran | jurnal, modul, materi, tugas, pengumpulan, umpan balik | Jurnal dan pengumpulan append-only; materi/tugas dapat diarsipkan | Tidak ada penghapusan permanen. |
| Asesmen | `assessments`, `assessment_results`, `assessment_result_events` | Tidak ada grant hapus | Nilai terbit dapat dikoreksi dengan alasan, bukan dihapus. |
| Supervisi | `academic_supervisions`, event, `storage.objects` | Bukti dapat dihapus kepala sekolah pada tahap 4 belum terbit | Bukti terbit tidak dapat dihapus klien; baca terlalu luas (S-02). |
| 7 Kebiasaan | `habit_records`, `habit_events` | Tidak ada grant hapus | Catatan bebas dapat memuat nama/anekdot anak. |
| Komunikasi | `communication_messages` | Append-only; tidak ada grant hapus | Isi pesan bebas dapat memuat data pribadi. |
| Audit | event per modul | Append-only; tidak ada grant hapus | `actor_id`/`created_by` menunjuk `profiles`. |
| `todos` | `todos` | Pemilik dapat menghapus | Tabel contoh; keputusan K1 masih terbuka. |
| Backup | di luar database | Belum ada konfigurasi/uji restore di repo | `AKTIVASI_DAN_RILIS.md:51` hanya meminta pemilik memilih backup Supabase. |

Konsekuensi teknis:

- **Hard-delete akun belum aman dijalankan.** `teachers.profile_id`, `students.profile_id`, dan banyak kolom `created_by`/`actor_id`/`author_id` mereferensikan `profiles(id)` tanpa `on delete`. Menghapus `auth.users` akan cascade ke `profiles`, lalu dapat gagal karena FK lain.
- **Anonymisasi snapshot tidak otomatis.** Nama/kode disalin ke absensi, asesmen, pengumpulan, umpan balik, dan event JSONB. Menghapus registri tidak menghapus salinan ini.
- **Audit sulit dianonimkan.** Event menyimpan JSONB lama/baru dan UUID pelaku; penghapusan profil pelaku dapat terblokir atau menghilangkan atribusi.
- **Objek Storage tidak ikut terhapus** saat baris database dihapus; harus dihapus terpisah setelah kebijakan disetujui.

## 4. Usulan jadwal retensi

Pemicu “akhir tahun ajaran” berarti tanggal resmi penutupan tahun ajaran yang ditetapkan sekolah. Pemilik dapat memperpanjang untuk arsip resmi, sengketa, atau kewajiban hukum.

| Kategori | Usulan masa simpan | Tindakan akhir | Penanggung jawab |
| --- | --- | --- | --- |
| Akun Auth/profil | Aktif + 30 hari setelah dinonaktifkan | Nonaktifkan login, lepaskan relasi, lalu anonymisasi atau hapus | Administrator + operator teknis |
| Registri siswa/guru | Aktif + 5 tahun setelah nonaktif | Anonymisasi nama; pertahankan kode internal untuk audit | Administrator |
| Keanggotaan/penugasan | 5 tahun setelah akhir tahun ajaran | Arsipkan; hapus relasi yang tidak lagi diperlukan | Administrator |
| Absensi dan impor | 5 tahun setelah akhir tahun ajaran | Hapus atau anonymisasi snapshot setelah arsip resmi | Administrator |
| Jurnal/modul/materi/tugas/umpan balik | 3 tahun setelah akhir tahun ajaran | Hapus konten; pertahankan metadata audit minimal | Administrator |
| Asesmen dan hasil | 5 tahun setelah akhir tahun ajaran | Hapus/anonymisasi; perpanjang bila diperlukan untuk rapor/arsip | Kepala sekolah + administrator |
| Supervisi (catatan) | 5 tahun setelah sesi | Hapus/anonymisasi catatan bebas | Kepala sekolah |
| Bukti supervisi (PDF/JPEG/PNG) | 1 tahun setelah sesi, kecuali ada tindak lanjut | Hapus objek Storage; catat penghapusan | Kepala sekolah + operator |
| 7 Kebiasaan | 3 tahun setelah akhir tahun ajaran | Hapus/anonymisasi catatan dan event | Administrator |
| Komunikasi guru–wali | 2 tahun setelah pesan terakhir atau hubungan berakhir | Hapus isi pesan; pertahankan metadata minimal | Administrator |
| Audit/event | 5 tahun | Pertahankan append-only; pseudonimkan pelaku bila akun dihapus | Operator + administrator |
| Metadata impor | 2 tahun setelah sesi | Hapus metadata | Administrator |
| `todos` | Drop tabel atau 30 hari | Ikuti keputusan K1 | Pemilik + Copilot |
| Backup | 7 harian, 4 mingguan, 12 bulanan | Hapus otomatis sesuai siklus | Operator teknis |
| Log aplikasi | 30 hari | Hapus; jangan mencatat data pribadi | Operator teknis |

Catatan:

- Angka di atas belum memperhitungkan kewajiban arsip sekolah, audit pemerintah, atau sengketa. Pemilik harus menetapkan pengecualian dan dasar hukumnya.
- Data “Data Contoh” tidak boleh masuk produksi dan tidak tunduk pada jadwal ini.
- Retensi 5 tahun untuk nilai/absensi adalah usulan konservatif; sekolah dapat memilih lebih lama untuk arsip resmi.
- Bukti supervisi lebih pendek karena berisiko memuat wajah/karya anak dan hanya diperlukan untuk tindak lanjut.

## 5. Opsi penghapusan

### Opsi A — Anonymisasi/soft-delete (disarankan untuk data berjejak)

1. Nonaktifkan akun Auth dan cabut akses login.
2. Lepaskan `profile_id` dari registri dan relasi wali; nonaktifkan keanggotaan/penugasan.
3. Ganti nama pada registri dan snapshot dengan label netral, misalnya `Siswa <kode>` atau `Guru <kode>`; hapus kolom bebas yang memuat data pribadi.
4. Pertahankan UUID internal dan catatan audit untuk integritas; jangan pertahankan nama, kontak, atau tautan akun.
5. Hapus objek Storage yang terkait setelah masa retensi.
6. Catat tindakan pada audit tanpa menyalin data yang dihapus.

Kelebihan: FK dan audit tetap utuh; arsip resmi tetap dapat ditelusuri. Kekurangan: data tidak benar-benar hilang; perlu kontrol akses dan dokumentasi yang jelas.

### Opsi B — Hard-delete setelah ekspor

1. Ekspor data yang berhak diterima pemohon.
2. Pastikan tidak ada penangguhan arsip/sengketa.
3. Lepaskan relasi dan tautan profil.
4. Hapus objek Storage.
5. Ubah FK `created_by`/`actor_id`/`author_id` menjadi nullable atau alihkan ke akun sistem, lalu hapus profil/Auth user.
6. Uji di Supabase lokal; jangan di hosted tanpa persetujuan.

Kelebihan: data benar-benar hilang dari database aktif. Kekurangan: memerlukan migration baru, berisiko memutus audit, dan tidak menghapus salinan backup sampai siklus backup berakhir.

**Rekomendasi:** gunakan Opsi A untuk data akademik/audit yang masih dalam masa retensi; gunakan Opsi B hanya untuk akun tanpa penangguhan arsip dan setelah pemilik menyetujui perubahan FK. Keputusan akhir ada pada pemilik.

## 6. Alur permintaan penghapusan/anonymisasi

1. **Permintaan:** wali/siswa/guru mengajukan kepada operator sekolah melalui kanal resmi. Catat identitas pemohon, hubungan dengan data, dan jenis permintaan.
2. **Verifikasi:** operator memverifikasi identitas dan kewenangan; jangan meminta kata sandi atau dokumen berlebihan.
3. **Penangguhan:** periksa apakah data sedang diperlukan untuk arsip, audit, sengketa, atau tindak lanjut supervisi.
4. **Persetujuan:** kepala sekolah/pemilik menyetujui penghapusan atau anonymisasi. Alasan dan penanggung jawab dicatat.
5. **Ekspor:** berikan salinan data yang berhak sebelum penghapusan bila diminta.
6. **Eksekusi:** jalankan Opsi A atau B; hapus objek Storage terkait; pastikan akun tidak dapat login.
7. **Verifikasi:** periksa registri, snapshot, relasi, event, dan Storage; catat bukti tanpa menyalin data pribadi.
8. **Respons:** beri tahu pemohon hasilnya. Usulan target internal 14 hari kerja; tenggat hukum harus dikonfirmasi penasihat hukum.
9. **Backup:** catat bahwa salinan dapat bertahan sampai siklus backup berakhir; jangan menjanjikan penghapusan seketika dari backup.

Pengecualian yang harus dipertahankan sampai pemilik memutuskan: arsip nilai/absensi resmi, audit perubahan, sengketa, dan kewajiban pelaporan.

## 7. Siswa/guru keluar atau lulus

- **Nonaktifkan** akun dan relasi terlebih dahulu; jangan langsung menghapus.
- **Lepaskan** tautan `profile_id` dan relasi wali setelah masa tenggang.
- **Pertahankan** kode internal dan snapshot untuk membaca riwayat; anonymisasi nama setelah masa retensi.
- **Hapus** akses login dan sesi; akun Auth dihapus operator setelah relasi dilepas.
- **Bukti supervisi** yang memuat anak dihapus sesuai jadwal, kecuali diperlukan untuk tindak lanjut.
- **Uji** prosedur pada Supabase lokal dengan data sintetis sebelum dipakai di hosted.

## 8. Bukti supervisi dan konten anak (D-02)

- Unggah hanya dokumen yang relevan dengan observasi; hindari foto wajah anak bila tidak diperlukan.
- Jangan mengunggah karya anak yang memuat identitas tanpa dasar kebutuhan yang jelas.
- Bukti disimpan privat; akses baca harus mengikuti perbaikan S-02, bukan policy `stage = 4` saat ini.
- Retensi usulan: 1 tahun setelah sesi, kecuali ada tindak lanjut atau penangguhan.
- Penghapusan harus mencakup objek Storage, bukan hanya baris database.
- Panduan unggah dan pernyataan tujuan penggunaan harus disetujui pemilik sebelum modul dipakai dengan data nyata.

## 9. Usulan backup dan pemulihan

Belum ada bukti backup terjadwal atau uji restore di repo. Usulan:

| Komponen | Usulan | Catatan |
| --- | --- | --- |
| Backup database harian | Disediakan Supabase sesuai paket, atau dump harian terenkripsi | Verifikasi paket dan retensi penyedia; jangan menganggap aktif tanpa bukti. |
| Backup mingguan | Dump logis mingguan ke penyimpanan eksternal terenkripsi | Simpan checksum dan tanggal; akses terbatas. |
| Backup bulanan | 12 salinan bulanan | Uji restore minimal sekali per semester. |
| Storage | Salin objek bukti supervisi secara terpisah bila tidak tercakup backup database | Enkripsi dan kontrol akses yang sama. |
| RPO/RTO usulan | RPO 24 jam (lebih kecil bila PITR tersedia); RTO 4 jam | Pemilik menetapkan angka final. |
| Uji restore | Ke proyek Supabase terpisah atau PGlite untuk skema; data sintetis | Catat hasil, waktu, dan masalah; jangan menguji di produksi. |
| Kredensial | Simpan di pengelola rahasia sekolah; jangan di repo atau chat | Operator teknis ditunjuk pemilik. |

Backup tidak membatalkan migration. Rollback frontend tidak mengembalikan database. Penghapusan data dari database aktif tidak langsung menghapus salinan backup; kebijakan retensi backup harus konsisten dengan jadwal di atas.

## 10. Kesenjangan teknis dan pekerjaan lanjutan

Tidak ada pekerjaan yang dikerjakan pada draf ini. Bila pemilik menyetujui, pekerjaan berikut memerlukan migration lokal dan tes PGlite terpisah:

1. Kebijakan dan kolom penanda `deactivated_at`/`anonymized_at` bila diperlukan.
2. Perbaikan FK `profiles` atau akun sistem untuk memungkinkan penghapusan/anonimisasi tanpa memutus audit.
3. Jalur penghapusan objek Storage yang diaudit, termasuk bukti terbit.
4. Prosedur/anonymisasi snapshot dan kolom bebas (absensi, asesmen, umpan balik, komunikasi, kebiasaan, supervisi).
5. Kebijakan retensi audit dan pseudonimisasi pelaku.
6. Backup terjadwal, penyimpanan eksternal, dan uji restore.
7. Halaman/prosedur permintaan penghapusan; saat ini tidak ada UI.
8. Keputusan K1 (`todos`) dan S-02 (akses bukti) sebelum retensi bukti dijalankan.

## 11. Peran dan persetujuan

| Peran | Tanggung jawab |
| --- | --- |
| Pemilik sekolah | Menetapkan kebijakan, masa retensi, dasar pemrosesan, dan pengecualian arsip. |
| Kepala sekolah | Menyetujui penghapusan/anonymisasi dan retensi bukti supervisi. |
| Administrator | Menjalankan prosedur, melepas relasi, dan mencatat bukti. |
| Operator teknis | Menjalankan backup/restore dan menghapus akun/objek Storage sesuai persetujuan. |
| Qoder | Menyusun draf dan meninjau kepatuhan teknis; tidak menetapkan kebijakan. |
| Copilot | Implementasi migration/tes setelah keputusan pemilik. |
| Kilo | Uji alur, checklist UAT, dan bukti backup/restore. |

## 12. Keputusan yang diminta dari pemilik

1. Setujui atau ubah jadwal retensi pada Bagian 4.
2. Pilih Opsi A, Opsi B, atau kombinasi untuk setiap kategori.
3. Tetapkan dasar pemrosesan, pemberitahuan privasi, dan pengecualian arsip resmi.
4. Tetapkan siapa yang berwenang menyetujui penghapusan dan target respons.
5. Tetapkan aturan unggah dan retensi bukti supervisi.
6. Tetapkan retensi komunikasi dan audit, termasuk pseudonimisasi pelaku.
7. Tetapkan RPO/RTO, paket backup Supabase, penyimpanan eksternal, dan pemilik kunci enkripsi.
8. Setujui perubahan skema/FK yang diperlukan sebelum hard-delete diuji.

## 13. Batas verifikasi

- Tidak ada data nyata, hosted, atau akun sekolah yang dibaca/diubah.
- Tidak ada migration, kode, tes, atau konfigurasi backup yang dijalankan.
- Draf belum ditinjau penasihat hukum/arsiparis dan belum disahkan pemilik.
- Kondisi teknis berasal dari migration dan dokumen audit; perilaku hosted dan backup penyedia belum diverifikasi.

## 14. Laporan sesi

```
Tugas: L16 (draf retensi) | Agen: Qoder | Branch: working tree ai/codex-pdf-splitting (tidak ada commit)
Hasil: Draf kebijakan retensi D-01/D-02, opsi penghapusan, alur permintaan, aturan bukti supervisi, dan usulan backup/RPO-RTO.
Bukti: telaah migration, AUDIT_DATA_ANAK.md, AKTIVASI_DAN_RILIS.md; tidak ada tes kode yang dijalankan karena hanya dokumentasi.
Berkas: docs/DRAFT_RETENSI_DATA_ANAK.md, docs/AI_COORDINATION.md.
Belum diverifikasi: backup/restore hosted, kepatuhan hukum, perilaku FK saat penghapusan akun, persetujuan pemilik.
Butuh pemilik: jadwal retensi, opsi hapus/anonymize, dasar pemrosesan, RPO/RTO, dan perubahan skema yang diizinkan.
```
