import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calendar, 
  User, 
  CreditCard, 
  Download,
  CheckCircle,
  Clock,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Student {
  id: string;
  name: string;
  cpf: string;
  enrollmentDate: string;
  monthlyFee: number;
  enrollment_fee: number;
  payment_due_date: number;
  status: string;
  guardian: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  enrolledSports: string[];
}

interface Sport {
  id: string;
  name: string;
  monthlyFee: number;
}

interface Enrollment {
  id: string;
  status: string;
  monthly_fee: number;
  enrollment_fee: number;
  payment_due_date: number;
  payment_method: string;
  created_at: string;
}

export default function GuardianContract() {
  const [student, setStudent] = useState<Student | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        // Buscar aluno pelo email do responsável
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .filter('guardian->>email', 'eq', user.email)
          .in('status', ['active', 'effective'])
          .limit(1);

        if (students && students.length > 0) {
          const studentData = students[0];
          setStudent({
            ...studentData,
            guardian: studentData.guardian as Student['guardian'],
          });

          // Buscar modalidades
          if (studentData.enrolledSports?.length > 0) {
            const { data: sportsData } = await supabase
              .from('sports')
              .select('id, name, monthlyFee')
              .in('id', studentData.enrolledSports);
            setSports(sportsData || []);
          }

          // Buscar matrícula
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('*')
            .eq('student_id', studentData.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (enrollments && enrollments.length > 0) {
            setEnrollment(enrollments[0]);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do contrato:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPaymentMethodLabel = (method: string | null) => {
    const methods: Record<string, string> = {
      pix: 'PIX',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      boleto: 'Boleto Bancário',
      cash: 'Dinheiro',
    };
    return methods[method || ''] || method || 'Não informado';
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum contrato encontrado</h3>
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
      {/* Status do Contrato */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Contrato de Matrícula</h2>
                <p className="text-sm text-muted-foreground">Bayer Academy</p>
              </div>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Ativo
            </Badge>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Data da Matrícula</span>
              <p className="font-medium">
                {format(new Date(student.enrollmentDate), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Vencimento</span>
              <p className="font-medium">Todo dia {student.payment_due_date || 5}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Aluno */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Aluno
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">Nome Completo</span>
            <p className="font-medium">{student.name}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">CPF</span>
            <p className="font-medium">{student.cpf}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Responsável */}
      {student.guardian && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Responsável Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Nome</span>
              <p className="font-medium">{student.guardian.name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">CPF</span>
              <p className="font-medium">{student.guardian.cpf}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">E-mail</span>
              <p className="font-medium">{student.guardian.email}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Telefone</span>
              <p className="font-medium">{student.guardian.phone}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modalidades Contratadas */}
      {sports.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Modalidades Contratadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sports.map(sport => (
                <div key={sport.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="font-medium">{sport.name}</span>
                  <span className="text-muted-foreground">{formatCurrency(sport.monthlyFee)}/mês</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Valores */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Valores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {student.enrollment_fee && student.enrollment_fee > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Taxa de Matrícula</span>
              <span className="font-medium">{formatCurrency(student.enrollment_fee)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Mensalidade</span>
            <span className="font-bold text-lg">{formatCurrency(student.monthlyFee || 0)}</span>
          </div>
          
          {enrollment && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Forma de Pagamento</span>
                <span className="font-medium">{getPaymentMethodLabel(enrollment.payment_method)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Termos e Condições */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4" />
            Termos do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            Este contrato estabelece os termos e condições para a prestação de serviços 
            educacionais esportivos pela Bayer Academy ao aluno acima identificado.
          </p>
          <p>
            <strong>Vigência:</strong> O contrato tem vigência de 12 meses a partir da data de matrícula, 
            renovando-se automaticamente por igual período, salvo manifestação contrária de qualquer das partes 
            com antecedência mínima de 30 dias.
          </p>
          <p>
            <strong>Cancelamento:</strong> O cancelamento pode ser solicitado a qualquer momento, 
            mediante aviso prévio de 30 dias, sendo devidas as mensalidades proporcionais ao período utilizado.
          </p>
          <p>
            <strong>Inadimplência:</strong> O não pagamento de 2 mensalidades consecutivas poderá 
            acarretar a suspensão das atividades do aluno até a regularização.
          </p>
        </CardContent>
      </Card>

      {/* Botão Download */}
      <Button className="w-full" variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Baixar Contrato em PDF
      </Button>
    </div>
  );
}
