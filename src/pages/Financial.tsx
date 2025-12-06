import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, FileText, Send, Check, Filter, Receipt, Loader2, Plus, Search, Calendar, RefreshCw, Pencil, Trash2, Download, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePayments, useMarkPaymentAsPaid, useUpdatePayment, useDeletePayment, useCreatePayment } from '@/hooks/usePayments';
import { useStudents } from '@/hooks/useStudents';
import StatusBadge from '@/components/shared/StatusBadge';
import Button from '@/components/shared/Button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Financial: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [deletingPayment, setDeletingPayment] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  
  // Create payment modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    student_id: '',
    amount: '',
    due_date: '',
    sport: '',
    month: ''
  });

  const { data: allPayments = [], isLoading, isError, refetch } = usePayments();
  const { data: students = [] } = useStudents();
  const createPayment = useCreatePayment();
  const markAsPaid = useMarkPaymentAsPaid();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

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

  // Chart data for monthly evolution
  const chartData = useMemo(() => {
    const monthlyData: Record<string, { month: string; paid: number; pending: number; overdue: number }> = {};
    
    allPayments.forEach(payment => {
      if (!monthlyData[payment.month]) {
        monthlyData[payment.month] = { month: payment.month, paid: 0, pending: 0, overdue: 0 };
      }
      
      const amount = Number(payment.amount);
      if (payment.status === 'paid') {
        monthlyData[payment.month].paid += amount;
      } else if (payment.status === 'overdue') {
        monthlyData[payment.month].overdue += amount;
      } else {
        monthlyData[payment.month].pending += amount;
      }
    });
    
    // Sort by month/year
    return Object.values(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.month.split('/');
      const [monthB, yearB] = b.month.split('/');
      if (yearA !== yearB) return yearA.localeCompare(yearB);
      const monthOrder = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
    }).slice(-6); // Last 6 months
  }, [allPayments]);

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

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setEditAmount(String(payment.amount));
    setEditDueDate(payment.due_date);
  };

  const handleSaveEdit = async () => {
    if (!editingPayment) return;
    
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    try {
      await updatePayment.mutateAsync({
        id: editingPayment.id,
        data: {
          amount,
          due_date: editDueDate
        }
      });
      toast.success('Mensalidade atualizada!');
      setEditingPayment(null);
    } catch (error: any) {
      toast.error(`Erro ao atualizar: ${error.message}`);
    }
  };

  const handleDeletePayment = async () => {
    if (!deletingPayment) return;
    
    try {
      await deletePayment.mutateAsync(deletingPayment.id);
      toast.success('Mensalidade excluída!');
      setDeletingPayment(null);
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.message}`);
    }
  };

  const handleOpenCreateModal = () => {
    const today = new Date();
    const defaultDueDate = new Date(today.getFullYear(), today.getMonth(), 5);
    if (defaultDueDate < today) {
      defaultDueDate.setMonth(defaultDueDate.getMonth() + 1);
    }
    
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const defaultMonth = `${monthNames[defaultDueDate.getMonth()]}/${defaultDueDate.getFullYear()}`;
    
    setNewPayment({
      student_id: '',
      amount: '',
      due_date: defaultDueDate.toISOString().split('T')[0],
      sport: 'Taxa Avulsa',
      month: defaultMonth
    });
    setIsCreateModalOpen(true);
  };

  const handleCreatePayment = async () => {
    if (!newPayment.student_id) {
      toast.error('Selecione um aluno');
      return;
    }
    
    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    
    if (!newPayment.due_date) {
      toast.error('Informe a data de vencimento');
      return;
    }

    const selectedStudent = students.find(s => s.id === newPayment.student_id);
    if (!selectedStudent) {
      toast.error('Aluno não encontrado');
      return;
    }

    try {
      await createPayment.mutateAsync({
        student_id: newPayment.student_id,
        student_name: selectedStudent.name,
        amount,
        due_date: newPayment.due_date,
        sport: newPayment.sport || 'Taxa Avulsa',
        month: newPayment.month,
        status: 'pending',
        paid_date: null
      });
      
      toast.success('Pagamento criado com sucesso!');
      setIsCreateModalOpen(false);
      setNewPayment({
        student_id: '',
        amount: '',
        due_date: '',
        sport: '',
        month: ''
      });
    } catch (error: any) {
      toast.error(`Erro ao criar pagamento: ${error.message}`);
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

  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      toast.error('Nenhum pagamento para exportar');
      return;
    }

    const headers = ['Aluno', 'Modalidade', 'Mês', 'Valor', 'Vencimento', 'Status', 'Data Pagamento'];
    
    const rows = filteredPayments.map(payment => [
      payment.student_name,
      payment.sport,
      payment.month,
      Number(payment.amount).toFixed(2).replace('.', ','),
      new Date(payment.due_date).toLocaleDateString('pt-BR'),
      payment.status === 'paid' ? 'Pago' : payment.status === 'overdue' ? 'Vencido' : 'Pendente',
      payment.paid_date ? new Date(payment.paid_date).toLocaleDateString('pt-BR') : '-'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pagamentos_${selectedMonth === 'all' ? 'todos' : selectedMonth.replace('/', '-')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`${filteredPayments.length} pagamentos exportados!`);
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
            variant="primary" 
            onClick={handleOpenCreateModal}
          >
            <Plus className="w-4 h-4" />
            Novo Pagamento
          </Button>
          <Button 
            variant="outline" 
            onClick={handleGenerateNextMonth} 
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
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
          <Button 
            variant="outline"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Monthly Evolution Chart */}
      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-academy">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Evolução Mensal</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis 
                  tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: 'var(--foreground)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="paid" name="Pagos" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pendentes" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Vencidos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleMarkAsPaid(payment.id)}
                              disabled={markAsPaid.isPending}
                              title="Marcar como pago"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPayment(payment)}
                              title="Editar mensalidade"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </>
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
                        {payment.status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingPayment(payment)}
                            title="Excluir mensalidade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
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

      {/* Edit Payment Modal */}
      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Mensalidade</DialogTitle>
          </DialogHeader>
          
          {editingPayment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Aluno:</strong> {editingPayment.student_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Modalidade:</strong> {editingPayment.sport}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Referência:</strong> {editingPayment.month}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-amount">Valor (R$)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-due-date">Data de Vencimento</Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingPayment(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              disabled={updatePayment.isPending}
            >
              {updatePayment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPayment} onOpenChange={(open) => !open && setDeletingPayment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Mensalidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mensalidade?
              {deletingPayment && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p><strong>Aluno:</strong> {deletingPayment.student_name}</p>
                  <p><strong>Modalidade:</strong> {deletingPayment.sport}</p>
                  <p><strong>Referência:</strong> {deletingPayment.month}</p>
                  <p><strong>Valor:</strong> R$ {Number(deletingPayment.amount).toFixed(2)}</p>
                </div>
              )}
              <p className="mt-2 text-destructive">Esta ação não pode ser desfeita.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePayment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePayment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Payment Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Pagamento Avulso</DialogTitle>
            <DialogDescription>
              Crie um pagamento manual para taxas extras ou casos especiais.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-student">Aluno *</Label>
              <Select 
                value={newPayment.student_id} 
                onValueChange={(value) => setNewPayment(prev => ({ ...prev, student_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students
                    .filter(s => s.status === 'active' || s.status === 'effective')
                    .map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-amount">Valor (R$) *</Label>
              <Input
                id="new-amount"
                type="number"
                step="0.01"
                min="0"
                value={newPayment.amount}
                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-due-date">Data de Vencimento *</Label>
              <Input
                id="new-due-date"
                type="date"
                value={newPayment.due_date}
                onChange={(e) => setNewPayment(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-sport">Descrição / Motivo</Label>
              <Input
                id="new-sport"
                type="text"
                value={newPayment.sport}
                onChange={(e) => setNewPayment(prev => ({ ...prev, sport: e.target.value }))}
                placeholder="Ex: Taxa de material, Uniforme, Taxa extra..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-month">Referência (Mês/Ano)</Label>
              <Input
                id="new-month"
                type="text"
                value={newPayment.month}
                onChange={(e) => setNewPayment(prev => ({ ...prev, month: e.target.value }))}
                placeholder="Ex: Janeiro/2025"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreatePayment}
              disabled={createPayment.isPending}
            >
              {createPayment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Criar Pagamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Financial;
