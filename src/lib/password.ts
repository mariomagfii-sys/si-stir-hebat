export function validateNewPassword(password: string, confirmation: string): string {
  if (password.length < 8) return 'Kata sandi harus berisi minimal 8 karakter.'
  if (password !== confirmation) return 'Konfirmasi kata sandi belum sama.'
  return ''
}
