import supabase from '@/lib/supabaseClient';
import { Student } from '@/types';

const TABLE_NAME = 'students';

export const studentService = {
  // Criar aluno
  create: async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...studentData }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Student;
  },

  // Obter aluno por ID
  getById: async (id: string): Promise<Student | null> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Não encontrado
      throw error;
    }
    
    return data as Student;
  },

  // Obter todos os alunos
  getAll: async (filters?: { status?: string; sport?: string }): Promise<Student[]> => {
    let query = supabase.from(TABLE_NAME).select('*');
    
    // Aplicar filtros se fornecidos
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.sport) {
      query = query.contains('enrolledSports', [filters.sport]);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as Student[];
  },

  // Atualizar aluno
  update: async (id: string, updateData: Partial<Student>): Promise<Student> => {
    // Verificar se o ID é válido antes de fazer a atualização
    if (!id || typeof id !== 'string') {
      throw new Error('ID inválido para atualização do aluno');
    }
    
    // Primeiro, verificar se o aluno existe
    const { data: existingStudent, error: selectError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (selectError) {
      console.error('Erro ao verificar existência do aluno antes da atualização:', selectError);
      if (selectError.code === 'PGRST116') {
        throw new Error(`Nenhum aluno encontrado com o ID: ${id}. Não é possível atualizar um aluno inexistente.`);
      }
      throw selectError;
    }
    
    if (!existingStudent) {
      throw new Error(`Nenhum aluno encontrado com o ID: ${id}. Não é possível atualizar um aluno inexistente.`);
    }
    
    // Agora, fazer a atualização
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro na atualização do aluno:', error);
      // Verificar se o erro é específico do Supabase sobre não encontrar um registro
      if (error.code === 'PGRST116' || error.message.includes('JSON object')) {
        throw new Error(`Nenhum aluno encontrado com o ID: ${id}. Não é possível atualizar um aluno inexistente.`);
      }
      throw error;
    }

    if (!data) {
      throw new Error(`Nenhum aluno encontrado com o ID: ${id}. Não é possível atualizar um aluno inexistente.`);
    }
    
    return data as Student;
  },

  // Deletar aluno
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Upload de foto para Supabase Storage
  uploadPhoto: async (file: File, studentId: string): Promise<string> => {
    // Criar nome único para arquivo
    const fileName = `students/${studentId}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase
      .storage
      .from('student-photos')
      .upload(fileName, file, { 
        cacheControl: '3600',
        upsert: true 
      });
    
    if (error) throw error;
    
    // Obter URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from('student-photos')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  // Deletar foto do aluno no Supabase Storage
  deletePhoto: async (photoUrl: string): Promise<void> => {
    // Extrai o caminho do arquivo a partir da URL
    const path = photoUrl.split('/storage/v1/object/public/student-photos/')[1];
    
    if (!path) throw new Error('URL inválida para deletar foto');
    
    const { error } = await supabase
      .storage
      .from('student-photos')
      .remove([path]);
    
    if (error) throw error;
  },
  
  // Obter aluno provisório pelo e-mail do responsável
  getProvisionalByGuardianEmail: async (email: string): Promise<Student | null> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('guardian->>email', email)
      .eq('status', 'provisional')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Não encontrado
      throw error;
    }
    
    return data as Student;
  },

  // Obter aula inaugural agendada pelo ID do aluno com JOIN na tabela sports
  getInauguralClassByStudentId: async (studentId: string) => {
    const { data, error } = await supabase
      .from('inaugural_classes')
      .select(`
        *,
        sports:selected_modality_id (
          id,
          name,
          description
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'scheduled')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Não encontrado
      throw error;
    }

    return data;
  },

  // Obter aluno efetivado pelo e-mail do responsável
  getEffectiveByGuardianEmail: async (email: string): Promise<Student | null> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('guardian->>email', email)
      .eq('status', 'effective')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Não encontrado
      throw error;
    }

    return data as Student;
  },

  // Obter pagamentos do aluno
  getPayments: async (studentId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obter eventos/aulas do aluno
  getEvents: async (studentId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .contains('students', [studentId])
      .gte('date', new Date().toISOString().split('T')[0]) // Apenas eventos futuros
      .order('date', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data || [];
  }
};

// Novas funções otimizadas seguindo as instruções da História 2.2

// 1. Busca o aluno PROVISÓRIO pelo E-MAIL do responsável (que vem do usuário autenticado)
export const getProvisionalStudentByGuardianEmail = async (email: string) => {
  console.log('Buscando aluno provisório para email:', email);

  // Como há múltiplos alunos, vamos buscar todos e filtrar
  const { data: allStudents, error } = await supabase
    .from('students')
    .select('*')
    .eq('status', 'provisional');

  console.log('Todos os alunos provisórios:', allStudents);

  if (error) {
    console.error('Erro ao buscar alunos provisórios:', error);
    throw error;
  }

  // Filtrar manualmente pelo email do guardian
  const foundStudent = allStudents?.find(student => {
    console.log('Verificando aluno:', student.name, 'Guardian:', student.guardian);
    return student.guardian && student.guardian.email === email;
  });

  console.log('Aluno encontrado na busca manual:', foundStudent);
  return foundStudent || null;
};

// 2. Busca a aula inaugural pelo ID do aluno com JOIN na tabela sports
export const getInauguralClassByStudentId = async (studentId: string) => {
  console.log('Buscando aula inaugural para student ID:', studentId);

  // Primeiro buscar a aula inaugural sem o JOIN
  const { data: inauguralClass, error } = await supabase
    .from('inaugural_classes')
    .select('*')
    .eq('student_id', studentId)
    .eq('status', 'scheduled')
    .maybeSingle();

  console.log('Resultado da busca inaugural class:', { inauguralClass, error });

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar aula inaugural:', error);
    throw error;
  }

  if (!inauguralClass) {
    console.log('Nenhuma aula inaugural encontrada');
    return null;
  }

  // Depois buscar os dados do sport separadamente
  const { data: sport, error: sportError } = await supabase
    .from('sports')
    .select('id, name, description')
    .eq('id', inauguralClass.selected_modality_id)
    .single();

  console.log('Resultado da busca sport:', { sport, sportError });

  // Combinar os dados
  const result = {
    ...inauguralClass,
    sports: sport || null
  };

  console.log('Resultado final da aula inaugural:', result);
  return result;
};