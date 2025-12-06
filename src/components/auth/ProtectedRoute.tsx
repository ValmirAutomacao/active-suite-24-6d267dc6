import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
  allowedFlows?: string[];
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

  // Se profile ainda não carregou, aguarda
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando perfil...</div>
      </div>
    );
  }

  const currentPath = location.pathname;
  const userFlow = profile.registration_flow || 'admin';

  // REDIRECIONAR USUÁRIOS PARA SEUS AMBIENTES CORRETOS
  
  // Usuários INAUGURAL ou ENROLLMENT tentando acessar rotas admin
  if ((userFlow === 'inaugural' || userFlow === 'enrollment') && !currentPath.startsWith('/guardian')) {
    // Redirecionar para ambiente do guardian
    if (userFlow === 'inaugural') {
      if (profile.onboarding_completed) {
        return <Navigate to="/guardian/inaugural-dashboard" replace />;
      } else {
        return <Navigate to="/guardian" replace />;
      }
    } else {
      // enrollment
      if (profile.onboarding_completed) {
        return <Navigate to="/guardian/dashboard" replace />;
      } else {
        return <Navigate to="/guardian" replace />;
      }
    }
  }

  // Usuários ADMIN tentando acessar rotas guardian
  if (userFlow === 'admin' && currentPath.startsWith('/guardian')) {
    return <Navigate to="/" replace />;
  }

  // Verificar allowedFlows se especificado
  if (allowedFlows && !allowedFlows.includes(userFlow)) {
    // Redirecionar para o ambiente correto
    if (userFlow === 'inaugural') {
      if (profile.onboarding_completed) {
        return <Navigate to="/guardian/inaugural-dashboard" replace />;
      } else {
        return <Navigate to="/guardian" replace />;
      }
    } else if (userFlow === 'enrollment') {
      if (profile.onboarding_completed) {
        return <Navigate to="/guardian/dashboard" replace />;
      } else {
        return <Navigate to="/guardian" replace />;
      }
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Se estiver autenticado e autorizado, renderiza o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;