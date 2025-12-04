/**
 * Serviço para integração entre eventos inaugurais e sistema de aulas inaugurais
 */
import supabase from '@/lib/supabaseClient';
import { getCurrentDateBrazil, formatDateBR, formatTimeRange } from '@/utils/dateUtils';

export interface InauguralEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  modality_id: string;
  modality_name: string;
  teacher_id?: string;
  teacher_name?: string;
  max_participants?: number;
  current_participants: number;
  available_spots: number;
  is_available: boolean;
}

/**
 * Busca eventos inaugurais disponíveis baseado na idade do estudante
 */
export const getAvailableInauguralEvents = async (studentAge: number): Promise<InauguralEvent[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_inaugural_events', { student_age: studentAge });

    if (error) throw error;

    return data?.map((event: any) => ({
      id: event.event_id,
      title: event.event_title,
      date: event.event_date,
      start_time: event.event_start_time,
      end_time: event.event_end_time,
      location: 'Campo Principal', // Padrão por enquanto
      modality_id: '',
      modality_name: event.modality_name || 'Aula Inaugural',
      teacher_name: event.teacher_name || 'Equipe Técnica',
      max_participants: null,
      current_participants: 0,
      available_spots: event.available_spots || 999,
      is_available: (event.available_spots || 999) > 0
    })) || [];

  } catch (error) {
    console.error('Erro ao buscar eventos inaugurais:', error);
    return [];
  }
};

/**
 * Registra aluno em um evento inaugural específico
 */
export const registerStudentInInauguralEvent = async (
  studentId: string,
  eventId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase
      .rpc('register_student_inaugural_event', {
        p_student_id: studentId,
        p_event_id: eventId
      });

    if (error) throw error;

    return data || { success: false, message: 'Erro desconhecido' };

  } catch (error: any) {
    console.error('Erro ao registrar aluno no evento:', error);
    return {
      success: false,
      message: error.message || 'Erro ao registrar no evento'
    };
  }
};

/**
 * Busca modalidades recomendadas para a idade
 */
export const getRecommendedModalitiesForAge = async (age: number) => {
  try {
    const { data: sports, error } = await supabase
      .from('sports')
      .select('*')
      .lte('age_range->>min', age)
      .gte('age_range->>max', age)
      .eq('status', 'active');

    if (error) throw error;

    return sports || [];

  } catch (error) {
    console.error('Erro ao buscar modalidades:', error);
    return [];
  }
};

/**
 * Gera eventos inaugurais padrão se não existirem
 * (Para administradores criarem eventos inaugurais automaticamente)
 */
export const generateDefaultInauguralEvents = async (modalityId: string, weeks: number = 8) => {
  try {
    const events = [];
    const today = getCurrentDateBrazil();

    for (let i = 0; i < weeks; i++) {
      // Calcular próximo sábado
      const nextSaturday = new Date(today);
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
      nextSaturday.setDate(today.getDate() + daysUntilSaturday + (i * 7));

      const eventData = {
        title: 'Aula Inaugural',
        description: 'Aula experimental gratuita para novos alunos',
        date: nextSaturday.toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '11:00',
        event_type: 'inaugural',
        modality_id: modalityId,
        location: 'Campo Principal',
        max_participants: 20,
        is_inaugural: true,
        current_participants: 0
      };

      events.push(eventData);
    }

    const { data, error } = await supabase
      .from('events')
      .insert(events)
      .select();

    if (error) throw error;

    return { success: true, events: data };

  } catch (error) {
    console.error('Erro ao gerar eventos inaugurais:', error);
    return { success: false, error };
  }
};

/**
 * Formata evento para exibição na interface
 */
export const formatEventForDisplay = (event: InauguralEvent) => {
  return {
    id: event.id,
    displayDate: formatDateBR(event.date),
    displayTime: formatTimeRange(event.start_time, event.end_time),
    displayTitle: event.title,
    displayModality: event.modality_name,
    displayTeacher: event.teacher_name,
    isAvailable: event.is_available,
    spotsLeft: event.available_spots
  };
};

/**
 * Verifica se um evento inaugural ainda está disponível
 */
export const checkEventAvailability = async (eventId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('max_participants, current_participants')
      .eq('id', eventId)
      .eq('is_inaugural', true)
      .single();

    if (error) throw error;

    if (!data) return false;

    // Se não há limite, sempre disponível
    if (!data.max_participants) return true;

    // Verificar se ainda há vagas
    return data.current_participants < data.max_participants;

  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return false;
  }
};

/**
 * Cancela participação em evento inaugural
 */
export const cancelInauguralEventParticipation = async (
  studentId: string,
  eventId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Remover da tabela de participantes
    const { error: deleteError } = await supabase
      .from('event_participants')
      .delete()
      .eq('student_id', studentId)
      .eq('event_id', eventId);

    if (deleteError) throw deleteError;

    // Atualizar contador de participantes (será feito pelo trigger automaticamente)

    // Limpar referência na tabela inaugural_classes
    const { error: updateError } = await supabase
      .from('inaugural_classes')
      .update({
        event_id: null,
        status: 'pending'
      })
      .eq('student_id', studentId);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Participação cancelada com sucesso'
    };

  } catch (error: any) {
    console.error('Erro ao cancelar participação:', error);
    return {
      success: false,
      message: error.message || 'Erro ao cancelar participação'
    };
  }
};