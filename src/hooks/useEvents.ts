import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAll, getById, create, update, remove, Event as DBEvent } from '@/services/eventService';
import { Event as UIEvent } from '@/types';

// Função para converter dados do banco para o formato da UI
const convertDBEventToUIEvent = (dbEvent: DBEvent): UIEvent => {
  return {
    id: dbEvent.id || '',
    title: dbEvent.title,
    description: dbEvent.description || '',
    date: dbEvent.date,
    startTime: dbEvent.start_time,
    endTime: dbEvent.end_time,
    type: dbEvent.event_type as UIEvent['type'] || 'training',
    location: dbEvent.location,
    created_at: dbEvent.created_at || '',
    updated_at: dbEvent.updated_at || '',
    sport_id: dbEvent.modality_id,
    instructor_id: dbEvent.teacher_id,
    // Mapear outros campos conforme necessário
  };
};

// Função para converter dados da UI para o formato do banco
const convertUIEventToDBEvent = (uiEvent: any): Omit<DBEvent, 'id' | 'created_at' | 'updated_at'> => {
  const dbEvent = {
    title: uiEvent.title,
    description: uiEvent.description || '',
    date: uiEvent.date,
    start_time: uiEvent.startTime,
    end_time: uiEvent.endTime,
    location: uiEvent.location,
    event_type: uiEvent.type,
    modality_id: uiEvent.sport_id || null,
    teacher_id: uiEvent.instructor_id || null,
    // Campos adicionais que criamos
    max_participants: uiEvent.max_participants || null,
    current_participants: uiEvent.current_participants || 0,
    is_inaugural: uiEvent.is_inaugural || false,
    recurring_pattern: uiEvent.recurring_pattern || null,
    created_by: uiEvent.created_by || null,
    students: uiEvent.students || [],
    frequency: uiEvent.frequency || null,
    days_of_week: uiEvent.days_of_week || null,
  };

  return dbEvent;
};

const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const dbEvents = await getAll();
      return dbEvents.map(convertDBEventToUIEvent);
    },
  });
};

const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const dbEvent = await getById(id);
      return dbEvent ? convertDBEventToUIEvent(dbEvent) : null;
    },
    enabled: !!id, // Only run query if id is truthy
  });
};

const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uiEvent: Omit<UIEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const dbEvent = convertUIEventToDBEvent(uiEvent);
      return create(dbEvent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UIEvent> }) => {
      // Converter os dados da UI para o formato do banco
      const dbUpdateData = {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.startTime !== undefined && { start_time: data.startTime }),
        ...(data.endTime !== undefined && { end_time: data.endTime }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.sport_id !== undefined && { modality_id: data.sport_id }),
        ...(data.instructor_id !== undefined && { teacher_id: data.instructor_id }),
        ...(data.type !== undefined && { event_type: data.type })
      };
      return update(id, dbUpdateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'id'] }); // Invalidate specific event query
    },
  });
};

const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export { useEvents, useEvent, useCreateEvent, useUpdateEvent, useDeleteEvent };