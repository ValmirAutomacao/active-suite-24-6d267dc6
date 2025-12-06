import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/hooks/useStudents';
import { usePaymentsByStudent, useCreatePayment, useUpdatePayment, useDeletePayment, useMarkPaymentAsPaid } from '@/hooks/usePayments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Users, 
  DollarSign, 
  Eye, 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  FileText,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

// Ficha Financeira Component
const StudentFinancialSheet: React.FC<{
  student: any;
  onBack: () => void;
}> = ({ student, onBack }) => {
  const { data: payments = [], isLoading, refetch } = usePaymentsByStudent(student.id);
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();
  const markAsPaid = useMarkPaymentAsPaid();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [deletingPayment, setDeletingPayment] = useState<any>(null);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    due_date: '',
    sport: '',
    month: ''
  });
  const [editData, setEditData] = useState({ amount: '', due_date: '' });

  // Cálculos financeiros
  const financialSummary = useMemo(() => {
    const paid = payments.filter((p: any) => p.status === 'paid');
    const pending = payments.filter((p: any) => p.status === 'pending');
    const overdue = payments.filter((p: any) => p.status === 'overdue');

    return {
      totalPaid: paid.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      totalPending: pending.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      totalOverdue: overdue.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      countPaid: paid.length,
      countPending: pending.length,
      countOverdue: overdue.length
    };
  }, [payments]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-success-foreground">Pago</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Vencido</Badge>;
      default:
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pendente</Badge>;
    }
  };

  const handleCreatePayment = async () => {
    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    if (!newPayment.due_date) {
      toast.error('Informe a data de vencimento');
      return;
    }

    try {
      await createPayment.mutateAsync({
        student_id: student.id,
        student_name: student.name,
        amount,
        due_date: newPayment.due_date,
        sport: newPayment.sport || 'Taxa Avulsa',
        month: newPayment.month || new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        status: 'pending',
        paid_date: null
      });
      toast.success('Lançamento criado com sucesso!');
      setIsCreateModalOpen(false);
      setNewPayment({ amount: '', due_date: '', sport: '', month: '' });
      refetch();
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setEditData({
      amount: String(payment.amount),
      due_date: payment.due_date
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPayment) return;
    const amount = parseFloat(editData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    try {
      await updatePayment.mutateAsync({
        id: editingPayment.id,
        data: { amount, due_date: editData.due_date }
      });
      toast.success('Lançamento atualizado!');
      setEditingPayment(null);
      refetch();
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleDeletePayment = async () => {
    if (!deletingPayment) return;
    try {
      await deletePayment.mutateAsync(deletingPayment.id);
      toast.success('Lançamento excluído!');
      setDeletingPayment(null);
      refetch();
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await markAsPaid.mutateAsync(paymentId);
      toast.success('Marcado como pago!');
      refetch();
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleExportCSV = () => {
    if (payments.length === 0) {
      toast.error('Nenhum lançamento para exportar');
      return;
    }

    const headers = ['Mês', 'Modalidade', 'Valor', 'Vencimento', 'Status', 'Data Pagamento'];
    const rows = payments.map((p: any) => [
      p.month,
      p.sport,
      Number(p.amount).toFixed(2).replace('.', ','),
      formatDate(p.due_date),
      p.status === 'paid' ? 'Pago' : p.status === 'overdue' ? 'Vencido' : 'Pendente',
      p.paid_date ? formatDate(p.paid_date) : '-'
    ]);

    const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ficha_financeira_${student.name.replace(/\s/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Exportado com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
            <p className="text-muted-foreground">Ficha Financeira</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">CPF</p>
              <p className="font-medium">{student.cpf}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                {student.status === 'active' ? 'Ativo' : student.status === 'provisional' ? 'Provisório' : 'Inativo'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Modalidades</p>
              <p className="font-medium">{student.enrolledSports?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data Matrícula</p>
              <p className="font-medium">{formatDate(student.enrollmentDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Pago</p>
                <p className="text-xl font-bold text-success">{formatCurrency(financialSummary.totalPaid)}</p>
                <p className="text-xs text-muted-foreground">{financialSummary.countPaid} lançamento(s)</p>
              </div>
              <Check className="h-8 w-8 text-success/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pendente</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(financialSummary.totalPending)}</p>
                <p className="text-xs text-muted-foreground">{financialSummary.countPending} lançamento(s)</p>
              </div>
              <Calendar className="h-8 w-8 text-warning/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Atraso</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(financialSummary.totalOverdue)}</p>
                <p className="text-xs text-muted-foreground">{financialSummary.countOverdue} lançamento(s)</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Geral</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(financialSummary.totalPaid + financialSummary.totalPending + financialSummary.totalOverdue)}
                </p>
                <p className="text-xs text-muted-foreground">{payments.length} lançamento(s)</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Movimentações Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum lançamento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês/Ref.</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pago em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.month}</TableCell>
                      <TableCell>{payment.sport}</TableCell>
                      <TableCell>{formatCurrency(Number(payment.amount))}</TableCell>
                      <TableCell>{formatDate(payment.due_date)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{payment.paid_date ? formatDate(payment.paid_date) : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {payment.status !== 'paid' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsPaid(payment.id)}
                              title="Marcar como pago"
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPayment(payment)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingPayment(payment)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
            <DialogDescription>Adicione um novo lançamento para {student.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Descrição/Modalidade</Label>
              <Input
                value={newPayment.sport}
                onChange={(e) => setNewPayment({ ...newPayment, sport: e.target.value })}
                placeholder="Ex: Mensalidade, Taxa de Matrícula"
              />
            </div>
            <div>
              <Label>Mês Referência</Label>
              <Input
                value={newPayment.month}
                onChange={(e) => setNewPayment({ ...newPayment, month: e.target.value })}
                placeholder="Ex: Janeiro/2025"
              />
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={newPayment.due_date}
                onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreatePayment}>Criar Lançamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lançamento</DialogTitle>
            <DialogDescription>Modifique os dados do lançamento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editData.amount}
                onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
              />
            </div>
            <div>
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={editData.due_date}
                onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPayment(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPayment} onOpenChange={() => setDeletingPayment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePayment} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Main Page Component
const StudentFinancial: React.FC = () => {
  const { data: students = [], isLoading } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.cpf.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  if (selectedStudent) {
    return (
      <div className="container mx-auto p-6">
        <StudentFinancialSheet 
          student={selectedStudent} 
          onBack={() => setSelectedStudent(null)} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ficha Financeira por Aluno</h1>
          <p className="text-muted-foreground">
            Selecione um aluno para visualizar sua ficha financeira completa
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="provisional">Provisórios</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Alunos ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum aluno encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Modalidades</TableHead>
                    <TableHead>Data Matrícula</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow 
                      key={student.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.cpf}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                          {student.status === 'active' ? 'Ativo' : student.status === 'provisional' ? 'Provisório' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.enrolledSports?.length || 0}</TableCell>
                      <TableCell>{new Date(student.enrollmentDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Ficha
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentFinancial;
