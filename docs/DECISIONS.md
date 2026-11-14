# Keputusan dan asumsi

Diperbarui: 14 November 2026.

## Keputusan sementara yang tetap berlaku

- Nilai maksimum per asesmen dan publikasi nilai oleh guru masih bersifat sementara. Jangan membuat perhitungan rapor otomatis sebelum pemilik sekolah menyetujui skema nilai resmi.
- Matriks RBAC resmi belum disahkan. Pertahankan batas akses database yang ada; jangan memperluas akses berdasarkan asumsi UI.
- Akun dibuat dan perannya diverifikasi operator. Signup publik perlu dinonaktifkan setelah administrator pertama aktif; panduan operator memberi langkah verifikasi, bukan bukti konfigurasi hosted sudah berubah.

## Rekonsiliasi migration

- Snapshot repository ini berisi 22 berkas migration; catatan operasional pemilik menyebut 23 migration telah tercatat pada proyek hosted.
- Sampai riwayat repository dan hosted cocok, jangan menerapkan ulang migration, mengubah database hosted, atau mereset database. Perubahan database memerlukan migration baru, tes lokal, pencocokan riwayat hosted, dan persetujuan pemilik sebelum penerapan.
- Ini catatan risiko operasional, bukan keputusan untuk menghapus atau mengubah migration yang ada.

Tidak ada keputusan bisnis baru yang dibuat pada perubahan CI dan dokumentasi ini.
