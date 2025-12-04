import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { signIn, user, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();

  const redirectType = searchParams.get('redirect');
  console.log('Redirect type:', redirectType);
  console.log('Current URL params:', searchParams.toString());

  // Redireciona se o usuário já estiver autenticado
  useEffect(() => {
    if (user && !authIsLoading) {
      navigate('/');
    }
  }, [user, authIsLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };


  // const handleGoogleLogin = async () => {
  //   setIsLoading(true);
  //   try {
  //     await signInWithGoogle();
  //     // signInWithGoogle redireciona automaticamente após sucesso
  //   } catch (err: any) {
  //     setError(err.message || 'Erro ao fazer login com Google');
  //     setIsLoading(false);
  //   }
  // };

  // Se o usuário já estiver autenticado, não mostrar o formulário
  if (!authIsLoading && user) {
    return null; // ou uma mensagem de redirecionamento
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-card border border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-foreground">Login</CardTitle>
          <CardDescription className="text-muted-foreground">Entre em sua conta do AcademyManager</CardDescription>
        </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>


          <div className="mt-4 text-center text-sm">
            Ainda não tem uma conta?{' '}
            <Link
              to={redirectType === 'inaugural' ? '/inaugural-signup' : '/signup'}
              className="underline"
            >
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
    </div>
  );
};

export default LoginForm;