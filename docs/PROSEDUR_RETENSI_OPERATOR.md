# Prosedur operator retensi sementara

Status: prosedur operasional, bukan penghapusan otomatis. Retensi sementara mengikuti keputusan pemilik 20 November 2026 sebagaimana direvisi 21 November 2026 dan dapat direvisi lagi.

## Jadwal

| Data | Retensi sementara |
|---|---|
| Registri siswa, absensi, nilai, jurnal | Selama siswa terdaftar + 5 tahun ajaran |
| Audit/event | 5 tahun |
| Pesan komunikasi | 1 tahun ajaran |
| Bukti supervisi | 1 tahun ajaran |

Tidak ada job atau trigger yang menghapus otomatis. Snapshot absensi/nilai/audit dipertahankan sesuai masa retensi.

## Siswa keluar

1. Verifikasi permintaan/perubahan status dengan prosedur sekolah di luar aplikasi. Jangan mengubah atau menghapus akun/peran otomatis.
2. Dalam satu transaksi/perubahan atomik, nonaktifkan registri siswa serta relasi/keanggotaan aktif terkait, lalu lepaskan tautan `students.profile_id` dan relasi wali-anak bila sekolah menginstruksikan. D5 menempatkan nonaktif sebelum lepas tautan; task X9 menyebut lepas tautan sebelum nonaktif. Menyatukannya dalam satu transaksi menghindari keadaan antara yang terlihat.
3. Catat identitas operator dan alasan pada catatan operasional terlindungi. Jangan mengganti peran akun untuk menonaktifkannya.
4. Pastikan snapshot historis tetap ada dan akses lanjutan mengikuti RLS setelah status/relasi dinonaktifkan.
5. Sebelum menghapus akun Auth, periksa FK yang menunjuk ke `profiles`. Data event/audit memakai FK aktor; penghapusan profil dapat ditolak agar atribusi historis tidak hilang. Jangan null-kan/pindahkan audit untuk memaksa delete. Bila FK riwayat masih ada, hentikan dan minta keputusan pemilik tentang arsip akun/atribusi historis.
6. Hanya setelah semua FK mengizinkan dan otorisasi pemilik/operator tercatat, hapus Auth user. Pastikan tidak ada sesi/perangkat bersama yang tertinggal.
7. Sebelum penghapusan yang disetujui, buat backup yang dipulihkan ke lingkungan terisolasi dan catat bukti pemulihan. Simpan bukti tanpa data anak di repository/log.

Uji PGlite pada 20 November 2026 membuktikan Auth delete ditolak saat `students.profile_id` masih terhubung; setelah tautan dilepas dan registri dinonaktifkan dalam transaksi, Auth delete sintetis berhasil dan baris registri tetap ada. Ini tidak menguji FK audit dari pengguna yang sudah beraktivitas atau Supabase lokal/hosted. Jangan eksperimen pada akun atau data sekolah nyata.
