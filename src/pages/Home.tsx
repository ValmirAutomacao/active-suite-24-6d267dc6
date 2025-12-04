import React from 'react';
import { Users, DollarSign, AlertTriangle, Calendar, TrendingUp, Trophy, UserCheck, UserPlus } from 'lucide-react';
import { useDashboardMetrics, useRecentPayments, useTodayEvents } from '@/hooks/useReports';
import StatusBadge from '@/components/shared/StatusBadge';
import ABCCurveChart from '@/components/reports/ABCCurveChart';
import { Skeleton } from '@/components/ui/skeleton';

const Home: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: recentPayments, isLoading: paymentsLoading } = useRecentPayments();
  const { data: todayEvents, isLoading: eventsLoading } = useTodayEvents();

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard da Academia
        </h1>
        <p className="text-muted-foreground">
          Visão geral do desempenho e atividades da academia esportiva
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {metricsLoading ? (
          // Loading skeletons
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 shadow-academy">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <Skeleton className="w-16 h-8" />
              </div>
              <Skeleton className="w-24 h-4 mb-2" />
              <Skeleton className="w-20 h-3" />
            </div>
          ))
        ) : metricsError ? (
          <div className="col-span-5 bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive">Erro ao carregar métricas do dashboard</p>
          </div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-info/10 rounded-lg">
                  <Users className="w-6 h-6 text-info" />
                </div>
                <span className="text-2xl font-bold text-foreground">{metrics?.totalStudents || 0}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Total de Alunos</h3>
              <p className="text-xs text-info mt-1">+{metrics?.newStudentsThisMonth || 0} novos este mês</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <UserCheck className="w-6 h-6 text-success" />
                </div>
                <span className="text-2xl font-bold text-foreground">{metrics?.activeStudents || 0}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Alunos Ativos</h3>
              <p className="text-xs text-success mt-1">{metrics?.effectiveStudents || 0} efetivados</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <UserPlus className="w-6 h-6 text-warning" />
                </div>
                <span className="text-2xl font-bold text-foreground">{metrics?.provisionalStudents || 0}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Provisórios</h3>
              <p className="text-xs text-muted-foreground mt-1">Aguardando efetivação</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">
                  R$ {(metrics?.monthlyRevenue || 0).toLocaleString('pt-BR')}
                </span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Receita Mensal</h3>
              <p className="text-xs text-primary mt-1">Potencial total</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-2xl font-bold text-foreground">{metrics?.upcomingEvents || 0}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Próximos Eventos</h3>
              <p className="text-xs text-muted-foreground mt-1">{metrics?.todayEvents || 0} hoje</p>
            </div>
          </>
        )}
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Recent Payments */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-card-foreground">Receitas Recentes</h3>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="space-y-4">
            {paymentsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-12 h-3" />
                  </div>
                </div>
              ))
            ) : recentPayments && recentPayments.length > 0 ? (
              recentPayments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">{payment.studentName}</p>
                    <p className="text-sm text-muted-foreground">{payment.sport}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-card-foreground">R$ {payment.amount.toFixed(2)}</p>
                    <StatusBadge status={payment.status} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma receita recente</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-card-foreground">Eventos de Hoje</h3>
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            {eventsLoading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-12 h-3" />
                  </div>
                </div>
              ))
            ) : todayEvents && todayEvents.length > 0 ? (
              todayEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-card-foreground">
                      {event.startTime} - {event.endTime}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-lg ${
                      event.type === 'training' ? 'bg-info/20 text-info' :
                      event.type === 'competition' ? 'bg-success/20 text-success' :
                      event.type === 'inaugural' ? 'bg-warning/20 text-warning' :
                      'bg-secondary/20 text-secondary'
                    }`}>
                      {event.type === 'training' ? 'Treino' :
                       event.type === 'competition' ? 'Competição' :
                       event.type === 'inaugural' ? 'Inaugural' : 'Evento'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum evento hoje</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-card-foreground">Resumo Rápido</h3>
            <Users className="w-5 h-5 text-info" />
          </div>
          <div className="space-y-4">
            {metricsLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-8 h-4" />
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                  <span className="text-sm text-success">Alunos Ativos</span>
                  <span className="font-bold text-success">{metrics?.activeStudents || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-info/10 rounded">
                  <span className="text-sm text-info">Efetivados</span>
                  <span className="font-bold text-info">{metrics?.effectiveStudents || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-warning/10 rounded">
                  <span className="text-sm text-warning">Provisórios</span>
                  <span className="font-bold text-warning">{metrics?.provisionalStudents || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                  <span className="text-sm text-primary">Receita Mensal</span>
                  <span className="font-bold text-primary text-sm">
                    R$ {((metrics?.monthlyRevenue || 0) / 1000).toFixed(1)}k
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ABC Curve Analysis - Full Width */}
      <div className="mb-6">
        <ABCCurveChart />
      </div>
    </div>
  );
};

export default Home;