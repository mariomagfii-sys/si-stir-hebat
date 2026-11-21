export type PublicSupabaseConfig = { url: string; key: string }

export function getPublicSupabaseConfig(rawUrl: string | undefined, rawKey: string | undefined): PublicSupabaseConfig | null {
  const url = rawUrl?.trim()
  const key = rawKey?.trim()
  if (!url || !key || url.includes('YOUR_PROJECT') || key.includes('YOUR_PUBLISHABLE_KEY')) return null
  try {
    const parsed = new URL(url)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
    if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) return null
    if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') return null
    if (['example.supabase.co', 'your-project.supabase.co', 'project-ref.supabase.co'].includes(parsed.hostname.toLowerCase())) return null
    if (!/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(key)) return null
    return { url: parsed.origin, key }
  } catch { return null }
}

export function resolvePublicRuntimeConfig(rawUrl: string | undefined, rawKey: string | undefined, dev: unknown) {
  const supabaseConfig = getPublicSupabaseConfig(rawUrl, rawKey)
  const isConfigured = supabaseConfig !== null
  return { supabaseConfig, isConfigured, demoAllowed: dev === true && !isConfigured }
}

const env = (import.meta as ImportMeta & {
  env?: Record<string, string | boolean | undefined>
}).env ?? {}
const runtimeConfig = resolvePublicRuntimeConfig(
  typeof env['VITE_SUPABASE_URL'] === 'string' ? env['VITE_SUPABASE_URL'] : undefined,
  typeof env['VITE_SUPABASE_PUBLISHABLE_KEY'] === 'string' ? env['VITE_SUPABASE_PUBLISHABLE_KEY'] : undefined,
  env.DEV,
)

export const publicSupabaseConfig = runtimeConfig.supabaseConfig
export const isConfigured = runtimeConfig.isConfigured
export const demoAllowed = runtimeConfig.demoAllowed
