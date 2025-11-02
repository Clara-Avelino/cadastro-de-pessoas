import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verifica se as variáveis de ambiente existem
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!')
  console.error('URL:', supabaseUrl)
  console.error('KEY:', supabaseKey ? '***' : 'não definida')
}

export const supabase = createClient(supabaseUrl, supabaseKey)