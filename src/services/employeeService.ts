import { supabase } from '@/integrations/supabase/client';

export interface EmployeeDB {
  id: string;
  full_name: string;
  email: string;
  role_id: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const employeeService = {
  getAll: async (): Promise<EmployeeDB[]> => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error getting employees:', error);
      throw new Error(`Error getting employees: ${error.message}`);
    }

    return data || [];
  },

  getById: async (id: string): Promise<EmployeeDB | null> => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error getting employee:', error);
      throw new Error(`Error getting employee: ${error.message}`);
    }

    return data;
  },

  create: async (employee: Omit<EmployeeDB, 'id' | 'created_at' | 'updated_at'>): Promise<EmployeeDB> => {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      throw new Error(`Error creating employee: ${error.message}`);
    }

    return data;
  },

  update: async (id: string, employee: Partial<EmployeeDB>): Promise<EmployeeDB> => {
    const { data, error } = await supabase
      .from('employees')
      .update({ ...employee, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee:', error);
      throw new Error(`Error updating employee: ${error.message}`);
    }

    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      throw new Error(`Error deleting employee: ${error.message}`);
    }
  }
};
