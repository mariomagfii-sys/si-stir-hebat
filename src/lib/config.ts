export function getPublicSupabaseConfig(rawUrl: string | undefined, rawKey: string | undefined) {
  const url = rawUrl?.trim()
  const key = rawKey?.trim()
  if (!url || !key || url.includes('YOUR_PROJECT') || key.includes('YOUR_PUBLISHABLE_KEY')) return null
  try {
    const parsed = new URL(url)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
    if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) return null
    if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') return null
    if (!key.startsWith('sb_publishable_')) {
      const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.role !== 'anon') return null
    }
    return { url: parsed.origin, key }
  } catch { return null }
}
