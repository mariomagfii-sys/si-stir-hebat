# Instruksi GitHub Copilot — SI STIR HEBAT

Dokumen ini adalah ringkasan kerja untuk Copilot di VS Code. `AGENTS.md` adalah acuan utama dan wajib dibaca; bila ada pertentangan, ikuti `AGENTS.md`.

## Konteks proyek

- SI STIR HEBAT: sistem informasi sekolah untuk SDN 03 Wonosari, Boalemo, Gorontalo. Aplikasi nyata, bukan mockup.
- Root proyek: folder ini (`D:\code\SI_STIR_HEBAT_Starter\si-stir-hebat`). Jangan membuat atau mengubah proyek di luar folder ini. `D:\code\my-app` adalah contoh Next.js terpisah dan bukan bagian proyek.
- Stack: React 19, Vite 6, TypeScript 5.8, React Router 7, Supabase Auth/PostgreSQL/Storage/RLS, ESLint, PGlite, Playwright. Gunakan Node 24.x.
- Bahasa: UI dan dokumentasi pengguna memakai Bahasa Indonesia; kode mengikuti konvensi yang sudah ada.

## Peta kode

- Rute: `src/app/App.tsx`. Sesi, profil, dan peran: `src/app/Auth.tsx`. Navigasi: `src/app/Header.tsx`, `src/app/Dashboard.tsx`.
- Implementasi fitur: `src/features/<modul>/` (academic, assessments, attendance, auth, dashboard, guardian, habits, journals, learning, parents, reports, schedule, school, students, supervision, teachers).
- Komponen dan gaya: `src/components/ui/`, `src/styles/global.css`.
- Klien Supabase: `src/lib/supabase.ts`. Skema dan policy: `supabase/migrations/`.
- Util CSV: `src/utils/csv.ts` (wajib dipakai untuk escaping dan perlindungan formula).
- Tes: `tests/*.test.mjs`, `tests/browser/` (Playwright), `tests/database.test.mjs` (migration diputar ulang di PGlite).
- Status dan keputusan: `README.md`, `docs/PROJECT_STATUS.md`, `docs/IMPLEMENTATION_LOG.md`, `docs/DECISIONS.md`.
- Skill Supabase tersedia di `.agents/skills/`.

## Perintah

Jalankan dari folder ini:

- `npm run dev` — server lokal di `http://127.0.0.1:5173`.
- `npm run check` — lint + typecheck + tes unit/database + build. Ini pemeriksaan utama.
- `npm test`, `npm run test:browser`, `npm run lint`, `npm run typecheck`, `npm run check:supabase` — pemeriksaan terfokus.

## Aturan wajib

1. Audit dulu: baca kode, migration, tes, dan dokumen terkait sebelum mengubah apa pun. Jangan menebak API atau struktur.
2. Jangan pernah membaca atau mencetak `.env.local`, token, password, secret, atau service-role key. Hanya publishable/anon key yang boleh ada di frontend.
3. Jangan menerapkan migration ke Supabase hosted, reset database, mengimpor data siswa nyata, deploy, atau push tanpa persetujuan eksplisit.
4. Jangan menerapkan ulang migration hosted yang sudah tercatat di `README.md`.
5. Otorisasi harus ditegakkan di PostgreSQL/RLS dan validasi server, bukan sekadar menyembunyikan UI.
6. Ikuti RBAC: administrator, kepala sekolah, guru, siswa, orang tua/wali. Guru mengikuti penugasan aktif; wali mengikuti relasi anak terverifikasi; siswa hanya data sendiri yang diizinkan. Admin bukan otomatis approver akademik.
7. Jangan mengubah atau menulis ulang fitur yang sudah selesai. Pertahankan perubahan pengguna; jangan reset, hapus, atau timpa tanpa izin.
8. Jangan migrasi ke Next.js atau menyalin kode SSR/proxy Next.js ke aplikasi ini.
9. Tandai data sintetis dengan "Data Contoh". Jangan tampilkan data sekolah nyata di fixture.
10. Arahan desain baru: mobile-first, ungu tua, ungu lilac, biru muda, aksen pink, font profesional dengan sisi playful. Terapkan hanya pada fitur baru atau polish yang diminta, dengan kontras dan aksesibilitas memadai.
11. Jangan mengklaim verifikasi untuk tes yang tidak dijalankan. Bedakan hasil Playwright dengan API tiruan, hasil database lokal, dan UAT akun sekolah.
12. Untuk perubahan skema/akses, konsultasikan `docs/` terkait dan skill Supabase/Postgres; untuk absensi, ikuti aturan snapshot peserta, zona Asia/Jakarta, dan arti status kosong sebagai "Belum diisi".

## Alur kerja

audit → rencana singkat → implementasi bertahap → tes relevan → laporkan hasil nyata dan blocker.

Catat perubahan implementasi dan hasil verifikasi di `docs/IMPLEMENTATION_LOG.md` serta perbarui `docs/PROJECT_STATUS.md` sesuai `AGENTS.md`.

## Gaya respons

- Ringkas, Bahasa Indonesia, tunjukkan `file:baris` saat merujuk kode.
- Akhiri dengan: apa yang berubah, apa yang belum, dan cara memverifikasi.
