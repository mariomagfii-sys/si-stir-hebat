import { createClient } from '@supabase/supabase-js'
import { isConfigured, publicSupabaseConfig } from './config.ts'

export const supabase = isConfigured && publicSupabaseConfig
  ? createClient(publicSupabaseConfig.url, publicSupabaseConfig.key)
  : null
