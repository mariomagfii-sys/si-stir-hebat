import { createClient } from '@supabase/supabase-js'
import { getPublicSupabaseConfig } from './config'
const config = getPublicSupabaseConfig(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
export const supabase = config ? createClient(config.url, config.key) : null
export const isSupabaseConfigured = Boolean(supabase)
