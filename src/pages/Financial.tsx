import React, { useState, useMemo } from 'react';
import { DollarSign, FileText, Send, Check, Filter, Receipt, Loader2, Plus, Search, Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePayments, useMarkPaymentAsPaid, useGenerateMonthlyPayments } from '@/hooks/usePayments';
import StatusBadge from '@/components/shared/StatusBadge';
import Button from '@/components/shared/Button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Financial: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: allPayments = [], isLoading, isError, refetch } = usePayments();
  const markAsPaid = useMarkPaymentAsPaid();
  const generatePayments = useGenerateMonthlyPayments();

  // Get unique months from payments
  const availableMonths = useMemo(() => {
    const months = [...new Set(allPayments.map(p => p.month))];
    return months.sort((a, b) => {
      const [monthA, yearA] = a.split('/');
      const [monthB, yearB] = b.split('/');
      if (yearA !== yearB) return yearB.localeCompare(yearA);
      return monthB.localeCompare(monthA);
    });
  }, [allPayments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return allPayments.filter(payment => {
      // Month filter
      if (selectedMonth !== 'all' && payment.month !== selectedMonth) return false;
      
      // Status filter
      if (filter !== 'all' && payment.status !== filter) return false;
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = payment.student_name.toLowerCase().includes(search);
        const matchesSport = payment.sport.toLowerCase().includes(search);
        return matchesName || matchesSport;
      }
      
      return true;
    });
  }, [allPayments, selectedMonth, filter, searchTerm]);

  // Calculate summaries based on filtered payments (or all if no month selected)
  const summaries = useMemo(() => {
    const basePayments = selectedMonth === 'all' ? allPayments : allPayments.filter(p => p.month === selectedMonth);
    const paid = basePayments.filter(p => p.status === 'paid');
    const pending = basePayments.filter(p => p.status === 'pending');
    const overdue = basePayments.filter(p => p.status === 'overdue');
    
    return {
      paid: {
        count: paid.length,
        total: paid.reduce((sum, p) => sum + Number(p.amount), 0)
      },
      pending: {
        count: pending.length,
        total: pending.reduce((sum, p) => sum + Number(p.amount), 0)
      },
      overdue: {
        count: overdue.length,
        total: overdue.reduce((sum, p) => sum + Number(p.amount), 0)
      },
      total: {
        count: basePayments.length,
        total: basePayments.reduce((sum, p) => sum + Number(p.amount), 0)
      }
    };
  }, [allPayments, selectedMonth]);

  const handleSelectAll = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map(p => p.id));
    }
  };

  const handleSelectPayment = (paymentId: string) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await markAsPaid.mutateAsync(paymentId);
      toast.success('Pagamento marcado como pago!');
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleGenerateNextMonth = async () => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-monthly-payments');
      if (response.error) throw response.error;
      
      const data = response.data;
      if (data.payments_created > 0) {
        toast.success(`${data.payments_created} mensalidades geradas para ${data.month}`);
        refetch();
      } else {
        toast.info(`Nenhuma nova mensalidade para gerar (${data.month})`);
      }
    } catch (error: any) {
      toast.error(`Erro ao gerar pagamentos: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendReminders = async () => {
    try {
      const response = await supabase.functions.invoke('send-payment-reminders');
      if (response.error) throw response.error;
      
      const data = response.data;
      if (data.reminders_sent > 0) {
        toast.success(`${data.reminders_sent} lembretes enviados!`);
      } else {
        toast.info(data.message || 'Nenhum lembrete para enviar');
      }
    } catch (error: any) {
      toast.error(`Erro ao enviar lembretes: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Erro ao carregar pagamentos</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Mensalidades</h1>
          <p className="text-muted-foreground">
            {filteredPayments.length} pagamento(s) encontrado(s)
            {selectedMonth !== 'all' && ` em ${selectedMonth}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={handleGenerateNextMonth} 
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Gerar Próximo Mês
          </Button>
          <Button 
            variant="outline"
            onClick={handleSendReminders}
          >
            <Send className="w-4 h-4" />
            Enviar Lembretes
          </Button>
          <Button 
            variant="outline"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Pagos</h3>
            <div className="w-3 h-3 bg-success rounded-full"></div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{summaries.paid.count}</p>
          <p className="text-success text-sm font-medium">
            {formatCurrency(summaries.paid.total)}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Pendentes</h3>
            <div className="w-3 h-3 bg-warning rounded-full"></div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{summaries.pending.count}</p>
          <p className="text-warning text-sm font-medium">
            {formatCurrency(summaries.pending.total)}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Em Atraso</h3>
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{summaries.overdue.count}</p>
          <p className="text-destructive text-sm font-medium">
            {formatCurrency(summaries.overdue.total)}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
            <DollarSign className="w-4 h-4 text-info" />
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{summaries.total.count}</p>
          <p className="text-info text-sm font-medium">
            {formatCurrency(summaries.total.total)}
          </p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por aluno ou modalidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Month Select */}
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {availableMonths.map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={filter === 'paid' ? 'success' : 'outline'}
            size="sm"
            onClick={() => setFilter('paid')}
          >
            Pagos
          </Button>
          <Button
            variant={filter === 'pending' ? 'warning' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === 'overdue' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setFilter('overdue')}
          >
            Em Atraso
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-academy">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {allPayments.length === 0 
              ? 'Nenhum pagamento cadastrado. As mensalidades são geradas automaticamente ao criar matrículas.'
              : 'Nenhum pagamento encontrado com os filtros selecionados.'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left">
                    <input 
                      type="checkbox" 
                      className="rounded bg-input border-border"
                      checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left text-foreground font-semibold">Aluno</th>
                  <th className="p-4 text-left text-foreground font-semibold">Modalidade</th>
                  <th className="p-4 text-left text-foreground font-semibold">Mês</th>
                  <th className="p-4 text-left text-foreground font-semibold">Valor</th>
                  <th className="p-4 text-left text-foreground font-semibold">Vencimento</th>
                  <th className="p-4 text-left text-foreground font-semibold">Status</th>
                  <th className="p-4 text-left text-foreground font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="rounded bg-input border-border"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => handleSelectPayment(payment.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">
                        {payment.student_name}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {payment.sport}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {payment.month}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-foreground font-semibold">
                        {formatCurrency(Number(payment.amount))}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatDate(payment.due_date)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={payment.status as any} />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {payment.status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleMarkAsPaid(payment.id)}
                            disabled={markAsPaid.isPending}
                            title="Marcar como pago"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {payment.status === 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/nfs-e/emit?paymentId=${payment.id}`)}
                            title="Emitir NFS-e"
                          >
                            <Receipt className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.info('Função de cobrança individual em desenvolvimento')}
                          title="Enviar cobrança"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Actions */}
      {selectedPayments.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {selectedPayments.length} selecionado(s)
          </span>
          <Button
            size="sm"
            variant="primary"
            onClick={() => toast.info('Cobrança em lote em desenvolvimento')}
          >
            <Send className="w-4 h-4" />
            Cobrar Selecionados
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedPayments([])}
          >
            Limpar Seleção
          </Button>
        </div>
      )}
    </div>
  );
};

export default Financial;
