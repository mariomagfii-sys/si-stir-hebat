# Keputusan implementasi sementara

Master prompt adalah sumber kebutuhan yang tersedia. Delapan dokumen rinci yang disebutkan belum ditemukan di workspace. Keputusan di bawah adalah asumsi teknis konservatif, bukan kutipan PRD atau matriks resmi.

- Tetap menggunakan stack serta struktur source yang sudah ada. Folder fitur dibuat saat ada implementasi nyata; tidak membuat halaman kosong untuk modul yang belum dibangun.
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
- Tidak menghitung rapor otomatis, bobot antarasesmen, predikat, atau batas ketuntasan dari aturan yang belum diberikan. Persentase dalam rekap/grafik hanya nilai dibagi maksimum asesmen, bukan nilai rapor.
- Simpan nilai mentah, maksimum tiap asesmen, jenis, publikasi dan riwayat koreksi. Ketika skema resmi diterima, rekonsiliasi aturan dan kebutuhan versi sebelum mengubah interpretasi hasil yang sudah terbit.


13 November 2026: Pengelolaan usulan jadwal mengikuti PRD (admin mengatur jadwal utama; guru mengusulkan). Implementasi awal memakai perubahan seluruh rentang, satu pending per jadwal, keputusan admin dengan alasan, tanpa pemecahan periode otomatis atau penarikan oleh guru. Snapshot/revisi melindungi perubahan admin yang lebih baru. Skema penilaian sementara tetap tidak berubah.
