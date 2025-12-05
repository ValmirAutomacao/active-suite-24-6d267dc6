import { supabase } from '@/integrations/supabase/client';

export interface PaymentDB {
  id: string;
  student_id: string;
  student_name: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string | null;
  sport: string;
  month: string;
  created_at: string | null;
  updated_at: string | null;
}

export const paymentService = {
  getAll: async (): Promise<PaymentDB[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Error getting payments:', error);
      throw new Error(`Error getting payments: ${error.message}`);
    }

    return data || [];
  },

  getByMonth: async (month: string): Promise<PaymentDB[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('month', month)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Error getting payments by month:', error);
      throw new Error(`Error getting payments: ${error.message}`);
    }

    return data || [];
  },

  getByStudentId: async (studentId: string): Promise<PaymentDB[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Error getting student payments:', error);
      throw new Error(`Error getting payments: ${error.message}`);
    }

    return data || [];
  },

  getById: async (id: string): Promise<PaymentDB | null> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error getting payment:', error);
      throw new Error(`Error getting payment: ${error.message}`);
    }

    return data;
  },

  create: async (payment: Omit<PaymentDB, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentDB> => {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      throw new Error(`Error creating payment: ${error.message}`);
    }

    return data;
  },

  update: async (id: string, payment: Partial<PaymentDB>): Promise<PaymentDB> => {
    const { data, error } = await supabase
      .from('payments')
      .update({ ...payment, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      throw new Error(`Error updating payment: ${error.message}`);
    }

    return data;
  },

  markAsPaid: async (id: string): Promise<PaymentDB> => {
    const { data, error } = await supabase
      .from('payments')
      .update({ 
        status: 'paid', 
        paid_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error marking payment as paid:', error);
      throw new Error(`Error updating payment: ${error.message}`);
    }

    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting payment:', error);
      throw new Error(`Error deleting payment: ${error.message}`);
    }
  },

  // Gerar pagamentos mensais para todos os alunos ativos
  generateMonthlyPayments: async (month: string): Promise<PaymentDB[]> => {
    // Buscar todos os alunos ativos
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, monthlyFee, enrolledSports')
      .in('status', ['active', 'effective']);

    if (studentsError) {
      throw new Error(`Error fetching students: ${studentsError.message}`);
    }

    if (!students || students.length === 0) {
      return [];
    }

    // Buscar modalidades para obter os nomes
    const { data: sports } = await supabase
      .from('sports')
      .select('id, name');

    const sportsMap = new Map(sports?.map(s => [s.id, s.name]) || []);

    // Criar pagamentos para cada aluno
    const payments = students.map(student => {
      const sportNames = (student.enrolledSports || [])
        .map((id: string) => sportsMap.get(id) || 'Modalidade')
        .join(' + ');

      return {
        student_id: student.id,
        student_name: student.name,
        amount: student.monthlyFee || 0,
        due_date: `${month}-05`, // Dia 5 do mês
        status: 'pending',
        sport: sportNames || 'Sem modalidade',
        month: month
      };
    });

    const { data, error } = await supabase
      .from('payments')
      .insert(payments)
      .select();

    if (error) {
      throw new Error(`Error generating payments: ${error.message}`);
    }

    return data || [];
  }
};
