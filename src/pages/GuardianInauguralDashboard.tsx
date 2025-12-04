import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProvisionalStudentByGuardianEmail, useInauguralClassByStudentId } from '@/hooks/useStudents';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, GraduationCap } from 'lucide-react';

const GuardianInauguralDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Busca o aluno provisório associado ao e-mail do responsável
  const { data: student, isLoading: studentLoading, isError: studentError, error: studentErrorMessage } = useProvisionalStudentByGuardianEmail(user?.email || '');

  // Busca os detalhes da aula inaugural agendada para o aluno
  const { data: inauguralClass, isLoading: classLoading, isError: classError, error: classErrorMessage } = useInauguralClassByStudentId(student?.id || '');

  const handleFinishEnrollment = () => {
    // Redirecionar para a página de matrícula/pagamento
    // Os dados do estudante já cadastrados serão utilizados
    navigate('/enrollment-signup?from=inaugural&student_id=' + student?.id);
  };

  if (studentLoading || classLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[80vh]">
        <div className="text-lg">Carregando dados...</div>
      </div>
    );
  }

  if (studentError || classError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Erro ao carregar dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Ocorreu um erro ao carregar os dados: 
              {studentErrorMessage?.message || classErrorMessage?.message || 'Erro desconhecido'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum aluno encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Não encontramos um aluno provisório associado à sua conta. Entre em contato com a academia.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Bem-vindo(a) à Academia</h1>
        <p className="text-muted-foreground">Área do responsável - Aula Inaugural</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Informações do Aluno */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={student.photo || ''} alt={student.name} />
              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{student.name}</CardTitle>
              <CardDescription>Aluno(a)</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-medium">Status:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Aula Inaugural Agendada
                </span>
              </div>
              <div>
                <h4 className="font-medium mb-2">Informações do Aluno</h4>
                <p>Data de Nascimento: {new Date(student.birthDate).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Detalhes da Aula Inaugural */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Aula Inaugural Agendada
            </CardTitle>
            <CardDescription>Detalhes do seu agendamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inauguralClass ? (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Data: {new Date(inauguralClass.selectedDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Horário: 14:00</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Modalidade:</h4>
                    <p>{inauguralClass.sports?.name || 'Modalidade não encontrada'}</p>
                  </div>
                </>
              ) : (
                <p>Nenhuma aula inaugural agendada encontrada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Próximo Passo: Finalizar Matrícula</CardTitle>
            <CardDescription>
              Complete o processo de matrícula para garantir a vaga do seu filho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={handleFinishEnrollment}
            >
              Finalizar Matrícula Agora
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Após a conclusão, seu filho terá acesso a todas as atividades da academia
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuardianInauguralDashboard;