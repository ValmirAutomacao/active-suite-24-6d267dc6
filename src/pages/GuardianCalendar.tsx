import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, MapPin, User, CalendarDays } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isTomorrow, isThisWeek, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  event_type: string | null;
  modality_id: string | null;
  teacher_id: string | null;
  modality_name?: string;
  teacher_name?: string;
}

export default function GuardianCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        // Buscar aluno pelo email do responsável
        const { data: students } = await supabase
          .from('students')
          .select('id, enrolledSports')
          .filter('guardian->>email', 'eq', user.email)
          .in('status', ['active', 'effective', 'provisional'])
          .limit(1);

        if (students && students.length > 0) {
          const student = students[0];
          
          // Buscar eventos do aluno (participações + aulas das modalidades)
          const today = startOfDay(new Date()).toISOString().split('T')[0];
          
          // Eventos que o aluno está inscrito
          const { data: participations } = await supabase
            .from('event_participants')
            .select('event_id')
            .eq('student_id', student.id)
            .eq('status', 'confirmed');

          const eventIds = participations?.map(p => p.event_id) || [];

          // Buscar eventos
          let query = supabase
            .from('events')
            .select('*')
            .gte('date', today)
            .order('date', { ascending: true })
            .order('start_time', { ascending: true });

          // Se tem participações ou modalidades inscritas
          if (eventIds.length > 0 || student.enrolledSports?.length > 0) {
            const conditions = [];
            if (eventIds.length > 0) {
              conditions.push(`id.in.(${eventIds.join(',')})`);
            }
            if (student.enrolledSports?.length > 0) {
              conditions.push(`modality_id.in.(${student.enrolledSports.join(',')})`);
            }
          }

          const { data: eventsData } = await query.limit(20);

          if (eventsData) {
            // Buscar nomes das modalidades e professores
            const modalityIds = [...new Set(eventsData.filter(e => e.modality_id).map(e => e.modality_id))] as string[];
            const teacherIds = [...new Set(eventsData.filter(e => e.teacher_id).map(e => e.teacher_id))] as string[];

            const [{ data: sports }, { data: teachers }] = await Promise.all([
              modalityIds.length > 0 
                ? supabase.from('sports').select('id, name').in('id', modalityIds)
                : { data: [] },
              teacherIds.length > 0
                ? supabase.from('teachers').select('id, fullName').in('id', teacherIds)
                : { data: [] },
            ]);

            const sportsMap = new Map<string, string>();
            sports?.forEach(s => sportsMap.set(s.id, s.name));
            const teachersMap = new Map<string, string>();
            teachers?.forEach(t => teachersMap.set(t.id, t.fullName));

            const enrichedEvents: Event[] = eventsData.map(event => ({
              id: event.id,
              title: event.title,
              description: event.description,
              date: event.date,
              start_time: event.start_time,
              end_time: event.end_time,
              location: event.location,
              event_type: event.event_type,
              modality_id: event.modality_id,
              teacher_id: event.teacher_id,
              modality_name: event.modality_id ? sportsMap.get(event.modality_id) : undefined,
              teacher_name: event.teacher_id ? teachersMap.get(event.teacher_id) : undefined,
            }));

            setEvents(enrichedEvents);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventTypeConfig = (type: string | null) => {
    const types: Record<string, { label: string; color: string }> = {
      training: { label: 'Treino', color: 'bg-blue-100 text-blue-800' },
      match: { label: 'Jogo', color: 'bg-green-100 text-green-800' },
      evaluation: { label: 'Avaliação', color: 'bg-purple-100 text-purple-800' },
      meeting: { label: 'Reunião', color: 'bg-yellow-100 text-yellow-800' },
      special: { label: 'Especial', color: 'bg-pink-100 text-pink-800' },
      inaugural: { label: 'Aula Inaugural', color: 'bg-orange-100 text-orange-800' },
    };
    return types[type || 'training'] || types.training;
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  const groupEventsByDate = (events: Event[]) => {
    const groups: Record<string, Event[]> = {};
    events.forEach(event => {
      const dateKey = event.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const groupedEvents = groupEventsByDate(events);
  const dateKeys = Object.keys(groupedEvents).sort();

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Agenda</h1>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento agendado</h3>
            <p className="text-muted-foreground">
              Você não possui eventos ou aulas programadas.
            </p>
          </CardContent>
        </Card>
      ) : (
        dateKeys.map(dateKey => {
          const dayEvents = groupedEvents[dateKey];
          const dateLabel = formatEventDate(dateKey);
          const isCurrentDay = isToday(new Date(dateKey));

          return (
            <div key={dateKey} className="space-y-3">
              <div className={`flex items-center gap-2 px-1 ${isCurrentDay ? 'text-primary font-semibold' : ''}`}>
                <Calendar className="h-4 w-4" />
                <span className="capitalize">{dateLabel}</span>
              </div>

              {dayEvents.map(event => {
                const typeConfig = getEventTypeConfig(event.event_type);

                return (
                  <Card key={event.id} className={isCurrentDay ? 'border-primary/50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          {event.modality_name && (
                            <p className="text-sm text-muted-foreground">{event.modality_name}</p>
                          )}
                        </div>
                        <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>

                        {event.teacher_name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Prof. {event.teacher_name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
