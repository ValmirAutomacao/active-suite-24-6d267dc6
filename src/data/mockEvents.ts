import { Event } from '@/types';
import { mockSports } from './mockSports';

// Helper function to get day number (0 = Sunday, 1 = Monday, etc.)
const getDayNumber = (day: string): number => {
  const days = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  return days[day as keyof typeof days] || 0;
};

// Generate events for 3 months (August to November 2024)
const generateEvents = (): Event[] => {
  const events: Event[] = [];
  const startDate = new Date('2024-08-26');
  const endDate = new Date('2024-11-26');
  
  // Generate regular training sessions based on sport schedules
  mockSports.forEach(sport => {
    sport.schedule.forEach(schedule => {
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        if (currentDate.getDay() === getDayNumber(schedule.day)) {
          events.push({
            id: `training-${sport.id}-${currentDate.getTime()}`,
            title: `Treino ${sport.name}`,
            description: `Treino regular - ${sport.description}`,
            date: currentDate.toISOString().split('T')[0],
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            type: 'training',
            sport: sport.name,
            students: [], // Can be populated with specific student IDs
            location: getLocationBySport(sport.id),
            instructor: sport.instructor
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  });
  
  // Add special events
  const specialEvents = [
    {
      title: 'Torneio Interacademias - Futebol',
      description: 'Torneio amistoso entre academias da região',
      date: '2024-09-15',
      startTime: '08:00',
      endTime: '17:00',
      type: 'match' as const,
      sport: 'Futebol',
      location: 'Complexo Esportivo Central'
    },
    {
      title: 'Avaliação Física Trimestral',
      description: 'Avaliação física e técnica de todos os alunos',
      date: '2024-10-01',
      startTime: '08:00',
      endTime: '12:00',
      type: 'evaluation' as const,
      location: 'Sala de Avaliação'
    },
    {
      title: 'Reunião de Pais - Basquete',
      description: 'Apresentação dos resultados e planejamento',
      date: '2024-09-20',
      startTime: '19:00',
      endTime: '21:00',
      type: 'meeting' as const,
      sport: 'Basquete',
      location: 'Auditório'
    },
    {
      title: 'Festival de Natação',
      description: 'Competição interna de natação',
      date: '2024-10-12',
      startTime: '09:00',
      endTime: '16:00',
      type: 'special' as const,
      sport: 'Natação',
      location: 'Piscina Olímpica'
    },
    {
      title: 'Jogo Amistoso - Futsal',
      description: 'Amistoso contra Academia Campeã',
      date: '2024-09-28',
      startTime: '15:00',
      endTime: '17:00',
      type: 'match' as const,
      sport: 'Futsal',
      location: 'Quadra Principal'
    },
    {
      title: 'Workshop Técnico - Vôlei',
      description: 'Workshop com técnico especializado',
      date: '2024-10-25',
      startTime: '14:00',
      endTime: '18:00',
      type: 'special' as const,
      sport: 'Vôlei',
      location: 'Quadra de Vôlei'
    },
    {
      title: 'Avaliação Médica',
      description: 'Check-up médico obrigatório',
      date: '2024-11-05',
      startTime: '08:00',
      endTime: '17:00',
      type: 'evaluation' as const,
      location: 'Clínica Parceira'
    },
    {
      title: 'Festa de Confraternização',
      description: 'Evento social com alunos e famílias',
      date: '2024-11-15',
      startTime: '16:00',
      endTime: '20:00',
      type: 'special' as const,
      location: 'Salão de Festas'
    }
  ];
  
  specialEvents.forEach((event, index) => {
    events.push({
      id: `special-${index}`,
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      sport: event.sport,
      location: event.location,
      instructor: 'Equipe Técnica'
    });
  });
  
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Helper function to get location based on sport
const getLocationBySport = (sportId: string): string => {
  const locations = {
    'futebol-infantil': 'Campo Principal',
    'futebol-juvenil': 'Campo Principal',
    'futsal': 'Quadra de Futsal',
    'basquete': 'Quadra de Basquete',
    'volei': 'Quadra de Vôlei',
    'natacao': 'Piscina'
  };
  return locations[sportId as keyof typeof locations] || 'Academia Principal';
};

export const mockEvents = generateEvents();