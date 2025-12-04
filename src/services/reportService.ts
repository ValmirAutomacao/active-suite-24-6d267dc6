import supabase from '@/lib/supabaseClient';

export interface DashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  provisionalStudents: number;
  effectiveStudents: number;
  monthlyRevenue: number;
  overduePayments: number;
  defaultRate: number;
  upcomingEvents: number;
  todayEvents: number;
  newStudentsThisMonth: number;
  revenueGrowth: number;
}

export interface StudentABC {
  id: string;
  name: string;
  monthlyFee: number;
  cumulativeRevenue: number;
  revenuePercentage: number;
  cumulativePercentage: number;
  classification: 'A' | 'B' | 'C';
}

export interface RecentPayment {
  id: string;
  studentName: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string;
  sport?: string;
}

export interface TodayEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  participantCount: number;
}

export const reportService = {
  // Buscar métricas principais do dashboard
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    // Buscar estudantes - usando nomes exatos do schema
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('status, monthlyFee, enrollmentDate');

    if (studentsError) throw studentsError;

    // Calcular métricas de estudantes
    const totalStudents = students?.length || 0;
    const activeStudents = students?.filter(s => s.status === 'active').length || 0;
    const provisionalStudents = students?.filter(s => s.status === 'provisional').length || 0;
    const effectiveStudents = students?.filter(s => s.status === 'effective').length || 0;

    const newStudentsThisMonth = students?.filter(s => {
      const createdAt = new Date(s.enrollmentDate);
      return createdAt.getMonth() + 1 === currentMonth && createdAt.getFullYear() === currentYear;
    }).length || 0;

    // Calcular receita mensal
    const monthlyRevenue = students?.reduce((sum, s) => {
      if (s.status === 'active' || s.status === 'effective') {
        return sum + (s.monthlyFee || 0);
      }
      return sum;
    }, 0) || 0;

    // Buscar eventos próximos (próximos 7 dias)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const { data: upcomingEventsData } = await supabase
      .from('events')
      .select('id')
      .gte('date', currentDate.toISOString().split('T')[0])
      .lte('date', nextWeek.toISOString().split('T')[0]);

    // Buscar eventos de hoje
    const today = currentDate.toISOString().split('T')[0];
    const { data: todayEventsData } = await supabase
      .from('events')
      .select('id')
      .eq('date', today);

    return {
      totalStudents,
      activeStudents,
      provisionalStudents,
      effectiveStudents,
      monthlyRevenue,
      overduePayments: 0, // TODO: Implementar quando tiver tabela de payments
      defaultRate: 0, // TODO: Calcular quando tiver dados de pagamentos
      upcomingEvents: upcomingEventsData?.length || 0,
      todayEvents: todayEventsData?.length || 0,
      newStudentsThisMonth,
      revenueGrowth: 0 // TODO: Calcular crescimento baseado em dados históricos
    };
  },

  // Implementar Curva ABC de estudantes por receita
  getStudentsABCCurve: async (): Promise<StudentABC[]> => {
    const { data: students, error } = await supabase
      .from('students')
      .select('id, name, monthlyFee, status')
      .in('status', ['active', 'effective'])
      .order('monthlyFee', { ascending: false });

    if (error) throw error;

    if (!students || students.length === 0) return [];

    // Calcular receita total
    const totalRevenue = students.reduce((sum, s) => sum + (s.monthlyFee || 0), 0);

    // Adicionar métricas de cada estudante
    let cumulativeRevenue = 0;
    const studentsWithMetrics = students.map((student, index) => {
      const monthlyFee = student.monthlyFee || 0;
      cumulativeRevenue += monthlyFee;

      return {
        id: student.id,
        name: student.name,
        monthlyFee,
        cumulativeRevenue,
        revenuePercentage: (monthlyFee / totalRevenue) * 100,
        cumulativePercentage: (cumulativeRevenue / totalRevenue) * 100,
        classification: 'C' as 'A' | 'B' | 'C' // Será classificado depois
      };
    });

    // Aplicar classificação ABC
    const classifiedStudents = studentsWithMetrics.map(student => {
      if (student.cumulativePercentage <= 80) {
        return { ...student, classification: 'A' as const };
      } else if (student.cumulativePercentage <= 95) {
        return { ...student, classification: 'B' as const };
      } else {
        return { ...student, classification: 'C' as const };
      }
    });

    return classifiedStudents;
  },

  // Buscar pagamentos recentes (simulado - implementar quando tiver tabela payments)
  getRecentPayments: async (): Promise<RecentPayment[]> => {
    // TODO: Implementar quando tiver tabela de payments real
    // Por enquanto, retorna dados baseados em students
    const { data: students } = await supabase
      .from('students')
      .select('id, name, monthlyFee, status')
      .in('status', ['active', 'effective'])
      .limit(5);

    return students?.map(student => ({
      id: student.id,
      studentName: student.name,
      amount: student.monthlyFee || 0,
      status: 'paid', // TODO: Status real do pagamento
      dueDate: new Date().toISOString(),
      sport: 'Futebol' // TODO: Buscar modalidade real
    })) || [];
  },

  // Buscar eventos de hoje com detalhes
  getTodayEvents: async (): Promise<TodayEvent[]> => {
    const today = new Date().toISOString().split('T')[0];

    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        start_time,
        end_time,
        location,
        event_type,
        current_participants
      `)
      .eq('date', today)
      .order('start_time', { ascending: true });

    if (error) throw error;

    return events?.map(event => ({
      id: event.id,
      title: event.title,
      startTime: event.start_time?.substring(0, 5) || '',
      endTime: event.end_time?.substring(0, 5) || '',
      location: event.location || '',
      type: event.event_type || 'training',
      participantCount: event.current_participants || 0
    })) || [];
  },

  // Buscar dados para gráficos de tendência
  getRevenueChart: async (months: number = 12): Promise<{ month: string; revenue: number }[]> => {
    // TODO: Implementar quando tiver dados históricos de pagamentos
    // Por enquanto retorna dados simulados
    const chartData = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      chartData.push({
        month: monthName,
        revenue: Math.random() * 10000 + 5000 // Dados simulados
      });
    }

    return chartData;
  },

  // Buscar distribuição de estudantes por modalidade
  getStudentsByModality: async (): Promise<{ modality: string; count: number; revenue: number }[]> => {
    // TODO: Implementar JOIN com tabela sports quando estiver disponível
    const { data: students } = await supabase
      .from('students')
      .select('enrolledSports, monthlyFee, status')
      .in('status', ['active', 'effective']);

    // Simulação temporária - será implementado com JOIN real
    const modalityMap = new Map();

    students?.forEach(student => {
      const modalityIds = student.enrolledSports || [];
      modalityIds.forEach((modalityId: string) => {
        if (!modalityMap.has(modalityId)) {
          modalityMap.set(modalityId, { count: 0, revenue: 0 });
        }
        const current = modalityMap.get(modalityId);
        modalityMap.set(modalityId, {
          count: current.count + 1,
          revenue: current.revenue + (student.monthlyFee || 0)
        });
      });
    });

    const result = [];
    for (const [modalityId, data] of modalityMap.entries()) {
      result.push({
        modality: `Modalidade ${modalityId}`, // TODO: Buscar nome real
        count: data.count,
        revenue: data.revenue
      });
    }

    return result;
  }
};