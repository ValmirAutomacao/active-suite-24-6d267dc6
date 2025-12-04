import supabase from '@/lib/supabaseClient';
import { Sport } from '@/types';

const TABLE_NAME = 'sports';

export const sportService = {
  // Create sport
  create: async (sportData: Omit<Sport, 'id' | 'currentStudents' | 'createdAt' | 'updated_at'>): Promise<Sport> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ 
        ...sportData,
        current_students: 0, // Initialize with 0 students
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Sport;
  },

  // Get sport by ID
  getById: async (id: string): Promise<Sport | null> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return data as Sport;
  },

  // Get all sports
  getAll: async (): Promise<Sport[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Sport[];
  },

  // Update sport
  update: async (id: string, updateData: Partial<Sport>): Promise<Sport> => {
    // Verify if ID is valid before updating
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid ID for sport update');
    }
    
    // First, check if the sport exists
    const { data: existingSport, error: selectError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (selectError) {
      console.error('Error checking sport existence before update:', selectError);
      if (selectError.code === 'PGRST116') {
        throw new Error(`No sport found with ID: ${id}. Cannot update a non-existent sport.`);
      }
      throw selectError;
    }
    
    if (!existingSport) {
      throw new Error(`No sport found with ID: ${id}. Cannot update a non-existent sport.`);
    }
    
    // Now, perform the update
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ 
        ...updateData, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sport:', error);
      // Check if error is specific to Supabase about not finding a record
      if (error.code === 'PGRST116' || error.message.includes('JSON object')) {
        throw new Error(`No sport found with ID: ${id}. Cannot update a non-existent sport.`);
      }
      throw error;
    }

    if (!data) {
      throw new Error(`No sport found with ID: ${id}. Cannot update a non-existent sport.`);
    }
    
    return data as Sport;
  },

  // Delete sport
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};