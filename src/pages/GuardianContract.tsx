import { useEffect, useState, useRef } from 'react';
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
  Building,
  Loader2,
  Pen,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

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
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Load logo as base64
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch('/assets/logo.png');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    };
    loadLogo();
  }, []);

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

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
    setIsSigned(false);
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const data = canvas.toDataURL('image/png');
    setSignatureData(data);
    setIsSigned(true);
    toast.success('Assinatura confirmada!');
  };

  const generatePDF = async () => {
    if (!student) return;
    
    if (!signatureData) {
      toast.error('Por favor, assine o contrato antes de baixar.');
      return;
    }

    setGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Logo in header
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', margin, y - 10, 25, 25);
        } catch (e) {
          console.error('Error adding logo:', e);
        }
      }

      // Header with logo offset
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRATO DE MATRÍCULA', pageWidth / 2 + 10, y, { align: 'center' });
      y += 8;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Bayer Academy', pageWidth / 2 + 10, y, { align: 'center' });
      y += 20;

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      // Contract info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DADOS DO CONTRATO', margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.text(`Data de Matrícula: ${format(new Date(student.enrollmentDate), 'dd/MM/yyyy', { locale: ptBR })}`, margin, y);
      y += 6;
      doc.text(`Vencimento: Todo dia ${student.payment_due_date || 5}`, margin, y);
      y += 6;
      doc.text(`Status: Ativo`, margin, y);
      y += 12;

      // Student data
      doc.setFont('helvetica', 'bold');
      doc.text('DADOS DO ALUNO', margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.text(`Nome: ${student.name}`, margin, y);
      y += 6;
      doc.text(`CPF: ${student.cpf}`, margin, y);
      y += 12;

      // Guardian data
      if (student.guardian) {
        doc.setFont('helvetica', 'bold');
        doc.text('RESPONSÁVEL FINANCEIRO', margin, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.text(`Nome: ${student.guardian.name}`, margin, y);
        y += 6;
        doc.text(`CPF: ${student.guardian.cpf}`, margin, y);
        y += 6;
        doc.text(`E-mail: ${student.guardian.email}`, margin, y);
        y += 6;
        doc.text(`Telefone: ${student.guardian.phone}`, margin, y);
        y += 12;
      }

      // Modalities
      if (sports.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('MODALIDADES CONTRATADAS', margin, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        sports.forEach(sport => {
          doc.text(`• ${sport.name} - ${formatCurrency(sport.monthlyFee)}/mês`, margin, y);
          y += 6;
        });
        y += 6;
      }

      // Values
      doc.setFont('helvetica', 'bold');
      doc.text('VALORES', margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      if (student.enrollment_fee && student.enrollment_fee > 0) {
        doc.text(`Taxa de Matrícula: ${formatCurrency(student.enrollment_fee)}`, margin, y);
        y += 6;
      }
      doc.text(`Mensalidade: ${formatCurrency(student.monthlyFee || 0)}`, margin, y);
      y += 6;
      if (enrollment) {
        doc.text(`Forma de Pagamento: ${getPaymentMethodLabel(enrollment.payment_method)}`, margin, y);
        y += 6;
      }
      y += 10;

      // Check if we need a new page for terms
      if (y > 200) {
        doc.addPage();
        y = 20;
      }

      // Terms
      doc.setFont('helvetica', 'bold');
      doc.text('TERMOS E CONDIÇÕES', margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      const terms = [
        'Este contrato estabelece os termos e condições para a prestação de serviços educacionais esportivos pela Bayer Academy ao aluno acima identificado.',
        '',
        'VIGÊNCIA: O contrato tem vigência de 12 meses a partir da data de matrícula, renovando-se automaticamente por igual período, salvo manifestação contrária de qualquer das partes com antecedência mínima de 30 dias.',
        '',
        'CANCELAMENTO: O cancelamento pode ser solicitado a qualquer momento, mediante aviso prévio de 30 dias, sendo devidas as mensalidades proporcionais ao período utilizado.',
        '',
        'INADIMPLÊNCIA: O não pagamento de 2 mensalidades consecutivas poderá acarretar a suspensão das atividades do aluno até a regularização.',
        '',
        'OBRIGAÇÕES DO CONTRATANTE:',
        '• Efetuar o pagamento das mensalidades até a data de vencimento;',
        '• Comunicar alterações cadastrais em até 5 dias úteis;',
        '• Zelar pelos equipamentos e instalações da academia;',
        '• Respeitar as normas internas de conduta.',
        '',
        'OBRIGAÇÕES DA CONTRATADA:',
        '• Disponibilizar instrutores qualificados;',
        '• Manter as instalações em condições adequadas de uso;',
        '• Fornecer os materiais necessários para as atividades;',
        '• Comunicar alterações de horários com antecedência mínima de 48 horas.',
      ];

      terms.forEach(term => {
        if (term === '') {
          y += 4;
        } else {
          const lines = doc.splitTextToSize(term, pageWidth - margin * 2);
          lines.forEach((line: string) => {
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, margin, y);
            y += 5;
          });
        }
      });

      y += 15;
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      // Digital Signature Section
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('ASSINATURA DIGITAL DO CONTRATANTE', margin, y);
      y += 10;

      // Add digital signature image
      if (signatureData) {
        try {
          doc.addImage(signatureData, 'PNG', margin, y, 60, 30);
          y += 35;
        } catch (e) {
          console.error('Error adding signature:', e);
        }
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Assinado digitalmente por: ${student.guardian?.name || student.name}`, margin, y);
      y += 5;
      doc.text(`CPF: ${student.guardian?.cpf || student.cpf}`, margin, y);
      y += 5;
      doc.text(`Data/Hora: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}`, margin, y);
      y += 5;
      
      // Hash for authenticity
      const signatureHash = btoa(`${student.id}-${student.guardian?.cpf || student.cpf}-${new Date().toISOString()}`).substring(0, 32);
      doc.text(`Código de Verificação: ${signatureHash}`, margin, y);
      y += 15;

      // Legal validation notice
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      const legalText = 'Este documento foi assinado digitalmente e possui validade jurídica conforme a Lei nº 14.063/2020 e Medida Provisória nº 2.200-2/2001. A assinatura eletrônica avançada dispensa reconhecimento de firma e pode ser verificada através do código acima.';
      const legalLines = doc.splitTextToSize(legalText, pageWidth - margin * 2);
      legalLines.forEach((line: string) => {
        doc.text(line, margin, y);
        y += 4;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} | Bayer Academy`,
        pageWidth / 2,
        285,
        { align: 'center' }
      );

      // Download
      const fileName = `Contrato_${student.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      doc.save(fileName);
      
      toast.success('Contrato baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar o contrato. Tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
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

      {/* Assinatura Digital */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Pen className="h-4 w-4" />
            Assinatura Digital
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Assine abaixo para validar digitalmente o contrato. A assinatura tem validade jurídica conforme a legislação vigente.
          </p>
          
          {isSigned ? (
            <div className="space-y-3">
              <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                  <CheckCheck className="h-5 w-5" />
                  <span className="font-medium">Contrato assinado digitalmente</span>
                </div>
                <img 
                  src={signatureData || ''} 
                  alt="Assinatura" 
                  className="max-h-20 border rounded bg-white"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Assinado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSignature}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Refazer Assinatura
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={150}
                  className="w-full bg-white cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Desenhe sua assinatura no campo acima
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSignature}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
                <Button 
                  size="sm" 
                  onClick={confirmSignature}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão Download */}
      <Button 
        className="w-full" 
        variant={isSigned ? "default" : "outline"}
        onClick={generatePDF}
        disabled={generatingPdf || !isSigned}
      >
        {generatingPdf ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {generatingPdf ? 'Gerando PDF...' : isSigned ? 'Baixar Contrato Assinado' : 'Assine o contrato primeiro'}
      </Button>
    </div>
  );
}
