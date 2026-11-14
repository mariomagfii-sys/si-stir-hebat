import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { getPublicSupabaseConfig } from './src/lib/config'
export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  if (command === 'build' && !getPublicSupabaseConfig(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY)) {
    throw new Error('Build dihentikan: konfigurasi Supabase belum valid. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY pada hosting sebelum build.')
  }
  return {
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/pdfmake/')) return id.includes('vfs_fonts') ? 'pdf-fonts' : 'pdf-engine'
          if (id.includes('node_modules')) return id.includes('@supabase') ? 'supabase' : 'vendor'
        },
      },
    },
  },
  }
})
