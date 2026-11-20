# Manual Pengguna SI STIR HEBAT

Status: panduan pengguna untuk aplikasi yang berjalan. Tidak menggantikan UAT akun sekolah nyata.
Terakhir diperbarui: 20 November 2026.

Istilah: **administrator** = pengelola sekolah; **kepala sekolah** = `principal`;
**guru** = `teacher`; **siswa** = `student`; **wali** = `parent`; **pending** = akun baru yang
belum diberi peran.

## 1. Masuk dan keluar

1. Buka alamat aplikasi sekolah, lalu pilih **Masuk**.
2. Masukkan email dan kata sandi yang diberikan pengelola. Aplikasi tidak pernah meminta OTP
   lewat obrolan atau surel tak resmi.
3. Setelah masuk, Anda diarahkan ke **Dashboard**. Menu di layar mengikuti peran Anda; menu yang
   tidak menjadi kewenangan tidak ditampilkan, dan membukanya lewat tautan langsung tetap ditolak.
4. **Keluar** tersedia di halaman **Akun**. Sesi bertahan saat halaman dimuat ulang.
5. Lupa kata sandi: gunakan **Lupa kata sandi**, buka tautan pemulihan dari surel, lalu tetapkan
   kata sandi baru minimal 8 karakter. Jika surel tidak masuk, hubungi pengelola; jangan mengirim
   kata sandi lewat pesan.

Di ponsel, empat tujuan tercepat tampil di bilah bawah; tombol **Lainnya** membuka daftar menu
lengkap. Di layar lebar, semua menu tampil di panel kiri. Tekan **Escape** untuk menutup menu
Lainnya.

## 2. Beranda, dashboard, dan akun

- **Beranda** menjelaskan pintu masuk tiap peran dan tidak menampilkan data pribadi.
- **Dashboard** merangkum layanan sesuai peran. Angka yang belum dapat dipastikan ditampilkan
  sebagai tidak diketahui, bukan nol.
- **Akun** (`/akun`): ubah nama tampilan dan kata sandi. Peran tidak dapat diubah dari aplikasi;
  perubahan peran hanya dilakukan pengelola lewat prosedur resmi.

## 3. Administrator

| Halaman | Kegunaan |
|---|---|
| Data sekolah (`/sekolah`) | Tahun ajaran, semester, mata pelajaran, kelas, guru, siswa, keanggotaan kelas, penugasan guru, pengaturan sekolah. |
| Tautan akun (`/tautan-akun`) | Menautkan akun pengguna ke data guru/siswa/wali setelah identitas diverifikasi. |
| Pengumuman (`/pengumuman`) | Menulis, menerbitkan, dan menarik pengumuman sekolah. |
| Absensi (`/absensi`) | Memantau sesi kehadiran, rekap, dan riwayat koreksi. |
| Jurnal (`/jurnal`) | Memantau jurnal mengajar guru. |
| Jadwal (`/jadwal`) | Menyusun jadwal dan meninjau usulan perubahan. |
| Modul ajar (`/modul-ajar`) | Meninjau modul yang diajukan guru. |
| Notifikasi | Pesan dalam aplikasi untuk akun Anda. |

Aturan praktis:

- Isi data master dari sumber resmi sekolah. Jangan membuat akun atau data siswa fiktif di
  lingkungan produksi.
- Jangan mengubah peran akun untuk sekadar menonaktifkan akses. Ikuti prosedur siswa keluar di
  `docs/PROSEDUR_RETENSI_OPERATOR.md`.
- Daftar panjang dapat terpotong; gunakan penanda "dipotong" dan pencarian/paginasi yang tersedia,
  bukan menyimpulkan bahwa data hilang.

## 4. Kepala sekolah

- Dashboard menampilkan ringkasan sekolah dan status layanan.
- Supervisi (`/supervisi`): menetapkan dan meninjau tahapan supervisi serta bukti.
- Pengumuman, jadwal, jurnal, absensi, dan modul ajar tersedia untuk pemantauan.
- Kepala sekolah tidak menyusun materi, tugas, atau asesmen.

## 5. Guru

- **Absensi** (`/absensi`): buka sesi hari ini, tandai kehadiran, koreksi dengan alasan, impor Excel
  (pratinjau sebelum menyimpan), dan ekspor rekap. Impor ganda ditolak dengan pesan yang jelas.
- **Jurnal** (`/jurnal`): catat jurnal mengajar; kirim ulang aman jika koneksi terputus.
- **Modul ajar** (`/modul-ajar`): buat draf, ajukan untuk diperiksa, perbaiki bila dikembalikan.
- **Materi dan tugas** (`/materi`, `/tugas`): terbitkan materi dan tugas; nilai dan beri umpan balik.
  Draf umpan balik hanya terlihat oleh penulisnya sampai diterbitkan.
- **Asesmen** (`/asesmen`): susun asesmen, publikasikan nilai, ekspor rekap.
- **Jadwal** (`/jadwal`): lihat jadwal kelas dan ajukan perubahan bila diizinkan.
- **Supervisi** (`/supervisi`): lihat jadwal dan unggah bukti supervisi milik sendiri.
- **Komunikasi** (`/komunikasi`): pesan internal sekolah; kirim ulang memakai ID yang sama jika
  respons jaringan hilang, sehingga tidak terjadi pesan ganda.
- **7 Kebiasaan** (`/kebiasaan`): pantau rekap kelas. Baca rekap anak, bukan peringkat.
- **Laporan ketidakhadiran** (`/laporan-ketidakhadiran`): tinjau laporan wali; konfirmasi hanya
  dengan catatan. Konfirmasi guru **tidak** otomatis mengisi absensi final.

## 6. Siswa

- **Materi** dan **Tugas** (`/materi`, `/tugas`): baca materi terbit, kumpulkan tugas sebelum
  tenggat, lihat umpan balik yang sudah diterbitkan.
- **Asesmen** (`/asesmen`): lihat nilai yang sudah dipublikasikan dan label KKM.
- **Jadwal** (`/jadwal`): lihat jadwal kelas.
- **7 Kebiasaan** (`/kebiasaan`): catat kebiasaan hari ini. Sel kosong berarti **belum diisi**,
  berbeda dari **tidak dilakukan**.

## 7. Wali

- **Ruang Orang Tua** (`/ruang-orang-tua`): ringkasan kehadiran dan informasi anak yang tertaut.
- **Laporan ketidakhadiran** (`/laporan-ketidakhadiran`): kirim laporan sakit/izin untuk tanggal
  lampau. Guru kelas memverifikasi atau menolak. Laporan tidak otomatis menjadi status absensi.
- **7 Kebiasaan** (`/kebiasaan`): isi checklist harian anak tertaut. Aplikasi tidak memberi
  peringkat, hukuman, atau perbandingan antarsiswa.
- **Pengumuman** dan **Notifikasi** menampilkan kabar sekolah dan pesan untuk akun Anda.
- Hanya anak yang tertaut resmi yang terlihat. Jika anak tidak tampil, hubungi pengelola.

## 8. Notifikasi dan komunikasi

- **Pusat notifikasi** (`/notifikasi`): 25 pesan per halaman. Tombol "Tandai sudah dibaca"
  menyimpan status; jika gagal, pesan tetap ada dan dapat dicoba lagi.
- Notifikasi hanya di dalam aplikasi; tidak ada kiriman surel/WhatsApp otomatis.
- Kanal komunikasi internal memakai pesan teks. Jangan mengirim data sensitif yang tidak
  diperlukan, dan jangan berbagi kata sandi lewat pesan.

## 9. Batasan yang perlu diketahui

- Modul **Administrasi Dokumen** belum memiliki halaman UI (backend belum dinyatakan siap); menu
  dokumen tidak tersedia.
- Dashboard belum memakai RPC ringkasan terpadu; angka tetap diambil dari layanan yang ada dan
  tetap mengikuti RLS.
- UAT dengan akun sekolah nyata, pengiriman surel, dan pengaturan Auth hosted belum dilakukan;
  status tersebut bukan tanggung jawab manual ini.
- Bila layar menampilkan galat atau keadaan kosong, ikuti tombol **Coba lagi**. Jangan mengulang
  formulir dengan membuat data baru jika pesan menyebut data sudah ada.
