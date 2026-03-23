import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PUBLIC_URL_SUPABASE || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_KEY_SUPABSE || ''

export const supabase = createClient(supabaseUrl, supabaseKey)
