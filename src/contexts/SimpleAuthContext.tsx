import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SimpleAuthContextType {
  user: any;
  session: any;
  profile: any;
  isLoading: boolean;
  signUp: (email: string, password: string, options?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle?: () => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile?: (data: any) => Promise<any>;
  confirmEmail?: (email: string) => Promise<any>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um SimpleAuthProvider');
  }
  return context;
};

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Carregar usuário do localStorage ao inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('simpleAuth_user');
    const savedSession = localStorage.getItem('simpleAuth_session');

    if (savedUser && savedSession) {
      const user = JSON.parse(savedUser);
      const session = JSON.parse(savedSession);
      setUser(user);
      setSession(session);
      setProfile(user.profile);
    }
    setIsLoading(false);
  }, []);

  const signUp = async (email: string, password: string, options?: any) => {
    console.log('SignUp:', email);

    // Simular processo de criação de usuário
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se email já existe no localStorage (simulação de base de dados)
      const existingUsers = JSON.parse(localStorage.getItem('simpleAuth_users') || '[]');
      if (existingUsers.find((u: any) => u.email === email)) {
        return { data: null, error: { message: 'E-mail já cadastrado' } };
      }

      // Criar novo usuário
      const newUser = {
        id: Date.now().toString(),
        email,
        email_confirmed_at: null, // Simular email não confirmado
        created_at: new Date().toISOString(),
        registration_flow: options?.registration_flow || 'inaugural'
      };

      // Salvar usuário na lista
      existingUsers.push(newUser);
      localStorage.setItem('simpleAuth_users', JSON.stringify(existingUsers));

      return {
        data: {
          user: newUser,
          session: null // Sem sessão até confirmar email
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao criar conta' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('SignIn:', email);

    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));

      // Verificar se usuário existe
      const existingUsers = JSON.parse(localStorage.getItem('simpleAuth_users') || '[]');
      const foundUser = existingUsers.find((u: any) => u.email === email);

      if (!foundUser) {
        return { data: null, error: { message: 'Usuário não encontrado' } };
      }

      // Verificar se email foi confirmado (simular)
      if (!foundUser.email_confirmed_at) {
        return { data: null, error: { message: 'Por favor, confirme seu e-mail antes de fazer login' } };
      }

      // Simular login bem-sucedido com diferentes tipos de usuário
      let mockUser;
      let redirectPath = '/';

      // Simular lógica baseada no email para determinar o tipo de usuário
      if (email.includes('admin') || email.includes('staff')) {
        // Usuário administrativo
        mockUser = {
          ...foundUser,
          registration_flow: 'internal',
          profile: { registration_flow: 'internal', onboarding_completed: true }
        };
        redirectPath = '/';
      } else if (foundUser.registration_flow === 'inaugural' || email.includes('inaugural')) {
        // Responsável inaugural (provisório)
        mockUser = {
          ...foundUser,
          registration_flow: 'inaugural',
          profile: { registration_flow: 'inaugural', onboarding_completed: true }
        };
        redirectPath = '/inaugural-dashboard';
      } else {
        // Responsável efetivado (enrollment)
        mockUser = {
          ...foundUser,
          registration_flow: 'enrollment',
          profile: { registration_flow: 'enrollment', onboarding_completed: true }
        };
        redirectPath = '/enrollment-dashboard';
      }

      const mockSession = { user: mockUser };

      // Salvar no localStorage
      localStorage.setItem('simpleAuth_user', JSON.stringify(mockUser));
      localStorage.setItem('simpleAuth_session', JSON.stringify(mockSession));

      setUser(mockUser);
      setSession(mockSession);
      setProfile(mockUser.profile);

      navigate(redirectPath, { replace: true });
      return { data: mockUser, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Erro ao fazer login' } };
    }
  };

  const signInWithGoogle = async () => {
    console.log('SignIn with Google');
    const mockUser = { id: '1', email: 'google@test.com' };
    setUser(mockUser);
    setSession({ user: mockUser });
    navigate('/', { replace: true });
    return { data: mockUser, error: null };
  };

  const signOut = async () => {
    // Remover do localStorage
    localStorage.removeItem('simpleAuth_user');
    localStorage.removeItem('simpleAuth_session');

    setUser(null);
    setSession(null);
    setProfile(null);
    navigate('/login', { replace: true });
    return { error: null };
  };

  const updateProfile = async (data: any) => {
    console.log('Update profile:', data);
    setProfile({ ...profile, ...data });
    return { error: null };
  };

  const confirmEmail = async (email: string) => {
    console.log('Confirming email:', email);

    try {
      const existingUsers = JSON.parse(localStorage.getItem('simpleAuth_users') || '[]');
      const userIndex = existingUsers.findIndex((u: any) => u.email === email);

      if (userIndex !== -1) {
        existingUsers[userIndex].email_confirmed_at = new Date().toISOString();
        localStorage.setItem('simpleAuth_users', JSON.stringify(existingUsers));
        return { error: null };
      }

      return { error: { message: 'Usuário não encontrado' } };
    } catch (error) {
      return { error: { message: 'Erro ao confirmar email' } };
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    confirmEmail
  };

  return <SimpleAuthContext.Provider value={value}>{children}</SimpleAuthContext.Provider>;
};