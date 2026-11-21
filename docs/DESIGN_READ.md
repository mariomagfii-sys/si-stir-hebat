# Design Read — SI STIR HEBAT

Status: berlaku untuk pekerjaan UI Q1 (A-06/P-05, A-07, P-02, A-03/A-04) dan seterusnya.
Tanggal: 20 November 2026. Penulis: Qoder.
Sifat: dokumentasi arah desain yang sudah berjalan (palet token "editorial school ledger" di `src/styles/global.css:34`), bukan perubahan visual.

## Design Read

- **Siapa:** guru, kepala sekolah, administrator, siswa, dan wali SDN 03 Wonosari. Banyak yang membuka lewat ponsel di sela kegiatan sekolah.
- **Tugas utama:** membaca dan mencatat data sekolah dengan cepat, tanpa ragu apakah data sudah tersimpan atau terpotong.
- **Suasana:** buku catatan sekolah yang rapi dan tegas, bukan dasbor SaaS generik. Kertas terang, tinta gelap, satu aksen terakota untuk tindakan.
- **Batasan:** teks Bahasa Indonesia, target sentuh minimal 44px, tanpa overflow horizontal, kontras AA, otorisasi tetap di RLS.

## Dials

- **ENERGY 2** — tenang dan administratif; ketegasan datang dari garis 2px dan bayangan offset, bukan animasi.
- **RHYTHM 2** — blok konten berulang dengan satu titik fokus per layar (judul board atau angka utama), bukan variasi section yang ramai.
- **MOTION 1** — tanpa animasi dekoratif; hanya transisi status bawaan peramban.

## Konsekuensi yang sudah terlihat di UI

- Satu aksen terakota (`--accent`) untuk tautan tindakan dan fokus; status memakai token `--sand`, `--success-soft`, `--danger-soft`.
- Ikon Lucide dipakai untuk menandai jenis layanan (buku, kalender, centang, pesan) agar navigasi terbaca cepat; tidak ada ikon dekoratif tanpa makna.
- Pesan pemotongan daftar referensi memakai kotak status `--sand` yang sama dengan pesan sistem lain, sehingga pengguna mengenali "ini informasi, bukan galat".
- Tidak ada mode gelap; `color-scheme` dikunci terang karena sekolah memakai proyektor dan layar terang.
