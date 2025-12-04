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

// Versão mais segura e robusta para produção
export const reportServiceSafe = {
  // Buscar métricas com tratamento robusto de erros
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Query mais robusta com campos que sabemos que existem
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          status,
          monthlyFee,
          enrollmentDate,
          created_at
        `);

      if (studentsError) {
        console.error('Erro ao buscar estudantes:', studentsError);
        // Retorna métricas vazias em caso de erro
        return {
          totalStudents: 0,
          activeStudents: 0,
          provisionalStudents: 0,
          effectiveStudents: 0,
          monthlyRevenue: 0,
          overduePayments: 0,
          defaultRate: 0,
          upcomingEvents: 0,
          todayEvents: 0,
          newStudentsThisMonth: 0,
          revenueGrowth: 0
        };
      }

      // Calcular métricas com fallbacks seguros
      const totalStudents = students?.length || 0;
      const activeStudents = students?.filter(s => s.status === 'active').length || 0;
      const provisionalStudents = students?.filter(s => s.status === 'provisional').length || 0;
      const effectiveStudents = students?.filter(s => s.status === 'effective').length || 0;

      // Novos estudantes usando created_at como fallback
      const newStudentsThisMonth = students?.filter(s => {
        const dateField = s.enrollmentDate || s.created_at;
        if (!dateField) return false;

        const createdAt = new Date(dateField);
        return createdAt.getMonth() + 1 === currentMonth && createdAt.getFullYear() === currentYear;
      }).length || 0;

      // Receita mensal com verificação de campo
      const monthlyRevenue = students?.reduce((sum, s) => {
        if ((s.status === 'active' || s.status === 'effective') && s.monthlyFee) {
          return sum + Number(s.monthlyFee);
        }
        return sum;
      }, 0) || 0;

      // Buscar eventos de forma segura
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { data: upcomingEventsData } = await supabase
        .from('events')
        .select('id')
        .gte('date', currentDate.toISOString().split('T')[0])
        .lte('date', nextWeek.toISOString().split('T')[0]);

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
        overduePayments: 0, // Será implementado quando tiver dados de pagamentos
        defaultRate: 0,
        upcomingEvents: upcomingEventsData?.length || 0,
        todayEvents: todayEventsData?.length || 0,
        newStudentsThisMonth,
        revenueGrowth: 0
      };

    } catch (error) {
      console.error('Erro inesperado em getDashboardMetrics:', error);
      // Retorna métricas vazias em caso de erro crítico
      return {
        totalStudents: 0,
        activeStudents: 0,
        provisionalStudents: 0,
        effectiveStudents: 0,
        monthlyRevenue: 0,
        overduePayments: 0,
        defaultRate: 0,
        upcomingEvents: 0,
        todayEvents: 0,
        newStudentsThisMonth: 0,
        revenueGrowth: 0
      };
    }
  },

  // Curva ABC com tratamento de erro robusto
  getStudentsABCCurve: async (): Promise<StudentABC[]> => {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('id, name, monthlyFee, status')
        .in('status', ['active', 'effective'])
        .not('monthlyFee', 'is', null)
        .order('monthlyFee', { ascending: false });

      if (error) {
        console.error('Erro ao buscar dados para ABC:', error);
        return [];
      }

      if (!students || students.length === 0) return [];

      // Filtrar apenas estudantes com monthlyFee válido
      const validStudents = students.filter(s => s.monthlyFee && Number(s.monthlyFee) > 0);

      if (validStudents.length === 0) return [];

      const totalRevenue = validStudents.reduce((sum, s) => sum + Number(s.monthlyFee), 0);

      let cumulativeRevenue = 0;
      const studentsWithMetrics = validStudents.map((student) => {
        const monthlyFee = Number(student.monthlyFee);
        cumulativeRevenue += monthlyFee;

        return {
          id: student.id,
          name: student.name,
          monthlyFee,
          cumulativeRevenue,
          revenuePercentage: (monthlyFee / totalRevenue) * 100,
          cumulativePercentage: (cumulativeRevenue / totalRevenue) * 100,
          classification: 'C' as 'A' | 'B' | 'C'
        };
      });

      // Aplicar classificação ABC
      return studentsWithMetrics.map(student => ({
        ...student,
        classification: student.cumulativePercentage <= 80 ? 'A' :
                      student.cumulativePercentage <= 95 ? 'B' : 'C'
      }));

    } catch (error) {
      console.error('Erro inesperado em getStudentsABCCurve:', error);
      return [];
    }
  },

  // Eventos de hoje com tratamento robusto
  getTodayEvents: async () => {
    try {
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

      if (error) {
        console.error('Erro ao buscar eventos de hoje:', error);
        return [];
      }

      return events?.map(event => ({
        id: event.id,
        title: event.title || 'Evento sem título',
        startTime: event.start_time?.substring(0, 5) || '',
        endTime: event.end_time?.substring(0, 5) || '',
        location: event.location || 'Local não informado',
        type: event.event_type || 'training',
        participantCount: event.current_participants || 0
      })) || [];

    } catch (error) {
      console.error('Erro inesperado em getTodayEvents:', error);
      return [];
    }
  },

  // Pagamentos recentes (simulado de forma mais segura)
  getRecentPayments: async () => {
    try {
      const { data: students } = await supabase
        .from('students')
        .select('id, name, monthlyFee, status')
        .in('status', ['active', 'effective'])
        .not('monthlyFee', 'is', null)
        .limit(5);

      return students?.map(student => ({
        id: student.id,
        studentName: student.name,
        amount: Number(student.monthlyFee) || 0,
        status: 'paid',
        dueDate: new Date().toISOString(),
        sport: 'Futebol'
      })) || [];

    } catch (error) {
      console.error('Erro em getRecentPayments:', error);
      return [];
    }
  }
};