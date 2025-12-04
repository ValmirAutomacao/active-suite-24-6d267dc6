import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
// Importação PADRÃO correta (sem chaves), como o editor sugeriu.
import supabase from '@/lib/supabaseClient';

// A interface que define o "contrato" do nosso contexto
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any;
  isLoading: boolean;
  signUp: (email: string, password: string, options?: { data: { [key: string]: any } }) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (profileData: any) => Promise<{ error: any }>;
}

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para facilitar o uso do contexto em outros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// O componente Provedor que encapsula toda a lógica de autenticação
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Todos os estados (useState) devem estar no topo da função do componente
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Função para verificar e lidar com novos usuários inaugural
  const checkAndHandleNewInauguralUser = async (user: any, profile: any) => {
    // Verificar se é um usuário com onboarding_completed = false (característico de inaugural)
    if (profile.onboarding_completed === false) {
      // Verificar se não há alunos provisórios associados ao email
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('guardian->>email', user.email)
        .eq('status', 'provisional');

      if (!students || students.length === 0) {
        // Não tem aluno ainda, é inaugural que precisa cadastrar
        // Garantir que o registration_flow está correto
        if (profile.registration_flow !== 'inaugural') {
          await updateProfile({
            registration_flow: 'inaugural'
          });
        }
        navigate('/inaugural-class', { replace: true });
        return;
      } else {
        // Já tem aluno provisório, vai para dashboard inaugural
        navigate('/inaugural-dashboard', { replace: true });
        return;
      }
    }

    // Se onboarding_completed = true ou null, assumir admin
    navigate('/', { replace: true });
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Se há usuário logado, buscar o profile (sem bloquear o loading)
        if (session?.user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: userProfile, error: profileError }) => {
              if (isMounted) {
                if (!profileError && userProfile) {
                  setProfile(userProfile);
                } else {
                  setProfile(null);
                }
              }
            });
        }
      } catch (error) {
        console.error('Erro de conexão com Supabase:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Ouvinte para futuras mudanças de estado (login, logout) - SEM roteamento automático
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      setUser(session?.user ?? null);
      setSession(session);

      if (event === 'SIGNED_IN' && session?.user) {
        // Buscar profile sem bloquear
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: userProfile }) => {
            if (isMounted) {
              setProfile(userProfile || null);
            }
          });
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    // Limpa o ouvinte quando o componente é desmontado para evitar vazamentos de memória
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Todas as funções de autenticação devem estar dentro do componente para ter acesso a 'user' e 'setUser'
  const signUp = async (email: string, password: string, options?: { data: { [key: string]: any } }) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: options
    });

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const updateProfile = async (profileData: any) => {
    // Assumindo que você terá uma tabela 'profiles' para dados do usuário no futuro
    if (!user) {
      return { error: 'Nenhum usuário logado para atualizar o perfil' };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      // Se o perfil ainda não existir, cria um novo registro
      if (error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ ...profileData, id: user.id }]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return { error: insertError };
        }
        
        // Atualiza o estado do usuário com os novos dados
        setUser({ ...user, ...profileData });
        return { error: null };
      }
      
      console.error('Error updating profile:', error);
      return { error };
    }
    
    // Atualiza o estado do usuário com os novos dados
    setUser(data as User);
    
    return { error: null };
  };

  // O objeto de valor que será compartilhado via contexto
  const value = {
    user,
    session,
    profile,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile
  };

  // O retorno do JSX que provê o contexto para os componentes filhos
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}; // <--- Este é o único e correto fecha-chaves que finaliza o componente AuthProvider.