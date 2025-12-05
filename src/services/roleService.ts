import { supabase } from '@/integrations/supabase/client';

export interface RoleDB {
  id: string;
  name: string;
  description: string | null;
  permissions: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export const roleService = {
  getAll: async (): Promise<RoleDB[]> => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error getting roles:', error);
      throw new Error(`Error getting roles: ${error.message}`);
    }

    return data || [];
  },

  getById: async (id: string): Promise<RoleDB | null> => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error getting role:', error);
      throw new Error(`Error getting role: ${error.message}`);
    }

    return data;
  },

  create: async (role: Omit<RoleDB, 'id' | 'created_at' | 'updated_at'>): Promise<RoleDB> => {
    const { data, error } = await supabase
      .from('roles')
      .insert([role])
      .select()
      .single();

    if (error) {
      console.error('Error creating role:', error);
      throw new Error(`Error creating role: ${error.message}`);
    }

    return data;
  },

  update: async (id: string, role: Partial<RoleDB>): Promise<RoleDB> => {
    const { data, error } = await supabase
      .from('roles')
      .update({ ...role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating role:', error);
      throw new Error(`Error updating role: ${error.message}`);
    }

    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting role:', error);
      throw new Error(`Error deleting role: ${error.message}`);
    }
  }
};
