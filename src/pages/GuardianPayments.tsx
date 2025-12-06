import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Calendar, CheckCircle, Clock, AlertCircle, Receipt, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
interface Payment {
  id: string;
  student_name: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  sport: string;
  month: string;
}

export default function GuardianPayments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

  // Handle payment success/cancel from Stripe redirect
  useEffect(() => {
    const handlePaymentResult = async () => {
      const success = searchParams.get('success');
      const paymentId = searchParams.get('payment_id');
      const canceled = searchParams.get('canceled');

      if (success === 'true' && paymentId) {
        try {
          // Confirm payment in database
          const { data: { session } } = await supabase.auth.getSession();
          
          const response = await supabase.functions.invoke('confirm-payment', {
            body: { payment_id: paymentId },
          });

          if (response.error) {
            console.error('Error confirming payment:', response.error);
            toast.error('Erro ao confirmar pagamento. Entre em contato com o suporte.');
          } else {
            toast.success('Pagamento realizado com sucesso!');
            // Refresh payments list
            window.location.href = '/guardian/payments';
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error('Erro ao processar pagamento.');
        }
        
        // Clear URL params
        setSearchParams({});
      } else if (canceled === 'true') {
        toast.info('Pagamento cancelado.');
        setSearchParams({});
      }
    };

    handlePaymentResult();
  }, [searchParams, setSearchParams]);
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        // Buscar aluno pelo email do responsável
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .filter('guardian->>email', 'eq', user.email)
          .in('status', ['active', 'effective'])
          .limit(1);

        if (students && students.length > 0) {
          setStudentId(students[0].id);

          // Buscar pagamentos do aluno
          const { data: paymentsData } = await supabase
            .from('payments')
            .select('*')
            .eq('student_id', students[0].id)
            .order('due_date', { ascending: false });

          setPayments(paymentsData || []);
        }
      } catch (error) {
        console.error('Erro ao buscar pagamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getStatusConfig = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'paid';
    
    if (status === 'paid') {
      return {
        label: 'Pago',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      };
    }
    
    if (isOverdue) {
      return {
        label: 'Vencido',
        variant: 'destructive' as const,
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      };
    }
    
    return {
      label: 'Pendente',
      variant: 'secondary' as const,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return format(date, "MMMM 'de' yyyy", { locale: ptBR });
  };

  // Calcular resumo
  const summary = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'paid').length,
    pending: payments.filter(p => p.status !== 'paid' && new Date(p.due_date) >= new Date()).length,
    overdue: payments.filter(p => p.status !== 'paid' && new Date(p.due_date) < new Date()).length,
    totalPaid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    totalPending: payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0),
  };

  const handlePayment = async (payment: Payment) => {
    setProcessingPaymentId(payment.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          payment_id: payment.id,
          amount: payment.amount,
          student_name: payment.student_name,
          month: payment.month,
          sport: payment.sport,
        },
      });

      if (error) {
        console.error('Error creating payment session:', error);
        toast.error('Erro ao iniciar pagamento. Tente novamente.');
        return;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao processar pagamento.');
    } finally {
      setProcessingPaymentId(null);
    }
  };
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
            <p className="text-muted-foreground">
              Você ainda não possui um aluno matriculado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Resumo Financeiro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{summary.paid}</p>
              <p className="text-sm text-green-700">Pagos</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
              <p className="text-sm text-yellow-700">Pendentes</p>
            </div>
            {summary.overdue > 0 && (
              <div className="col-span-2 text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
                <p className="text-sm text-red-700">Vencidos</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Pago:</span>
              <span className="font-semibold text-green-600">{formatCurrency(summary.totalPaid)}</span>
            </div>
            {summary.totalPending > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Pendente:</span>
                <span className="font-semibold text-yellow-600">{formatCurrency(summary.totalPending)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Mensalidades */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg px-1">Mensalidades</h3>
        
        {payments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhuma mensalidade encontrada</p>
            </CardContent>
          </Card>
        ) : (
          payments.map(payment => {
            const statusConfig = getStatusConfig(payment.status || 'pending', payment.due_date);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={payment.id} className={`overflow-hidden ${statusConfig.bgColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                        <span className="font-medium capitalize">
                          {formatMonth(payment.month)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{payment.sport}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Vencimento: {format(new Date(payment.due_date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      {payment.paid_date && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>
                            Pago em: {format(new Date(payment.paid_date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(payment.amount)}</p>
                      <Badge variant={statusConfig.variant} className="mt-1">
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {payment.status !== 'paid' && (
                    <Button 
                      className="w-full mt-4" 
                      size="sm"
                      onClick={() => handlePayment(payment)}
                      disabled={processingPaymentId === payment.id}
                    >
                      {processingPaymentId === payment.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      {processingPaymentId === payment.id ? 'Processando...' : 'Pagar Agora'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
