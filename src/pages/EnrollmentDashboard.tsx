import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEffectiveStudentByGuardianEmail, useStudentPayments, useStudentEvents } from '@/hooks/useStudents';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, GraduationCap, DollarSign, CreditCard, CalendarDays } from 'lucide-react';

const EnrollmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Busca o aluno efetivado associado ao e-mail do responsável
  const { data: student, isLoading: studentLoading, isError: studentError, error: studentErrorMessage } = useEffectiveStudentByGuardianEmail(user?.email || '');

  // Busca os pagamentos do aluno
  const { data: payments = [], isLoading: paymentsLoading, isError: paymentsError } = useStudentPayments(student?.id || '');

  // Busca os eventos/aulas do aluno
  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useStudentEvents(student?.id || '');

  const handlePayment = (paymentId: string) => {
    toast.info('Funcionalidade de pagamento em desenvolvimento');
    // Em uma implementação completa, isso redirecionaria para o gateway de pagamento
    // navigate(`/payment/${paymentId}`);
  };

  if (studentLoading || paymentsLoading || eventsLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[80vh]">
        <div className="text-lg">Carregando dados...</div>
      </div>
    );
  }

  if (studentError || paymentsError || eventsError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Erro ao carregar dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Ocorreu um erro ao carregar os dados:
              {studentErrorMessage?.message || 'Erro desconhecido'}
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
            <p>Não encontramos um aluno associado à sua conta. Entre em contato com a academia.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Separar pagamentos pendentes e pagos
  const pendingPayments = payments.filter(payment => payment.status === 'pending');
  const paidPayments = payments.filter(payment => payment.status === 'paid');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Área do Responsável</h1>
        <p className="text-muted-foreground">Dashboard do Aluno Matriculado</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Card de Informações do Aluno */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={student.photo || ''} alt={student.name} />
              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{student.name}</CardTitle>
              <CardDescription>Aluno(a) Matriculado(a)</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-medium">Status:</span>
                <Badge variant="default" className="ml-2">
                  Ativo
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Informações do Aluno</h4>
                <p>Data de Nascimento: {new Date(student.birthDate).toLocaleDateString('pt-BR')}</p>
                <p>Data de Matrícula: {new Date(student.enrollmentDate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Modalidades</h4>
                <div className="flex flex-wrap gap-2">
                  {student.enrolledSports?.map((sport, index) => (
                    <Badge key={index} variant="outline">{sport}</Badge>
                  )) || <span className="text-sm text-muted-foreground">Nenhuma modalidade</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Área Financeira */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Área Financeira
            </CardTitle>
            <CardDescription>Status dos pagamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-orange-600">Pendentes</h4>
                  {pendingPayments.slice(0, 2).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 border rounded mb-2">
                      <div>
                        <p className="font-medium">{payment.month}</p>
                        <p className="text-sm text-muted-foreground">
                          Vence: {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {payment.amount.toFixed(2)}</p>
                        <Button
                          size="sm"
                          onClick={() => handlePayment(payment.id)}
                          className="mt-1"
                        >
                          Pagar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {paidPayments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-green-600">Últimos Pagamentos</h4>
                  {paidPayments.slice(0, 2).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 border rounded mb-2">
                      <div>
                        <p className="font-medium">{payment.month}</p>
                        <p className="text-sm text-muted-foreground">
                          Pago: {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">R$ {payment.amount.toFixed(2)}</p>
                        <Badge variant="default" className="mt-1">Pago</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {payments.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum pagamento encontrado</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Próximas Aulas */}
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Próximas Aulas
            </CardTitle>
            <CardDescription>Agenda de eventos e aulas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length > 0 ? (
                events.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 border rounded">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('pt-BR')} às {event.startTime}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {event.type === 'training' ? 'Treino' :
                       event.type === 'match' ? 'Jogo' :
                       event.type === 'evaluation' ? 'Avaliação' : 'Evento'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma aula agendada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Ações Rápidas */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              >
                <CreditCard className="h-4 w-4" />
                Ver Histórico Financeiro
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              >
                <Calendar className="h-4 w-4" />
                Ver Agenda Completa
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              >
                <GraduationCap className="h-4 w-4" />
                Atualizar Dados do Aluno
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnrollmentDashboard;