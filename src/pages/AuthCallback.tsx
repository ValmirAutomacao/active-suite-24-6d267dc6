import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabaseClient';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('AuthCallback: Processing auth callback...');

      // Processar callback do Supabase (confirmação de email, etc.)
      const { data, error } = await supabase.auth.getSession();
      console.log('AuthCallback: Session data:', { data, error });

      if (error) {
        console.error('AuthCallback: Error getting session:', error);
        navigate('/login?error=callback', { replace: true });
        return;
      }

      // Aguardar um pouco para o contexto atualizar
      setTimeout(() => {
        console.log('AuthCallback: After timeout:', { user: !!user, profile, isLoading });

        if (user && profile) {
          console.log('AuthCallback: User and profile available, redirecting...');

          if (profile.registration_flow === 'inaugural') {
            if (profile.onboarding_completed === false) {
              console.log('AuthCallback: Redirecting to inaugural-class');
              navigate('/inaugural-class', { replace: true });
            } else {
              console.log('AuthCallback: Redirecting to inaugural-dashboard');
              navigate('/inaugural-dashboard', { replace: true });
            }
          } else if (profile.registration_flow === 'enrollment') {
            if (profile.onboarding_completed === false) {
              console.log('AuthCallback: Redirecting to enrollment-form');
              navigate('/enrollment-form', { replace: true });
            } else {
              console.log('AuthCallback: Redirecting to enrollment-dashboard');
              navigate('/enrollment-dashboard', { replace: true });
            }
          } else {
            console.log('AuthCallback: Redirecting to home (admin)');
            navigate('/', { replace: true });
          }
        } else if (!isLoading && !user) {
          console.log('AuthCallback: No user found, redirecting to login');
          navigate('/login?error=no-user', { replace: true });
        }
      }, 1000);
    };

    if (!isLoading) {
      handleAuthCallback();
    }
  }, [user, profile, isLoading, navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Confirmando sua conta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <p className="text-foreground text-lg">Redirecionando...</p>
      </div>
    </div>
  );
};

export default AuthCallback;