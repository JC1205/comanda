import { createClient } from '@supabase/supabase-js'
//Pa conectar con la base de datos
export const supabase = createClient('https://umzgodcmuwmkajlnvnju.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtemdvZGNtdXdta2FqbG52bmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMzY4NTEsImV4cCI6MjA1NjkxMjg1MX0.RrP3RY9Dv7fYER0XpzrW9flYR0kNtW2uipvGPOfrGhg')  