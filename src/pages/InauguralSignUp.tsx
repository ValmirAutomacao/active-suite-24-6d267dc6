import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const InauguralSignUp = () => {
  console.log('InauguralSignUp component loading...');

  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('signUp function:', signUp);
  const [formData, setFormData] = useState({
    guardianName: '',
    guardianEmail: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulário inaugural submetido!');
    console.log('Form data:', formData);

    setIsSubmitting(true);

    try {
      if (!formData.guardianName || !formData.guardianEmail || !formData.password) {
        console.error('Campos obrigatórios não preenchidos');
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }

      console.log('Iniciando signup com Supabase...');

      // Criar usuário com metadados para o Supabase
      const { data: signUpData, error } = await signUp(
        formData.guardianEmail,
        formData.password,
        {
          data: {
            full_name: formData.guardianName,
            registration_flow: 'inaugural',
            onboarding_completed: false,
          }
        }
      );

      console.log('Resultado do signup:', { signUpData, error });

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      if (signUpData?.user) {
        toast.success("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta antes de fazer login.");

        // Limpar formulário após sucesso
        setFormData({
          guardianName: '',
          guardianEmail: '',
          password: '',
        });

        // Não redirecionar automaticamente - aguardar confirmação de email
      } else {
        throw new Error('Erro inesperado durante o cadastro');
      }

    } catch (error: any) {
      console.error("Erro no processo de cadastro inaugural:", error);
      toast.error(`Erro no cadastro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('Renderizando InauguralSignUp...');

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro para Aula Inaugural</CardTitle>
          <CardDescription>Crie sua conta de responsável para agendar a aula experimental do seu filho.</CardDescription>
        </CardHeader>
        <form onSubmit={(e) => {
          console.log('Form onSubmit triggered!');
          handleSubmit(e);
        }}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Seus Dados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Nome Completo</Label>
                  <Input id="guardianName" value={formData.guardianName} onChange={handleInputChange} autoComplete="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">E-mail</Label>
                  <Input id="guardianEmail" type="email" value={formData.guardianEmail} onChange={handleInputChange} autoComplete="email" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Crie uma Senha</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} autoComplete="new-password" required minLength={6} />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Próximo passo:</strong> Após criar sua conta e fazer login, você será direcionado para cadastrar os dados do seu filho e agendar a aula inaugural.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              onClick={() => console.log('Botão clicado!')}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Conta"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{' '}
              <Link to="/login?redirect=inaugural" className="underline">
                Faça o login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default InauguralSignUp;