import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
  allowedFlows?: string[]; // Para restringir acesso baseado no registration_flow
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectPath = '/login',
  allowedFlows
}) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  // Enquanto carrega, exibe loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Verificar se usuário não-admin está tentando acessar páginas não permitidas
  // IMPORTANTE: Só fazer redirecionamento se profile estiver carregado
  if (profile) {
    const currentPath = location.pathname;

    // USUÁRIOS INAUGURAIS - acesso limitado
    if (profile.registration_flow === 'inaugural') {
      const allowedInauguralPaths = [
        '/inaugural-class',
        '/inaugural-dashboard',
        '/enrollment-signup' // Para quando finalizar matrícula
      ];

      // Se está tentando acessar página não permitida, redirecionar para dashboard inaugural
      if (!allowedInauguralPaths.includes(currentPath)) {
        if (profile.onboarding_completed === false) {
          return <Navigate to="/inaugural-class" replace />;
        } else {
          return <Navigate to="/inaugural-dashboard" replace />;
        }
      }
    }

    // USUÁRIOS ENROLLMENT - acesso apenas ao próprio dashboard
    if (profile.registration_flow === 'enrollment') {
      const allowedEnrollmentPaths = [
        '/enrollment-form',
        '/enrollment-dashboard'
      ];

      // Se está tentando acessar página não permitida, redirecionar para dashboard
      if (!allowedEnrollmentPaths.includes(currentPath)) {
        if (profile.onboarding_completed === false) {
          return <Navigate to="/enrollment-form" replace />;
        } else {
          return <Navigate to="/enrollment-dashboard" replace />;
        }
      }
    }
  }

  // Verificar allowedFlows se especificado (para páginas administrativas)
  if (allowedFlows && profile?.registration_flow && !allowedFlows.includes(profile.registration_flow)) {
    // Redirecionar para a página apropriada baseada no flow
    if (profile.registration_flow === 'inaugural') {
      if (profile.onboarding_completed === false) {
        return <Navigate to="/inaugural-class" replace />;
      } else {
        return <Navigate to="/inaugural-dashboard" replace />;
      }
    } else {
      // Para usuários enrollment, admin ou outros, ir para home
      return <Navigate to="/" replace />;
    }
  }

  // Se estiver autenticado e autorizado, renderiza o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;