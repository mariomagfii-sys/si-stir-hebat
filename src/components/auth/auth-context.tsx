import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthState = { session: Session | null; loading: boolean; error: string }

export const AuthContext = createContext<AuthState>({ session: null, loading: true, error: '' })

export const useAuth = () => useContext(AuthContext)
