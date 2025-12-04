import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AppLayout useEffect:', { isLoading, user: !!user, profile, currentPath: location.pathname });

    if (isLoading) return; // Ainda carregando

    const currentPath = location.pathname;

    // Páginas permitidas sem autenticação
    const publicPaths = ['/login', '/signup', '/inaugural-signup', '/enrollment-signup', '/auth/callback'];

    if (!user) {
      console.log('User not logged in, currentPath:', currentPath);
      // Se não está logado e não está em página pública, redirecionar para login
      if (!publicPaths.includes(currentPath)) {
        console.log('Redirecting to login');
        navigate('/login', { replace: true });
      }
      return;
    }

    if (!profile) {
      console.log('User logged but no profile yet, waiting...');
      // Usuário logado mas sem profile - aguardar profile carregar
      return;
    }

    // Lógica de redirecionamento baseada no profile
    const { registration_flow, onboarding_completed } = profile;
    console.log('User profile loaded:', { registration_flow, onboarding_completed, currentPath });

    // Se é inaugural
    if (registration_flow === 'inaugural') {
      console.log('User is inaugural type');
      if (onboarding_completed === false) {
        console.log('Onboarding not completed, should go to inaugural-class');
        if (currentPath !== '/inaugural-class') {
          console.log('Redirecting to /inaugural-class');
          navigate('/inaugural-class', { replace: true });
        }
      } else {
        console.log('Onboarding completed, should go to inaugural-dashboard');
        if (currentPath !== '/inaugural-dashboard') {
          console.log('Redirecting to /inaugural-dashboard');
          navigate('/inaugural-dashboard', { replace: true });
        }
      }
      return;
    }

    // Se é matrícula/enrollment
    if (registration_flow === 'enrollment') {
      console.log('User is enrollment type');
      if (onboarding_completed === false) {
        console.log('Enrollment onboarding not completed, should go to enrollment-form');
        if (currentPath !== '/enrollment-form') {
          console.log('Redirecting to /enrollment-form');
          navigate('/enrollment-form', { replace: true });
        }
      } else {
        console.log('Enrollment completed, should go to enrollment-dashboard');
        if (currentPath !== '/enrollment-dashboard') {
          console.log('Redirecting to /enrollment-dashboard');
          navigate('/enrollment-dashboard', { replace: true });
        }
      }
      return;
    }

    // Se é admin ou qualquer outro - acesso total
    if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/inaugural-signup' || currentPath === '/enrollment-signup') {
      console.log('Logged user on public page, redirecting to home');
      navigate('/', { replace: true });
    }

  }, [user, profile, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppLayout;