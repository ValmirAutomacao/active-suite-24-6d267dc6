import supabase from '@/lib/supabaseClient';
import { EventDB } from '@/types';

type Event = EventDB;

const getAll = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error getting events:', error);
    throw new Error(`Error getting events: ${error.message}`);
  }

  return data || [];
};

const getById = async (id: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error getting event:', error);
    throw new Error(`Error getting event: ${error.message}`);
  }

  return data || null;
};

const create = async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> => {
  // Transformar o formato de data/hora se necessário
  const eventToInsert = {
    ...event,
    // Certificar-se de que date, start_time e end_time estejam formatados corretamente
    // Supondo que a entrada venha como string no formato esperado
  };

  const { data, error } = await supabase
    .from('events')
    .insert([eventToInsert])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw new Error(`Error creating event: ${error.message}`);
  }

  return data;
};

const update = async (id: string, event: Partial<Event>): Promise<Event> => {
  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw new Error(`Error updating event: ${error.message}`);
  }

  return data;
};

const remove = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw new Error(`Error deleting event: ${error.message}`);
  }
};

export { getAll, getById, create, update, remove };
export type { Event };