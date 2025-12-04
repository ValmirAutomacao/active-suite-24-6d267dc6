import supabase from '@/lib/supabaseClient';
import { Teacher } from '@/types';

const TABLE_NAME = 'teachers';

export const teacherService = {
  // Create teacher
  create: async (teacherData: Omit<Teacher, 'id' | 'modalitiesIds'>): Promise<Teacher> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...teacherData, createdAt: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();
    
    if (error) throw error;
    const newTeacher = data as Teacher;
    
    // Handle the modalities association after creating the teacher
    if (teacherData.modalitiesIds && Array.isArray(teacherData.modalitiesIds)) {
      // Create entries in the teacher_sports table
      const teacherSportsData = teacherData.modalitiesIds.map(modalityId => ({
        teacher_id: newTeacher.id,
        sport_id: modalityId
      }));
      
      if (teacherSportsData.length > 0) {
        const { error: junctionError } = await supabase
          .from('teacher_sports')
          .insert(teacherSportsData);
          
        if (junctionError) {
          console.error('Error creating teacher_sports associations:', junctionError);
          throw junctionError;
        }
      }
    }
    
    return newTeacher;
  },

  // Get teacher by ID
  getById: async (id: string): Promise<Teacher | null> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return data as Teacher;
  },

  // Get all teachers
  getAll: async (): Promise<Teacher[]> => {
    // First, get all teachers
    const { data: teachers, error: teachersError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('fullName', { ascending: true });
    
    if (teachersError) throw teachersError;
    
    // Then, try to get the teacher-sports relationships
    // If the teacher_sports table doesn't exist, just return teachers without modalities
    let teacherSports = [];
    try {
      const { data, error: junctionError } = await supabase
        .from('teacher_sports')
        .select('teacher_id, sport_id');
      
      if (!junctionError) {
        teacherSports = data || [];
      }
    } catch (error) {
      console.warn('Could not fetch teacher-sports relationships:', error);
      // Continue without the junction table data
    }
    
    // Combine the information
    const teachersWithModalityIds = teachers.map(teacher => {
      const modalityIds = teacherSports
        .filter(assoc => assoc.teacher_id === teacher.id)
        .map(assoc => assoc.sport_id);
      
      return {
        ...teacher,
        modalitiesIds: modalityIds
      };
    });
    
    return teachersWithModalityIds as Teacher[];
  },

  // Update teacher
  update: async (id: string, updateData: Partial<Teacher>): Promise<Teacher> => {
    // Verify if ID is valid before updating
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid ID for teacher update');
    }
    
    // First, check if the teacher exists
    const { data: existingTeacher, error: selectError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (selectError) {
      console.error('Error checking teacher existence before update:', selectError);
      if (selectError.code === 'PGRST116') {
        throw new Error(`No teacher found with ID: ${id}. Cannot update a non-existent teacher.`);
      }
      throw selectError;
    }
    
    if (!existingTeacher) {
      throw new Error(`No teacher found with ID: ${id}. Cannot update a non-existent teacher.`);
    }
    
    // Filter out modalitiesIds from the update data as it's handled separately
    const { modalitiesIds, ...updateTeacherData } = updateData;
    
    // Now, perform the update
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ 
        ...updateTeacherData, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating teacher:', error);
      // Check if error is specific to Supabase about not finding a record
      if (error.code === 'PGRST116' || error.message.includes('JSON object')) {
        throw new Error(`No teacher found with ID: ${id}. Cannot update a non-existent teacher.`);
      }
      throw error;
    }

    if (!data) {
      throw new Error(`No teacher found with ID: ${id}. Cannot update a non-existent teacher.`);
    }
    
    const updatedTeacher = data as Teacher;
    
    // Handle modalities associations separately if provided
    if (modalitiesIds && Array.isArray(modalitiesIds)) {
      // First, try to delete all existing associations for this teacher
      try {
        const { error: deleteError } = await supabase
          .from('teacher_sports')
          .delete()
          .eq('teacher_id', id);
        
        if (deleteError) {
          console.error('Error deleting existing teacher_sports associations:', deleteError);
          // Não lança erro, apenas avisa, pois a tabela pode não existir
        }
      } catch (error) {
        console.warn('Could not delete teacher-sports associations:', error);
        // Continua sem deletar as associações se a tabela não existir
      }
      
      // Then, try to insert the new associations
      if (modalitiesIds.length > 0) {
        const teacherSportsData = modalitiesIds.map(modalityId => ({
          teacher_id: id,
          sport_id: modalityId
        }));
        
        try {
          const { error: insertError } = await supabase
            .from('teacher_sports')
            .insert(teacherSportsData);
          
          if (insertError) {
            console.error('Error creating new teacher_sports associations:', insertError);
            // Não lança erro, apenas avisa, pois a tabela pode não existir
          }
        } catch (error) {
          console.warn('Could not create new teacher-sports associations:', error);
          // Continua sem criar as associações se a tabela não existir
        }
      }
    }
    
    return updatedTeacher;
  },

  // Delete teacher
  delete: async (id: string): Promise<void> => {
    // First, try to delete all associations in the junction table
    try {
      const { error: junctionError } = await supabase
        .from('teacher_sports')
        .delete()
        .eq('teacher_id', id);
      
      if (junctionError) {
        console.error('Error deleting teacher_sports associations:', junctionError);
        // Não lança erro, apenas avisa, pois a tabela pode não existir
      }
    } catch (error) {
      console.warn('Could not delete teacher-sports associations:', error);
      // Continua sem deletar as associações se a tabela não existir
    }
    
    // Then, delete the teacher
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};