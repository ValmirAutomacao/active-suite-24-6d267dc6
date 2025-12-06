import React from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Calendar, TrendingUp, Trophy, UserCheck, UserPlus, ChevronRight, BarChart3 } from 'lucide-react';
import { useDashboardMetrics, useRecentPayments, useTodayEvents } from '@/hooks/useReports';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const HomeMobile: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: recentPayments, isLoading: paymentsLoading } = useRecentPayments();
  const { data: todayEvents, isLoading: eventsLoading } = useTodayEvents();

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <div className="animate-slide-up">
        <h1 className="text-xl font-bold text-foreground">
          Olá! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Veja o resumo da sua academia hoje
        </p>
      </div>

      {/* Quick Stats - Horizontal Scroll */}
      <div className="horizontal-scroll animate-slide-up stagger-1">
        {metricsLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="mobile-card min-w-[140px]">
              <Skeleton className="w-10 h-10 rounded-lg mb-3" />
              <Skeleton className="w-16 h-6 mb-1" />
              <Skeleton className="w-12 h-4" />
            </div>
          ))
        ) : (
          <>
            <div className="mobile-card min-w-[140px] glow-pulse">
              <div className="p-2.5 bg-info/15 rounded-lg w-fit mb-3">
                <Users className="w-5 h-5 text-info" />
              </div>
              <p className="text-2xl font-bold text-foreground">{metrics?.totalStudents || 0}</p>
              <p className="text-xs text-muted-foreground">Total Alunos</p>
            </div>

            <div className="mobile-card min-w-[140px]">
              <div className="p-2.5 bg-success/15 rounded-lg w-fit mb-3">
                <UserCheck className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">{metrics?.activeStudents || 0}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>

            <div className="mobile-card min-w-[140px]">
              <div className="p-2.5 bg-warning/15 rounded-lg w-fit mb-3">
                <UserPlus className="w-5 h-5 text-warning" />
              </div>
              <p className="text-2xl font-bold text-foreground">{metrics?.provisionalStudents || 0}</p>
              <p className="text-xs text-muted-foreground">Provisórios</p>
            </div>

            <div className="mobile-card min-w-[140px]">
              <div className="p-2.5 bg-primary/15 rounded-lg w-fit mb-3">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-lg font-bold text-foreground">
                R$ {((metrics?.monthlyRevenue || 0) / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-muted-foreground">Receita</p>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mobile-metrics-grid animate-slide-up stagger-2">
        <Link 
          to="/students/new" 
          className="mobile-card flex items-center gap-3 touch-active"
        >
          <div className="p-2.5 bg-primary/15 rounded-lg">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Novo Aluno</p>
            <p className="text-xs text-muted-foreground">Cadastrar</p>
          </div>
        </Link>

        <Link 
          to="/reports" 
          className="mobile-card flex items-center gap-3 touch-active"
        >
          <div className="p-2.5 bg-info/15 rounded-lg">
            <BarChart3 className="w-5 h-5 text-info" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Relatórios</p>
            <p className="text-xs text-muted-foreground">Ver dados</p>
          </div>
        </Link>
      </div>

      {/* Today's Events */}
      <div className="animate-slide-up stagger-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Eventos de Hoje
          </h2>
          <Link to="/calendar" className="text-xs text-primary font-medium flex items-center gap-1">
            Ver todos
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="space-y-2">
          {eventsLoading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="mobile-card">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <Skeleton className="w-16 h-6 rounded-full" />
                </div>
              </div>
            ))
          ) : todayEvents && todayEvents.length > 0 ? (
            todayEvents.slice(0, 3).map(event => (
              <div key={event.id} className="mobile-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.startTime} - {event.endTime} • {event.location}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 text-[10px] font-medium rounded-full whitespace-nowrap ml-2",
                    event.type === 'training' ? 'bg-info/20 text-info' :
                    event.type === 'competition' ? 'bg-success/20 text-success' :
                    event.type === 'inaugural' ? 'bg-warning/20 text-warning' :
                    'bg-secondary/20 text-secondary'
                  )}>
                    {event.type === 'training' ? 'Treino' :
                     event.type === 'competition' ? 'Competição' :
                     event.type === 'inaugural' ? 'Inaugural' : 'Evento'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="mobile-card text-center py-6">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Nenhum evento hoje</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="animate-slide-up stagger-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            Receitas Recentes
          </h2>
          <Link to="/financial" className="text-xs text-primary font-medium flex items-center gap-1">
            Ver todas
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="space-y-2">
          {paymentsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="mobile-card">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-12 h-5 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : recentPayments && recentPayments.length > 0 ? (
            recentPayments.slice(0, 4).map(payment => (
              <div key={payment.id} className="mobile-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{payment.studentName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{payment.sport}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-mono text-sm font-semibold text-foreground">
                      R$ {payment.amount.toFixed(0)}
                    </p>
                    <StatusBadge status={payment.status} size="sm" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="mobile-card text-center py-6">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Nenhuma receita recente</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="animate-slide-up stagger-5">
        <h2 className="text-base font-semibold text-foreground mb-3">
          Resumo Rápido
        </h2>
        
        <div className="space-y-2">
          {metricsLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="mobile-card flex items-center justify-between">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-8 h-4" />
              </div>
            ))
          ) : (
            <>
              <div className="mobile-card flex items-center justify-between bg-success/5 border-success/20">
                <span className="text-sm text-success font-medium">Alunos Ativos</span>
                <span className="font-bold text-success">{metrics?.activeStudents || 0}</span>
              </div>
              <div className="mobile-card flex items-center justify-between bg-info/5 border-info/20">
                <span className="text-sm text-info font-medium">Efetivados</span>
                <span className="font-bold text-info">{metrics?.effectiveStudents || 0}</span>
              </div>
              <div className="mobile-card flex items-center justify-between bg-warning/5 border-warning/20">
                <span className="text-sm text-warning font-medium">Provisórios</span>
                <span className="font-bold text-warning">{metrics?.provisionalStudents || 0}</span>
              </div>
              <div className="mobile-card flex items-center justify-between bg-primary/5 border-primary/20">
                <span className="text-sm text-primary font-medium">Receita Mensal</span>
                <span className="font-bold text-primary text-sm">
                  R$ {((metrics?.monthlyRevenue || 0) / 1000).toFixed(1)}k
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeMobile;