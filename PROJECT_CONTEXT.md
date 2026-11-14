# SI STIR HEBAT — SDN 03 Wonosari

Sistem Informasi Supervisi Terintegrasi, Ruang Harmonis Edukatif, Bersama wujudkan Anak Indonesia Hebat untuk SDN 03 Wonosari.

## Pengguna dan target fitur

- **Kepala sekolah:** supervisi guru (pra-observasi, observasi, pasca-observasi, tindak lanjut) dan kontrol pengiriman perangkat/administrasi pembelajaran.
- **Guru:** simpan perangkat pembelajaran, daftar hadir murid, asesmen/hasilnya, dan hasil supervisi.
- **Murid:** 7 Kebiasaan Anak Indonesia Hebat; jenjang kelas 1–6 dengan mapel PJOK dan PAI.
- **Orang tua/wali:** kirim pemberitahuan ketidakhadiran anak ke sekolah atau guru.

Target di atas berasal dari ringkasan pengguna tanggal 14 November 2026 dan bukan bukti bahwa seluruh modul sudah tersedia. Status implementasi serta batas tiap modul dicatat di `README.md` dan `docs/PROJECT_STATUS.md`.

## Desain

Arahan pengguna terbaru untuk tampilan: elegan, modern, mobile-first dan responsif; ungu tua, ungu lilac, biru muda, aksen pink ceria; font profesional dengan sisi playful dan nuansa Gen Z. Jangan merombak halaman/fitur yang sudah selesai kecuali diminta. Terapkan arahan ini pada fitur baru atau pekerjaan polish yang disetujui, dengan kontras dan aksesibilitas yang memadai.

## Tech stack

React 19, Vite 6, TypeScript 5.8, React Router 7, Supabase Auth/PostgreSQL/Storage/RLS, ESLint, PGlite, dan Playwright. Gunakan Node.js 24 untuk pemeriksaan konsisten dengan CI.

## Aturan kerja

- Root kanonis: folder proyek ini. `D:\code\my-app` adalah contoh Next.js terpisah.
- Baca `AGENTS.md`, `README.md`, `docs/PROJECT_STATUS.md`, dan `docs/DECISIONS.md` sebelum menentukan fitur/perizinan. Dokumen lengkap PRD/RBAC/database/UI-UX di `docs/references/` belum tersedia; gunakan ringkasan pengguna ini untuk cakupan tingkat tinggi, tetapi jangan mengarang alur, data, atau RBAC yang belum ditentukan.
- Pertahankan arsitektur React/Vite dan perubahan pengguna; jangan menghapus atau menulis ulang fitur yang sudah selesai.
- Otorisasi harus ditegakkan di database/RLS dan validasi server, bukan hanya dengan menyembunyikan UI.
- Jangan menampilkan data sekolah nyata dalam fixture; tandai data sintetis dengan “Data Contoh”.
- Jangan membaca atau mencetak `.env.local`, token, password, secret, atau service-role key.
- Jangan mengubah database hosted, deploy, atau push tanpa persetujuan yang sesuai.
- Jalankan pemeriksaan yang relevan dan catat hasil nyata di `docs/PROJECT_STATUS.md`.
