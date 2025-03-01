import { createClient } from '@supabase/supabase-js'

export const supabaseClient = createClient('https://<project>.supabase.co', '<your-anon-key>')