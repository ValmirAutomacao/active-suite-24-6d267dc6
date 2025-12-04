import React, { useState, useMemo } from 'react';
import { DollarSign, FileText, Send, Check, Filter, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockPayments } from '@/data/mockPayments';
import { Payment } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import Button from '@/components/shared/Button';

const Financial: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  // Filter payments for current month
  const currentMonthPayments = mockPayments.filter(p => p.month === '2024-08');
  
  const filteredPayments = useMemo(() => {
    return currentMonthPayments.filter(payment => {
      if (filter === 'all') return true;
      return payment.status === filter;
    });
  }, [filter, currentMonthPayments]);

  // Calculate summaries
  const summaries = useMemo(() => {
    const paid = currentMonthPayments.filter(p => p.status === 'paid');
    const pending = currentMonthPayments.filter(p => p.status === 'pending');
    const overdue = currentMonthPayments.filter(p => p.status === 'overdue');
    
    return {
      paid: {
        count: paid.length,
        total: paid.reduce((sum, p) => sum + p.amount, 0)
      },
      pending: {
        count: pending.length,
        total: pending.reduce((sum, p) => sum + p.amount, 0)
      },
      overdue: {
        count: overdue.length,
        total: overdue.reduce((sum, p) => sum + p.amount, 0)
      },
      total: {
        count: currentMonthPayments.length,
        total: currentMonthPayments.reduce((sum, p) => sum + p.amount, 0)
      }
    };
  }, [currentMonthPayments]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão Financeira</h1>
          <p className="text-muted-foreground">Controle de pagamentos e receitas - Agosto 2024</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="w-4 h-4" />
            Exportar Relatório
          </Button>
          <Button variant="primary" disabled={selectedPayments.length === 0}>
            <Send className="w-4 h-4" />
            Cobrar Selecionados ({selectedPayments.length})
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
            R$ {summaries.paid.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Pendentes</h3>
            <div className="w-3 h-3 bg-warning rounded-full"></div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{summaries.pending.count}</p>
          <p className="text-warning text-sm font-medium">
            R$ {summaries.pending.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Em Atraso</h3>
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{summaries.overdue.count}</p>
          <p className="text-destructive text-sm font-medium">
            R$ {summaries.overdue.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
            <DollarSign className="w-4 h-4 text-info" />
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{summaries.total.count}</p>
          <p className="text-info text-sm font-medium">
            R$ {summaries.total.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          <Filter className="w-4 h-4" />
          Todos ({currentMonthPayments.length})
        </Button>
        <Button
          variant={filter === 'paid' ? 'success' : 'outline'}
          size="sm"
          onClick={() => setFilter('paid')}
        >
          Pagos ({summaries.paid.count})
        </Button>
        <Button
          variant={filter === 'pending' ? 'warning' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pendentes ({summaries.pending.count})
        </Button>
        <Button
          variant={filter === 'overdue' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => setFilter('overdue')}
        >
          Em Atraso ({summaries.overdue.count})
        </Button>
      </div>

      {/* Payments Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-academy">
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
                      {payment.studentName}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {payment.sport}
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-foreground font-semibold">
                      R$ {(payment.amount || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(payment.dueDate)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {payment.status !== 'paid' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => console.log('Mark as paid:', payment.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      {payment.status === 'paid' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => navigate(`/nfs-e/emit?paymentId=${payment.id}`)}
                          title="Emitir NFS-e"
                        >
                          <Receipt className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => console.log('Send reminder:', payment.id)}
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
      </div>
    </div>
  );
};

export default Financial;