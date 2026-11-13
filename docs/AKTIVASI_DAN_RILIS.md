# Aktivasi SI STIR HEBAT

## Aktifkan administrator pertama

Dilakukan sendiri oleh pemilik proyek Supabase. Jangan mengirim kata sandi, OTP atau token melalui chat atau menyimpannya dalam repository.

1. Buka proyek Supabase yang dipakai aplikasi, Authentication → Users. Buat akun operator sekolah menggunakan alamat email yang dikuasai sekolah. Selesaikan verifikasi email sesuai pengaturan proyek. Gunakan kata sandi unik dan kuat.
2. Salin User UID akun tersebut. Akun baru otomatis mendapat profil `pending`.
3. Pada SQL Editor proyek yang sama, jalankan pernyataan berikut setelah mengganti placeholder dengan UID yang benar. Periksa hasilnya tepat satu baris. Ini memberi akses administrator; gunakan hanya untuk operator yang memang berwenang.

```sql
update public.profiles
set role = 'administrator'
where id = 'GANTI_DENGAN_UUID_AKUN_SEKOLAH'::uuid
  and role = 'pending'
returning id, role;
```

4. Buka aplikasi, masuk dengan akun itu, lalu isi nama profil melalui menu Akun. Dashboard harus menampilkan Administrator. Jika tetap pending, keluar dan masuk ulang. Jika SQL tidak mengembalikan baris, periksa UID/proyek dan profil; jangan mengubah akun lain sebagai percobaan.
5. Untuk akun kepala sekolah, guru, siswa atau wali, ulangi proses pembuatan akun, lalu tetapkan peran yang sesuai (`principal`, `teacher`, `student`, `parent`) oleh operator proyek. Penetapan peran belum tersedia melalui UI aplikasi.

## Urutan persiapan sekolah

1. Isi identitas sekolah, tahun ajaran dan semester.
2. Isi mata pelajaran serta kelas pada tahun ajaran yang benar.
3. Tambahkan registri guru dan siswa.
4. Verifikasi dan tautkan akun guru/siswa melalui Tautan akun. Tautkan wali hanya sesudah hubungan anak diverifikasi sekolah.
5. Masukkan keanggotaan kelas dan penugasan guru. Jadwal dan akses guru memerlukan penugasan aktif.
6. Buat jadwal pelajaran. Uji satu alur lengkap dengan akun uji sekolah: absensi, materi/tugas, pengumpulan, penilaian dan publikasi.
7. Pastikan akun siswa/wali hanya menerima data yang semestinya. Nilai masih memakai maksimum per asesmen dan publikasi manual; belum menghitung rapor.

## Import repository ke Vercel

- Repository berisi aplikasi langsung di root; Root Directory Vercel: `.`.
- Framework: Vite. Node: 24.x. Install: `npm ci`. Build: `npm run build`. Output: `dist`.
- Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` pada Environment Variables Vercel untuk Production. Ambil dari proyek Supabase yang sama dengan 22 migration yang telah diterapkan. Jangan memakai nilai tiruan CI.
- Jangan memasukkan service-role key, secret key, password database atau token admin ke variabel `VITE_*`.
- `vercel.json` menyediakan fallback SPA agar `/dashboard`, `/jadwal` dan route lain dapat dibuka langsung.
- Jangan terapkan ulang migration yang sudah ada pada proyek saat ini. Proyek database baru memerlukan seluruh migration berurutan dan verifikasi ulang.

## Setelah mendapatkan alamat deployment

1. Di Supabase Authentication → URL Configuration, set Site URL ke domain produksi HTTPS. Tambahkan URL redirect tepat `https://DOMAIN/kata-sandi`. Tambahkan alamat lokal hanya bila dibutuhkan pengembang. Konfigurasi lokal tidak otomatis memperbarui pengaturan hosted.
2. Periksa pengiriman email pemulihan melalui akun milik sekolah. Pastikan layanan email/SMTP proyek siap untuk penggunaan sekolah dan alur pemulihan benar-benar selesai.
3. Uji login, refresh route langsung, logout, penolakan akses saat sudah keluar, dan pemulihan kata sandi.
4. Uji satu peran guru, siswa dan wali dengan data uji yang diberi label Data Contoh; jangan mengimpor seluruh data sekolah sebelum pemeriksaan peran selesai.
5. Simpan alamat produksi, pemilik akun hosting/database, prosedur backup dan pemulihan, serta kontak operator dalam catatan internal sekolah, bukan repository publik.

## Operasional

Vercel meng-host frontend; Supabase melayani Auth, database dan berkas privat. Pantau keduanya. Pilih kapasitas/backup Supabase sesuai penggunaan, uji pemulihan backup, dan evaluasi kuota serta email sebelum peluncuran. Rollback frontend tidak membatalkan migration database. Simpan perubahan database sebagai migration baru dan uji sebelum diterapkan.

GitHub Actions menjalankan pemeriksaan dengan endpoint/API tiruan. Hasil CI tidak membuktikan login/email produksi berhasil. Status siap pakai penuh membutuhkan deployment terverifikasi dan UAT operator sekolah.
