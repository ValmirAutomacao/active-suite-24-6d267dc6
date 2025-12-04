import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Filter, ChevronLeft, ChevronRight, Clock, MapPin, Users, Trophy } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useSports } from '@/hooks/useSports';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/shared/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  formatDateBR,
  formatTimeBR,
  formatTimeRange,
  getDayOfWeekBR,
  getMonthNameBR,
  getCurrentDateBrazil,
  isToday,
  MONTHS_BR,
  DAYS_OF_WEEK_SHORT_BR,
  EVENT_TYPE_LABELS
} from '@/utils/dateUtils';

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(getCurrentDateBrazil());
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Get events and sports from Supabase
  const { data: events = [], isLoading, isError } = useEvents();
  const { data: sports = [], isLoading: sportsLoading, isError: sportsError } = useSports();

  // Get current month events
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Format events to match the calendar requirements with Brazil timezone
  const formattedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    startTime: event.startTime, // Corrigido: usar startTime em vez de start_time
    endTime: event.endTime,     // Corrigido: usar endTime em vez de end_time
    type: event.type || 'training', // Corrigido: usar type em vez de event_type
    sport: event.sport_id || '',
    sportName: sports.find(s => s.id === event.sport_id)?.name || '',
    teacherName: '', // Será buscado dos teachers se necessário
    location: event.location,
    maxParticipants: event.max_participants,
    currentParticipants: event.current_participants || 0,
    isInaugural: event.is_inaugural || false
  }));

  const monthEvents = formattedEvents.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    const matchesMonth = eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    const matchesSport = selectedSport === 'all' || event.sport === selectedSport;
    return matchesMonth && matchesSport;
  });

  if (isLoading || sportsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-3 text-muted-foreground">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  if (isError || sportsError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <div className="text-destructive">Erro ao carregar dados</div>
          <p className="mt-2 text-muted-foreground">Tente novamente mais tarde</p>
        </div>
      </div>
    );
  }

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];

  // Previous month's trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(firstDayOfMonth);
    day.setDate(day.getDate() - i - 1);
    calendarDays.push({ date: day, isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth, day),
      isCurrentMonth: true
    });
  }

  // Next month's leading days
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth + 1, day),
      isCurrentMonth: false
    });
  }

  const getEventsForDay = (date: Date) => {
    return monthEvents.filter(event => {
      const eventDate = new Date(event.date + 'T00:00:00');
      return eventDate.toDateString() === date.toDateString();
    }).sort((a, b) => {
      // Ordenar por horário
      return a.startTime.localeCompare(b.startTime);
    });
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    // Navegar para criação de evento nesta data
    const dateStr = date.toISOString().split('T')[0];
    navigate(`/events/new?date=${dateStr}`);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-info text-info-foreground';
      case 'match': return 'bg-success text-success-foreground';
      case 'evaluation': return 'bg-warning text-warning-foreground';
      case 'meeting': return 'bg-destructive text-destructive-foreground';
      case 'special': return 'bg-primary text-primary-foreground';
      case 'inaugural': return 'bg-warning text-warning-foreground border-2 border-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(getCurrentDateBrazil());
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Agenda Esportiva</h1>
          <p className="text-muted-foreground">Treinos, jogos e eventos da academia</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={goToToday}>
            <CalendarIcon className="w-4 h-4" />
            Hoje
          </Button>
          <Link to="/events/new">
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              Novo Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Header with Navigation */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-academy">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold text-foreground">
              {MONTHS_BR[currentMonth]} {currentYear}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Sport Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="bg-input border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="all">Todas as modalidades</option>
              {sports.map(sport => (
                <option key={sport.id} value={sport.id.toString()}>{sport.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week headers */}
          {DAYS_OF_WEEK_SHORT_BR.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-b border-border">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day.date);
            const isTodayBR = isToday(day.date);

            return (
              <div
                key={index}
                className={`min-h-[140px] p-2 border border-border/50 cursor-pointer hover:bg-muted/20 transition-colors ${
                  day.isCurrentMonth ? 'bg-card' : 'bg-muted/30'
                } ${isTodayBR ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
              >
                <div className={`text-sm font-medium mb-2 flex justify-between items-center ${
                  day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                } ${isTodayBR ? 'text-primary font-bold' : ''}`}>
                  <span>{day.date.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-all transform hover:scale-105 ${
                        getEventTypeColor(event.type)
                      } ${event.isInaugural ? 'ring-1 ring-warning' : ''}`}
                      title={`${event.title} - ${formatTimeRange(event.startTime, event.endTime)}${event.location ? ` - ${event.location}` : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      <div className="font-medium truncate">
                        {event.title.length > 12 ? `${event.title.slice(0, 12)}...` : event.title}
                      </div>
                      <div className="text-xs opacity-90 truncate">
                        {event.startTime} {event.location && `• ${event.location.slice(0, 8)}`}
                      </div>
                      {event.isInaugural && (
                        <div className="text-xs bg-warning/30 text-warning-foreground px-1 rounded">
                          🎯 Inaugural
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div
                      className="text-xs text-muted-foreground text-center cursor-pointer hover:text-foreground transition-colors p-1 rounded bg-muted/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Mostrar modal com todos os eventos do dia
                        setSelectedEvent({ dayEvents, date: day.date });
                        setIsEventModalOpen(true);
                      }}
                    >
                      +{dayEvents.length - 3} evento{dayEvents.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Legend */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
        <h3 className="text-lg font-semibold text-foreground mb-4">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-info rounded"></div>
            <span className="text-sm text-muted-foreground">Treinos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success rounded"></div>
            <span className="text-sm text-muted-foreground">Jogos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning rounded"></div>
            <span className="text-sm text-muted-foreground">Avaliações</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive rounded"></div>
            <span className="text-sm text-muted-foreground">Reuniões</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-sm text-muted-foreground">Eventos Especiais</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning rounded border border-warning"></div>
            <span className="text-sm text-muted-foreground">🎯 Aulas Inaugurais</span>
          </div>
        </div>
      </div>

      {/* Modal de detalhes do evento */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedEvent?.dayEvents ? 'Eventos do Dia' : 'Detalhes do Evento'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.dayEvents
                ? 'Visualize todos os eventos agendados para este dia'
                : 'Informações completas sobre o evento selecionado'}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent?.dayEvents ? (
            // Modal com múltiplos eventos do dia
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {formatDateBR(selectedEvent.date)} - {getDayOfWeekBR(selectedEvent.date)}
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedEvent.dayEvents.map((event: any) => (
                  <Card key={event.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge className={getEventTypeColor(event.type)}>
                          {EVENT_TYPE_LABELS[event.type as keyof typeof EVENT_TYPE_LABELS] || event.type}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeRange(event.startTime, event.endTime)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        )}
                        {event.maxParticipants && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.currentParticipants}/{event.maxParticipants} participantes
                          </div>
                        )}
                        {event.sportName && (
                          <div className="text-xs bg-muted px-2 py-1 rounded">
                            {event.sportName}
                          </div>
                        )}
                        {event.isInaugural && (
                          <div className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">
                            🎯 Aula Inaugural
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : selectedEvent ? (
            // Modal com detalhes de um evento específico
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                <Badge className={getEventTypeColor(selectedEvent.type)}>
                  {EVENT_TYPE_LABELS[selectedEvent.type as keyof typeof EVENT_TYPE_LABELS] || selectedEvent.type}
                </Badge>
              </div>

              {selectedEvent.description && (
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDateBR(selectedEvent.date)} - {getDayOfWeekBR(selectedEvent.date)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeRange(selectedEvent.startTime, selectedEvent.endTime)}</span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.sportName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4" />
                    <span>Modalidade: {selectedEvent.sportName}</span>
                  </div>
                )}

                {selectedEvent.teacherName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    <span>Professor: {selectedEvent.teacherName}</span>
                  </div>
                )}

                {selectedEvent.maxParticipants && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    <span>
                      Participantes: {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants}
                      {selectedEvent.maxParticipants - selectedEvent.currentParticipants === 0 && (
                        <Badge variant="destructive" className="ml-2 text-xs">Lotado</Badge>
                      )}
                    </span>
                  </div>
                )}

                {selectedEvent.isInaugural && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm text-warning font-medium">
                      🎯 Aula Inaugural - Disponível para agendamento público
                    </p>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/events/edit/${selectedEvent.id}`);
                    setIsEventModalOpen(false);
                  }}
                  className="flex-1"
                >
                  Editar Evento
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja cancelar este evento?')) {
                      // TODO: Implementar função de cancelar evento
                      console.log('Cancelar evento:', selectedEvent.id);
                      setIsEventModalOpen(false);
                    }
                  }}
                  className="flex-1"
                >
                  Cancelar Evento
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;