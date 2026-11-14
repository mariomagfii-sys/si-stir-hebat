# Papan Koordinasi AI

Status: TODO | DOING | REVIEW | DONE | BLOCKED

| ID | Tugas | Pemilik | Status | Branch | Catatan |
|----|-------|---------|--------|--------|---------|
| C1 | Modul Komunikasi (pesan/pemberitahuan guru–wali): migration + RLS + API | Codex | TODO | | |
| C2 | Modul Administrasi Dokumen (metadata dokumen, kategori, akses per peran) | Codex | TODO | | |
| C3 | Telaah celah PRD vs fitur terpasang, urutkan prioritas | Codex | TODO | | |
| C4 | Perkecil chunk PDF (dynamic import/code splitting) | Codex | TODO | | |
| U1 | UI modul Komunikasi (setelah C1 REVIEW) | Cursor | TODO | | |
| U2 | UI modul Administrasi Dokumen (setelah C2 REVIEW) | Cursor | TODO | | |
| U3 | Audit responsif & aksesibilitas semua halaman | Cursor | DOING | ai/cursor-akses-status | Cursor |
| U4 | Konsistensi empty/loading/error state | Cursor | DOING | ai/cursor-akses-status | Cursor |
| T1 | Perbaiki 2 tes browser dengan selector alert ambigu, jalankan ulang penuh | Copilot | TODO | | |
| T2 | Tambah tes unit untuk util/validator yang belum tercakup | Copilot | TODO | | |
| T3 | Tes browser untuk Komunikasi & Dokumen (setelah UI REVIEW) | Copilot | TODO | | |
| Q1 | Review keamanan RLS/grant semua migration (laporan, bukan perubahan) | Qoder | TODO | | |
| Q2 | Rapikan README (kritis: hapus info usang/duplikat jumlah migration) | Qoder | TODO | | |
| Q3 | Panduan UAT per peran (admin, kepala sekolah, guru, siswa, wali) | Qoder | TODO | | |
| Q4 | Review PR dari AI lain sebelum merge | Qoder | TODO | | |

## Permintaan Lintas AI
(tulis di sini: dari → ke, apa yang dibutuhkan)

## Urutan merge
Codex (backend) → Cursor (UI) → Copilot (tes) → Qoder (docs). Hanya Codex yang merge ke main.
