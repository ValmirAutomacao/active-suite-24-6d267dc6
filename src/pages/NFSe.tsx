import React, { useState, useMemo } from 'react';
import { Search, Filter, Receipt, Eye, Printer, X, Calendar, User, Hash, Download, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { mockPayments } from '@/data/mockPayments';
import { mockStudents } from '@/data/mockStudents';

// Mock data para NFS-e emitidas
const mockNFSe = [
  {
    id: 'nfse-001',
    numero: '2024001',
    paymentId: 'pay-2024-08-std-001',
    studentName: 'Gabriel Silva Santos',
    guardianName: 'Maria Santos Silva',
    guardianCpf: '987.654.321-00',
    valor: 120.00,
    dataEmissao: '2024-08-15',
    status: 'emitida',
    codigoVerificacao: 'BARUERI2024001'
  },
  {
    id: 'nfse-002',
    numero: '2024002',
    paymentId: 'pay-2024-08-std-003',
    studentName: 'Pedro Oliveira Costa',
    guardianName: 'Carlos Oliveira Costa',
    guardianCpf: '456.789.123-45',
    valor: 150.00,
    dataEmissao: '2024-08-16',
    status: 'emitida',
    codigoVerificacao: 'BARUERI2024002'
  }
];

const NFSe: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchType, setSearchType] = useState<'student' | 'period' | 'number'>('student');
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Filtrar mensalidades pagas
  const paidPayments = useMemo(() => {
    return mockPayments.filter(payment => payment.status === 'paid');
  }, []);

  // Filtrar mensalidades baseado na busca
  const filteredPayments = useMemo(() => {
    if (!searchValue && searchType !== 'period') return paidPayments;

    return paidPayments.filter(payment => {
      switch (searchType) {
        case 'student':
          return payment.studentName.toLowerCase().includes(searchValue.toLowerCase());
        case 'number':
          return payment.id.includes(searchValue);
        case 'period':
          if (!startDate || !endDate) return true;
          const paymentDate = new Date(payment.dueDate);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return paymentDate >= start && paymentDate <= end;
        default:
          return true;
      }
    });
  }, [paidPayments, searchType, searchValue, startDate, endDate]);

  // Filtrar NFS-e baseado na busca
  const filteredNFSe = useMemo(() => {
    if (!searchValue && searchType !== 'period') return mockNFSe;

    return mockNFSe.filter(nfse => {
      switch (searchType) {
        case 'student':
          return nfse.studentName.toLowerCase().includes(searchValue.toLowerCase());
        case 'number':
          return nfse.numero.includes(searchValue);
        case 'period':
          if (!startDate || !endDate) return true;
          const emissionDate = new Date(nfse.dataEmissao);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return emissionDate >= start && emissionDate <= end;
        default:
          return true;
      }
    });
  }, [searchType, searchValue, startDate, endDate]);

  const handleEmitNFSe = (paymentId: string) => {
    navigate(`/nfs-e/emit?paymentId=${paymentId}`);
  };

  const handleViewNFSe = (nfseId: string) => {
    navigate(`/nfs-e/view/${nfseId}`);
  };

  const handlePrintNFSe = async (nfseId: string) => {
    try {
      setIsLoading(true);
      const nfse = mockNFSe.find(n => n.id === nfseId);

      if (!nfse) {
        toast({
          title: "Erro",
          description: "NFS-e não encontrada",
          variant: "destructive"
        });
        return;
      }

      // Simular download do PDF
      // Em produção, seria uma chamada à API da prefeitura
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,`; // URL fictícia para demonstração
      link.download = `NFSE_${nfse.numero}_${nfse.guardianName.replace(/\s+/g, '_')}.pdf`;

      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "PDF Gerado",
        description: `NFS-e ${nfse.numero} foi preparada para impressão`,
        variant: "default"
      });

      // Em um cenário real, isso abriria o PDF ou faria download
      console.log(`Gerando PDF para NFS-e ${nfse.numero}`);

    } catch (error) {
      toast({
        title: "Erro na Impressão",
        description: "Não foi possível gerar o PDF da NFS-e",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelNFSe = async (nfseId: string, motivo: string) => {
    try {
      setIsLoading(true);
      const nfse = mockNFSe.find(n => n.id === nfseId);

      if (!nfse) {
        toast({
          title: "Erro",
          description: "NFS-e não encontrada",
          variant: "destructive"
        });
        return;
      }

      if (nfse.status === 'cancelada') {
        toast({
          title: "Aviso",
          description: "Esta NFS-e já foi cancelada",
          variant: "destructive"
        });
        return;
      }

      // Simular cancelamento na API da prefeitura
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar o status no mock (em produção seria uma chamada à API)
      const nfseIndex = mockNFSe.findIndex(n => n.id === nfseId);
      if (nfseIndex !== -1) {
        mockNFSe[nfseIndex] = {
          ...mockNFSe[nfseIndex],
          status: 'cancelada'
        };
      }

      toast({
        title: "NFS-e Cancelada",
        description: `NFS-e ${nfse.numero} foi cancelada com sucesso`,
        variant: "default"
      });

      // Forçar re-render
      window.location.reload();

    } catch (error) {
      toast({
        title: "Erro no Cancelamento",
        description: "Não foi possível cancelar a NFS-e",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Notas Fiscais de Serviço</h1>
          <p className="text-muted-foreground">
            Gestão de NFS-e da Prefeitura de Barueri
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Busca
          </CardTitle>
          <CardDescription>
            Pesquise mensalidades pagas, NFS-e emitidas por período ou por número
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Busca</label>
              <Select value={searchType} onValueChange={(value) => setSearchType(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Por Aluno
                    </div>
                  </SelectItem>
                  <SelectItem value="period">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Por Período
                    </div>
                  </SelectItem>
                  <SelectItem value="number">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Por Número
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {searchType === 'period' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Inicial</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Final</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {searchType === 'student' ? 'Nome do Aluno' : 'Número da NFS-e'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={searchType === 'student' ? 'Digite o nome do aluno...' : 'Digite o número...'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchValue('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mensalidades Pagas (Para Emitir NFS-e) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-warning" />
              Mensalidades Pagas
            </CardTitle>
            <CardDescription>
              Mensalidades que podem ter NFS-e emitida ({filteredPayments.length} encontradas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPayments.map(payment => {
                const hasNFSe = mockNFSe.some(nfse => nfse.paymentId === payment.id);
                const student = mockStudents.find(s => s.name === payment.studentName);

                return (
                  <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{payment.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Responsável: {student?.guardian.name || 'Não informado'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.sport} - {payment.month}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          R$ {payment.amount.toFixed(2)}
                        </p>
                        <StatusBadge status={payment.status} size="sm" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Pago em: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                      {hasNFSe ? (
                        <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">
                          NFS-e Emitida
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleEmitNFSe(payment.id)}
                          className="flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          Emitir NFS-e
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredPayments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma mensalidade paga encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* NFS-e Emitidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-success" />
              NFS-e Emitidas
            </CardTitle>
            <CardDescription>
              Notas fiscais já emitidas ({filteredNFSe.length} encontradas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredNFSe.map(nfse => (
                <div key={nfse.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">NFS-e #{nfse.numero}</p>
                      <p className="text-sm text-muted-foreground">{nfse.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        Responsável: {nfse.guardianName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        R$ {nfse.valor.toFixed(2)}
                      </p>
                      <StatusBadge status={nfse.status} size="sm" />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>Emitida em: {new Date(nfse.dataEmissao).toLocaleDateString('pt-BR')}</p>
                    <p>Código: {nfse.codigoVerificacao}</p>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewNFSe(nfse.id)}
                      disabled={isLoading}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrintNFSe(nfse.id)}
                      disabled={isLoading || nfse.status === 'cancelada'}
                    >
                      {isLoading ? (
                        <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Download className="w-3 h-3 mr-1" />
                      )}
                      PDF
                    </Button>
                    {nfse.status !== 'cancelada' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isLoading}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancelar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                              Cancelar NFS-e #{nfse.numero}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A NFS-e será cancelada definitivamente na Prefeitura de Barueri.
                              <br /><br />
                              <strong>Dados da NFS-e:</strong><br />
                              • Aluno: {nfse.studentName}<br />
                              • Responsável: {nfse.guardianName}<br />
                              • Valor: R$ {nfse.valor.toFixed(2)}<br />
                              • Data de Emissão: {new Date(nfse.dataEmissao).toLocaleDateString('pt-BR')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Manter NFS-e</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelNFSe(nfse.id, 'Cancelamento solicitado pelo usuário')}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Confirmar Cancelamento
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {nfse.status === 'cancelada' && (
                      <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                        Cancelada
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredNFSe.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma NFS-e encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NFSe;