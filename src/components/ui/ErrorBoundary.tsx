import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <main className="login"><h1>Halaman belum dapat ditampilkan</h1><p role="alert">Silakan muat ulang aplikasi. Jika masalah berlanjut, hubungi pengelola sekolah.</p><button className="button" onClick={() => window.location.assign('/')}>Muat ulang aplikasi</button></main>
    return this.props.children
  }
}
