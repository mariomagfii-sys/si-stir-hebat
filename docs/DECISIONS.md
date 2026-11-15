# Keputusan implementasi dan keputusan pemilik

Dokumen ini mencatat keputusan pemilik dan asumsi teknis konservatif. Tujuh dokumen acuan telah disalin ke `docs/references/` pada 15 November 2026; lihat indeks dan hierarki otoritasnya di `docs/references/README.md`. Keputusan pemilik di bawah mengikat dan menggantikan bagian acuan yang bertentangan.

## Keputusan pemilik — 15 November 2026

### D1 — Migrasi bertahap ke Next.js

Next.js disetujui eksplisit oleh pemilik untuk SI STIR HEBAT, dimigrasi bertahap setelah Codex/Cursor aktif. Sampai itu, kode tetap Vite. Supabase + RLS tetap menjadi otoritas akses; tidak ada service-role key di klien.

- Persetujuan ini menggantikan larangan migrasi pada `AGENTS.md` dan pilihan stack pada PRD bagian 10.
- Tidak ada migrasi kode, dependency, atau deployment yang dilakukan dalam tugas dokumentasi ini.
- Rencana tahapan, kriteria selesai, dan pengalihan route harus disusun sebelum perubahan stack dimulai.
- Aturan keras lain tetap berlaku: tidak ada service-role key atau secret di klien, repo, atau log; otorisasi tetap ditegakkan di PostgreSQL/RLS, bukan hanya UI.

### D2 — Indikator ketuntasan tampilan

KKM = 75. Persen = skor/maksimum x 100. >=75 Tuntas, <75 Belum tuntas. Hanya indikator tampilan. Tidak ada rapor otomatis/bobot/predikat. Nilai kosong bukan Belum tuntas. Ini menggantikan larangan ketuntasan pada keputusan skema sementara.

- Nilai mentah, maksimum asesmen, publikasi manual, dan riwayat koreksi tetap seperti keputusan skema sementara.
- Indikator tidak boleh mengubah nilai tersimpan, membuat peringkat, atau menjadi dasar keputusan akademik otomatis.
- Nilai kosong, belum diisi, atau tidak dapat dihitung tidak boleh ditampilkan sebagai "Belum tuntas".
- Penerapan UI dan tesnya belum dikerjakan dan memerlukan tugas terpisah.

### D3 — PRD bagian 10 diperbarui

Bagian 10 PRD (Next.js/Tailwind/Zod/monorepo) diperbarui oleh D1; Tailwind, Zod, dan monorepo tidak diwajibkan.

- Ketentuan PRD lain tetap berlaku sejauh tidak bertentangan dengan aturan keras atau keputusan pemilik yang lebih baru.
- Pemilihan pustaka tambahan tetap memerlukan keputusan tersendiri; D3 tidak memberi izin menambah dependency.

### D4 — Retensi data anak

Retensi data anak: **BELUM DIPUTUSKAN**.

- Tidak ada penghapusan, anonymisasi, atau pembatasan retensi data yang boleh dibuat berdasarkan dokumen ini sampai pemilik mengisi keputusan.
- Usulan dan batasan teknis tersedia di `docs/DRAFT_RETENSI_DATA_ANAK.md`; usulan tersebut bukan keputusan.
- Perubahan schema, migration, job pembersihan, atau alur penghapusan akun harus menunggu keputusan pemilik dan persetujuan terpisah.

### D5 — Mode demo hanya untuk pengembangan

Mode demo hanya boleh aktif saat `import.meta.env.DEV` dan tidak ada konfigurasi Supabase yang valid.

- Kredensial akun demo tidak boleh muncul di bundel produksi. Build produksi tanpa konfigurasi Supabase yang valid tetap harus gagal.
- Implementasi acuan: `src/lib/demo-auth.ts` memakai `isDemoModeEnabled()`; data akun demo dipisah dan diganti modul kosong saat `vite build`.
- Mencari akun demo di localStorage atau mengaktifkan demo karena `DEV` tidak terdefinisi tidak diizinkan.

### D6 — Izin penerapan migration hosted

Pemilik mengizinkan penerapan seluruh migration lokal, dengan syarat:

- Backup dan verifikasi prasyarat dilakukan lebih dulu, serta konfirmasi akhir diminta tepat sebelum menerapkan.
- Urutan wajib: `20261114000139_student_habits`, lalu `20261114083827_komunikasi`; jangan melewati migration yang lebih awal.
- Jangan reset database hosted, jangan membaca atau mengubah data pribadi, dan laporkan bukti hasil setelah penerapan.
- Izin ini tidak berlaku untuk deployment, push, atau perubahan Auth/redirect.

## Opsi terbuka — draf umpan balik (K3), menunggu pemilik

Temuan K3: administrator dan kepala sekolah dapat membaca draf umpan balik. Policy saat ini secara efektif menerapkan opsi (b). Dua opsi berikut belum diputuskan; **tidak ada perubahan policy, migration, atau kode dalam tugas ini**.

### Opsi (a) — draf hanya terbaca penulis

- Guru penulis dapat membaca dan mengubah drafnya sampai publikasi.
- Administrator, kepala sekolah, siswa, dan wali tidak dapat membaca draf; mereka hanya dapat membaca umpan balik yang sudah terbit.
- Konsekuensi: memerlukan perubahan policy SELECT dan tes peran; pengawasan staf atas draf tidak tersedia.
- Pertanyaan pemilik: apakah kepala sekolah memerlukan akses draf untuk pembinaan sebelum publikasi?

### Opsi (b) — admin/kepala sekolah boleh membaca draf

- Guru penulis tetap pemilik draf; administrator dan kepala sekolah dapat membaca draf, tetapi tidak otomatis dapat mengubah atau menerbitkannya.
- Siswa dan wali tetap hanya membaca umpan balik terbit.
- Konsekuensi: sesuai perilaku saat ini; privasi draf lebih rendah dan harus dijelaskan dalam panduan peran.
- Pertanyaan pemilik: apakah akses baca draf perlu dibatasi (misalnya hanya kepala sekolah, atau hanya setelah draf final)?

Sampai pemilik memilih, jangan mengubah policy dan jangan menyatakan salah satu opsi sebagai kebijakan resmi.

## Keputusan teknis sementara

- Tetap menggunakan stack serta struktur source yang sudah ada sampai D1 dijalankan. Folder fitur dibuat saat ada implementasi nyata; tidak membuat halaman kosong untuk modul yang belum dibangun.
- Data master awal berisi identitas sekolah, tahun ajaran, semester, mata pelajaran, dan kelas. Nama sekolah, alamat, NPSN, kalender, dan kelas tidak diisi otomatis sebagai data nyata.
- Administrator mengelola data master administratif; peran sekolah yang sudah ditetapkan dapat membacanya. Kepala sekolah tidak diberi mutasi otomatis pada master data, dan administrator tidak memperoleh kewenangan persetujuan akademik.
- Pengguna pending/anonim tidak memperoleh akses data master. Semua keputusan akses juga ditegakkan di PostgreSQL.
- Data siswa, kontak wali, nilai, dan dokumen pribadi tidak dimasukkan ke tabel master yang dapat dibaca semua peran sekolah.
- Tidak menyediakan hapus permanen untuk master data. Perubahan yang mengaktifkan tahun ajaran meminta konfirmasi; hanya satu tahun aktif dan satu semester aktif per tahun yang diizinkan.
- Identitas sekolah tidak memiliki nilai default seolah-olah data resmi. Operator harus mengisi nilai yang telah diverifikasi.
- Penerapan migration baru, perubahan akun, izin eksternal, push dan deployment publik memerlukan persetujuan sesuai master prompt. Persetujuan migration sebelumnya tidak digunakan untuk migration baru.

## Registri guru dan siswa

- Registri awal menyimpan kode internal sekolah, nama dan status aktif; tidak meminta NIK, tanggal lahir, kontak pribadi, password, atau NIP/NISN yang belum ditetapkan dalam blueprint.
- Administrator mengelola catatan; kepala sekolah membaca. Guru dan siswa membaca baris profil sendiri sesuai peran saat ini. Akses guru ke siswa lain hanya diperbolehkan melalui penugasan dan keanggotaan kelas aktif, sebagaimana fase berikutnya di bawah.
- Orang tua tidak membaca registri sampai relasi wali-anak dan proses verifikasinya tersedia. Pending/anonim ditolak.
- Mencatat guru/siswa tidak membuat akun Authentication. Kolom penghubung akun dan metadata pembuatan tidak dapat diisi/diubah melalui klien, termasuk oleh administrator aplikasi.
- Penghubungan profil memerlukan verifikasi operator dan persetujuan tersendiri; alur penghubungan belum tersedia di UI. Tidak ada penghubungan maupun perubahan peran akun dilakukan pada fase ini.
- Registri tidak menentukan kelas siswa secara permanen. Keanggotaan kelas per tahun ajaran dan penugasan guru menggunakan tabel relasi terpisah.

## Keanggotaan kelas dan penugasan

- Administrator menambah relasi dan mengubah status aktif; kepala sekolah membaca. Ini bukan persetujuan akademik. Identitas siswa/guru/kelas/mata pelajaran pada relasi tersimpan tidak dapat ditulis ulang oleh klien; perpindahan dilakukan dengan menonaktifkan relasi lama lalu membuat relasi baru.
- Tahun ajaran berasal dari kelas, bukan input bebas. Satu siswa hanya memiliki satu kelas aktif pada tahun ajaran yang sama; riwayat nonaktif dan keanggotaan tahun berbeda dapat dipertahankan.
- Kapasitas kelas diperiksa di database dengan penguncian baris kelas; penurunan kapasitas di bawah jumlah anggota aktif ditolak. Tes PGlite memeriksa invariant secara sekuensial, bukan stress-test konkurensi multikoneksi.
- Penugasan aktif membutuhkan guru, kelas, dan mata pelajaran aktif. Guru yang terhubung ke akun dengan peran teacher dapat membaca siswa aktif di kelas penugasannya. Tidak ada penulisan nilai/absensi atau data siswa diberikan oleh tahap ini.
- Keanggotaan, kelas, siswa, guru, dan penugasan harus memenuhi status aktif untuk akses guru. Pencabutan status langsung memengaruhi pembacaan database berikutnya; salinan data yang sudah diunduh tidak dapat ditarik kembali.
- Fungsi lookup izin berada di schema privat yang tidak diekspos Data API, memeriksa identitas pemanggil dan peran di dalam fungsi, serta tidak menerima parameter identitas pemanggil dari klien. Ini menghindari rekursi RLS tanpa membuka pembacaan umum.
- Siswa hanya membaca riwayat keanggotaannya sendiri. Orang tua/pending/anonim tidak membaca relasi. Penghubungan akun dan verifikasi wali masih di luar tahap ini.
- Pilihan relasi menampilkan nama/kode serta tahun kelas, tanpa meminta UUID pengguna. Lookup saat ini dibatasi di bawah 1.000 baris per jenis; bila batas tercapai, pemuatan gagal secara eksplisit. Pencarian referensi berskala lebih besar adalah pekerjaan lanjutan.

## Absensi manual — tahap awal

- Absensi harian per kelas, bukan per mata pelajaran. Guru dengan penugasan kelas/mata pelajaran aktif dapat mencatat kelas tersebut. Administrator/kepala sekolah membaca laporan; tidak mendapat hak mencatat kehadiran atau menyetujui akademik secara otomatis.
- Sesi baru hanya untuk hari ini menurut Asia/Jakarta dan harus berada dalam kalender kelas. Ini konsisten dengan konteks waktu aplikasi saat ini. Backdate diblokir karena keanggotaan aktif belum memiliki interval tanggal berlaku yang dapat merekonstruksi peserta lampau dengan benar.
- Saat sesi dibuat, database menyalin peserta aktif berikut kode/nama ke catatan sesi. Status awal NULL berarti belum diisi; tidak disamakan dengan hadir atau alpa. Nama/kode snapshot tetap konsisten walau registri diperbaiki kemudian.
- Status: hadir, sakit, izin, alpa. Koreksi status yang sudah terisi memerlukan alasan 5–300 karakter. Setiap perubahan mencatat status lama/baru, pelaku, alasan dan waktu; klien tidak dapat menulis langsung ke tabel catatan/audit.
- Penyimpanan melalui RPC tervalidasi, maksimal 100 catatan (sesuai batas kapasitas kelas), atomik per batch. Nomor revisi mencegah perubahan terakhir menimpa pembaruan orang lain secara diam-diam. Jika ada kegagalan, semua perubahan batch dibatalkan.
- Guru hanya mengakses kelas dengan penugasan yang masih berlaku. Siswa membaca catatan sendiri dan tidak melihat alasan koreksi staf. Orang tua/pending/anonim ditolak sampai relasi wali terverifikasi tersedia.
- Rekap UI dan ekspor CSV mencakup catatan sesi yang diizinkan RLS. Export menggunakan status tersimpan, bukan draft. Riwayat UI dibatasi 200 perubahan terbaru; daftar sesi dipaginasi 20 per halaman.
- Sesi lampau, workflow persetujuan koreksi, dan laporan resmi belum diimplementasikan. Impor XLSX dan rekap rentang tanggal ditambahkan pada fase berikutnya di bawah.

## Impor Excel absensi

- Template `.xlsx` berisi identitas sesi yang dapat dibaca manusia serta kolom Kode siswa, Status, Alasan koreksi. Kode diperlakukan sebagai teks untuk menjaga angka nol di depan. Identitas sesi dan seluruh kode harus cocok dengan peserta yang boleh diakses pengguna.
- Preview wajib sebelum konfirmasi. Kesalahan header, kode asing/ganda, tipe sel, status, koreksi tanpa alasan, atau lebih dari 100 peserta memblokir seluruh impor. Status kosong dan baris yang tidak dimasukkan tidak diubah; tidak otomatis menjadi alpa.
- File maksimal 2 MB, satu worksheet, maksimal 100 entri ZIP, maksimal 4 MB per entri dan 10 MB total ukuran isi terdeklarasi. Makro, tautan workbook eksternal, serta formula worksheet ditolak. Parser berjalan dalam worker dengan timeout 10 detik; pemeriksaan ini membatasi input, bukan jaminan umum terhadap semua berkas ZIP berbahaya.
- File asli tidak diunggah/disimpan. Riwayat menyimpan nama file sederhana, hash file dari klien, jumlah baris/perubahan, aktor dan waktu. Hash file bukan bukti bahwa server memeriksa file asli; server hanya menerima perubahan tervalidasi dan tetap memeriksa seluruh izin/status/revisi.
- RPC mengikat perubahan dan riwayat dalam satu transaksi. ID permintaan, aktor, sesi, metadata, dan fingerprint perubahan dihitung/diperiksa untuk idempotensi. Retry identik mengembalikan hasil sebelumnya; penggunaan ulang ID dengan muatan berbeda ditolak. Fingerprint perubahan dihitung server; aktor tidak berasal dari file atau klien.
- Guru yang ditugaskan mengimpor. Administrator/kepala sekolah membaca riwayat, tanpa hak mengimpor; siswa/orang tua/pending/anonim tidak membaca riwayat impor.
- Perubahan manual yang belum disimpan menghalangi impor. Konflik revisi mengharuskan preview dibaca ulang setelah refresh. UI menampilkan 20 impor terakhir per sesi; riwayat bukan penyimpanan file atau mekanisme persetujuan akademik.

## Rekap rentang tanggal

- Rekap baca saja pada `/absensi`, satu kelas dan maksimal 31 hari inklusif. Semua query memakai klien pengguna dan RLS absensi yang sudah ada; tidak menambah izin, tabel, atau migration. Administrator/kepala sekolah membaca, guru sesuai penugasan, siswa hanya catatan sendiri. Parent/pending tetap ditolak.
- Filter tanggal diterapkan pada sesi di server. Maksimal 32 sesi dibaca sebagai sentinel (invariant satu kelas/satu hari); lebih dari 31 ditolak. Catatan diambil per sesi dengan sentinel 101 (batas roster 100), empat permintaan bersamaan, agar hasil 3.100 catatan tidak terpotong batas default Data API 1.000 baris. Kegagalan salah satu query membuang seluruh hasil dan menonaktifkan ekspor.
- Agregasi berdasarkan `student_id`, bukan kode/nama yang bisa berubah. Nama/kode mengikuti snapshot sesi terakhir dalam rentang; semua lima kategori termasuk belum diisi ditampilkan. Sesi/anggota yang tidak ada atau tidak diizinkan tidak disimpulkan menjadi alpa. Tidak menghitung persentase atau hari efektif sekolah.
- Filter yang diubah membersihkan hasil/ekspor sebelumnya. CSV mengikuti hasil tersimpan yang selesai dimuat, bukan draft manual. Tidak membaca audit, alasan koreksi, atau profil lain. Ekspor memakai perlindungan formula CSV yang tersedia.
- Pembacaan beberapa query bukan snapshot transaksi tunggal. Waktu pemuatan dan batas cakupan terlihat di UI; pencabutan akses/perubahan di tengah pemuatan bisa mengubah himpunan terlihat. Laporan resmi dengan konsistensi snapshot memerlukan rancangan server tersendiri.

## Jurnal mengajar - tahap awal

- Catatan guru berupa topik (1-160 karakter), kegiatan (1-4.000), dan refleksi opsional (maksimal 2.000). Tahap ini bukan modul ajar, bukti persetujuan akademik, atau penilaian siswa. Dokumen PRD/RBAC resmi tetap belum tersedia; kewenangan ini keputusan sementara.
- Satu catatan mengacu tepat pada penugasan guru/kelas/mapel aktif. Guru harus aktif dan profilnya berperan teacher. Tanggal pencatatan hanya hari ini (Asia/Jakarta) dalam kalender tahun ajaran kelas. Tidak mendukung backdate. Beberapa kegiatan pada penugasan/hari yang sama diizinkan.
- Penulis/waktu serta nama guru, kelas, mapel dan tahun disalin server saat insert. Klien tidak mendapat izin mengirim metadata tersebut. Snapshot tetap terbaca oleh staf ketika referensi berganti nama.
- Guru membaca catatan buatannya sendiri selama penugasan/guru/kelas/mapel masih aktif. Guru lain tidak membaca jurnal tersebut meskipun mengajar kelas yang sama. Administrator dan kepala sekolah hanya membaca. Siswa, parent, pending dan anonim ditolak. Tidak membuka profil pengguna lain untuk membuat daftar jurnal.
- Catatan tersimpan tidak dapat diedit atau dihapus oleh klien. Koreksi berjejak dan alur persetujuan belum dirancang; tidak menambahkan status approved/draft yang menyiratkan kewenangan belum disepakati.
- Form memerlukan konfirmasi sebelum insert. UUID catatan dibuat saat form dibuka dan dipertahankan saat retry. Jika insert ulang mendapat 23505, UI hanya menerima catatan yang dapat dibaca dengan ID dan seluruh isi sama. Isi berbeda tidak dianggap sukses. Ini mencegah duplikasi retry; bukan deduplikasi dua catatan baru dengan isi sama.
- Teks dirender sebagai teks biasa, tanpa HTML/berkas lampiran. Daftar 20 catatan per halaman; ekspor CSV hanya halaman terlihat dan memakai sanitasi formula yang sudah ada. Pilihan referensi dibatasi dengan deteksi cap, bukan pemotongan diam-diam.
- Migration lokal teaching_journals menambahkan satu tabel, indeks, dua policy, helper privat pengecek penugasan dan trigger invoker. Tidak menulis jurnal contoh, akun atau peran saat diterapkan. Penerapan hosted memerlukan persetujuan tersendiri.
## Skema asesmen sementara — keputusan pengguna, 12 November 2026

- Pengguna menegaskan bahwa nilai maksimum per asesmen dan publikasi manual oleh guru sesuai penugasan adalah **skema sementara**. Pengguna akan memberikan skema resmi kemudian.
- Tidak menghitung rapor otomatis, bobot antarasesmen, atau predikat dari aturan yang belum diberikan. Persentase dalam rekap/grafik hanya nilai dibagi maksimum asesmen, bukan nilai rapor.
- **Digantikan sebagian oleh D2 (15 November 2026):** indikator tampilan boleh memakai KKM 75 dan label Tuntas/Belum tuntas. Larangan rapor otomatis, bobot, dan predikat tetap berlaku; nilai kosong tidak boleh dianggap Belum tuntas.
- Simpan nilai mentah, maksimum tiap asesmen, jenis, publikasi dan riwayat koreksi. Ketika skema resmi diterima, rekonsiliasi aturan dan kebutuhan versi sebelum mengubah interpretasi hasil yang sudah terbit.


13 November 2026: Pengelolaan usulan jadwal mengikuti PRD (admin mengatur jadwal utama; guru mengusulkan). Implementasi awal memakai perubahan seluruh rentang, satu pending per jadwal, keputusan admin dengan alasan, tanpa pemecahan periode otomatis atau penarikan oleh guru. Snapshot/revisi melindungi perubahan admin yang lebih baru. Skema penilaian sementara tetap tidak berubah, kecuali indikator ketuntasan tampilan menurut D2.

## Komunikasi guru dan wali - rancangan sementara

Sampai PRD dan RBAC asli tersedia, usulan paling terbatas adalah pesan teks antar guru yang memiliki penugasan aktif dan wali yang memiliki hubungan terverifikasi dengan siswa aktif pada kelas tersebut. Akses hilang ketika penugasan, keanggotaan, relasi, atau peran tidak lagi berlaku; siswa, pending, anonim, admin dan kepala sekolah tidak mendapat akses otomatis. Pesan bersifat append-only dengan penulis dan waktu server sebagai riwayat; tidak ada lampiran atau notifikasi eksternal. Ini bukan keputusan kebijakan resmi. Pertanyaan terbuka: retensi, kebutuhan akses pengawasan, penarikan pesan, pemberitahuan, dan masa berlaku komunikasi setelah hubungan berakhir.

## ADR-001 — Stack terkunci (usulan, 15 November 2026)

Status: **digantikan sebagian oleh D1–D3 (15 November 2026)**. Butir yang menyatakan Vite sebagai stack tetap dan menolak Next.js tidak lagi berlaku sebagai larangan; Vite tetap dipakai sampai migrasi bertahap D1 dimulai. Butir lain menjadi catatan keadaan saat ini, bukan larangan permanen. ADR ini tidak mengubah kode, dependency, atau hosted.

Konteks: master prompt menetapkan stack terkunci React 19 + Vite + TypeScript + React Router + Supabase (Auth, Postgres, RLS, Storage) dengan deploy Vercel. PRD v1.0 bagian 10 menyebut Next.js, Tailwind, Zod, dan monorepo. D1 menyetujui Next.js secara bertahap; D3 menyatakan Tailwind, Zod, dan monorepo tidak diwajibkan.

Keputusan yang diusulkan:

1. Frontend React 19.1, Vite 6.3, TypeScript 5.8, dan React Router 7.8; CSS global tanpa Tailwind.
2. Backend Supabase: Auth, Postgres, RLS, dan Storage; klien mengakses data langsung dengan otorisasi RLS. Saat ini tidak memakai Next.js atau Express; D1 mengizinkan migrasi bertahap ke Next.js.
3. Satu aplikasi Vite di `SI_STIR_HEBAT_Starter/si-stir-hebat` sampai migrasi D1 dimulai; bukan monorepo.
4. Deploy sebagai SPA di Vercel.
5. Validasi di constraint database, grant kolom, trigger, dan RPC. Zod tidak ditambahkan tanpa keputusan pemilik.
6. Runtime Node 24.x sesuai `package.json` `engines`.
7. Bagian 10 PRD diperbarui oleh D1/D3; bagian PRD lain tetap berlaku sejauh tidak bertentangan dengan aturan keras.

Konsekuensi:

- Dokumen acuan harus direkonsiliasi dengan keputusan ini; migrasi stack bukan wewenang agen.
- Perubahan arsitektur, dependency, atau struktur repo memerlukan ADR baru dan persetujuan pemilik.
- ADR ini belum memutuskan identitas login (email atau NISN/NIP), pemulihan sandi, peran operator teknis, retensi data, atau kebijakan backup.

Bukti: `package.json`, `vite.config.ts`, `vercel.json`, `docs/AUDIT_KESESUAIAN_ACUAN.md` bagian 4, dan master prompt bagian 1.
