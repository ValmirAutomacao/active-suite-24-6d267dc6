import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

console.log('Supabase Config:', {
  url: supabaseUrl ? 'Present' : 'Missing',
  key: supabaseAnonKey ? 'Present' : 'Missing',
  env: import.meta.env.MODE
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'EXISTS' : 'MISSING'
  });
  throw new Error('Supabase URL e/ou Anon Key não estão configurados nas variáveis de ambiente');
}

// Validar se a URL é válida
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`URL do Supabase inválida: ${supabaseUrl}`);
}

const getRedirectUrl = () => {
  // Em produção (Vercel), usar window.location.origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  // Fallback para desenvolvimento local
  return 'http://localhost:8080/auth/callback';
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    redirectTo: getRedirectUrl()
  }
});

export default supabase;