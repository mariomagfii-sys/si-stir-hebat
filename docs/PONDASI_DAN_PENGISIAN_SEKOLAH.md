# Pondasi dan Pengisian Sekolah

Dokumen ini menetapkan batas pekerjaan pondasi aplikasi. Codex menyiapkan wadah, aturan akses, migration, route, empty state, dan pemeriksaan otomatis. Sekolah/operator mengisi data operasionalnya sendiri setelah deployment.

## Yang disiapkan oleh aplikasi

- Auth dan profil dengan role yang ditetapkan operator.
- RLS untuk membatasi data berdasarkan role, penugasan, kelas, dan relasi wali.
- Master data sekolah, tahun ajaran, semester, mata pelajaran, dan kelas.
- Registri guru dan siswa tanpa membuat akun login otomatis.
- Penugasan guru dan keanggotaan kelas.
- Absensi, impor Excel, jurnal, materi, tugas, asesmen, jadwal, supervisi, portal wali, dan komunikasi.
- Catatan 7 Kebiasaan harian dengan pengisian murid/wali dan validasi guru.
- Empty state dan pesan persiapan ketika data atau migration belum tersedia.
- Test lokal, pemeriksaan migration, typecheck, lint, dan build.

## Urutan yang diisi sekolah

1. Buat akun pengguna melalui Supabase Authentication.
2. Tetapkan role pada profil melalui operator yang berwenang.
3. Isi identitas sekolah.
4. Buat tahun ajaran dan semester.
5. Isi mata pelajaran dan kelas.
6. Isi registri guru dan siswa.
7. Buat penugasan guru serta keanggotaan kelas.
8. Hubungkan akun guru, siswa, dan wali melalui proses verifikasi.
9. Guru mengisi materi, jurnal, absensi, tugas, dan asesmen.
10. Murid/wali mengisi 7 Kebiasaan; guru memvalidasi setelah konfirmasi kepada orang tua.

## Batas keamanan

- Tidak ada data siswa nyata yang di-seed oleh pengembang.
- Password, service-role key, token, dan secret tidak dimasukkan ke source atau dokumen.
- Migration hosted hanya diterapkan setelah backup, pencocokan riwayat, dan persetujuan operator proyek.
- UAT akun sekolah dilakukan setelah sekolah mengisi akun uji dan data uji.
- Keputusan retensi data anak tetap harus ditetapkan pemilik sekolah sebelum penggunaan operasional.

## Definisi selesai pondasi

Pondasi dianggap siap untuk diisi sekolah jika `npm run check` lulus, migration lokal berurutan, route utama dapat dibuka, role yang belum berwenang ditolak, dan seluruh modul menampilkan keadaan kosong yang jelas tanpa mengarang data sekolah.
