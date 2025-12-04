import { Sport } from '@/types';

export const mockSports: Sport[] = [
  {
    id: '1',
    name: 'Infantil (03 à 05 anos)',
    description: 'Aulas de futebol para crianças de 3 a 5 anos - Iniciação esportiva',
    ageRange: { min: 3, max: 5 },
    monthlyFee: 120.00,
    weeklyHours: 2,
    maxStudents: 12,
    currentStudents: 8,
    status: 'active',
    instructor: 'Professora Ana',
    schedule: [
      { day: 'tuesday', startTime: '08:00', endTime: '09:00' },
      { day: 'thursday', startTime: '08:00', endTime: '09:00' }
    ]
  },
  {
    id: '2',
    name: 'Infantil 2 (06 à 09 anos)',
    description: 'Aulas de futebol para crianças de 6 a 9 anos - Desenvolvimento motor',
    ageRange: { min: 6, max: 9 },
    monthlyFee: 150.00,
    weeklyHours: 4,
    maxStudents: 16,
    currentStudents: 12,
    status: 'active',
    instructor: 'Professor Carlos',
    schedule: [
      { day: 'tuesday', startTime: '14:00', endTime: '15:30' },
      { day: 'thursday', startTime: '14:00', endTime: '15:30' }
    ]
  },
  {
    id: '3',
    name: 'Infantil 3 (10 à 12 anos)',
    description: 'Aulas de futebol para crianças de 10 a 12 anos - Técnica e tática básica',
    ageRange: { min: 10, max: 12 },
    monthlyFee: 170.00,
    weeklyHours: 4,
    maxStudents: 18,
    currentStudents: 15,
    status: 'active',
    instructor: 'Professor Carlos',
    schedule: [
      { day: 'monday', startTime: '15:00', endTime: '16:30' },
      { day: 'wednesday', startTime: '15:00', endTime: '16:30' }
    ]
  },
  {
    id: '4',
    name: 'Infanto Juvenil (13 à 16 anos)',
    description: 'Aulas de futebol para adolescentes de 13 a 16 anos - Aperfeiçoamento técnico',
    ageRange: { min: 13, max: 16 },
    monthlyFee: 200.00,
    weeklyHours: 6,
    maxStudents: 20,
    currentStudents: 16,
    status: 'active',
    instructor: 'Professor Beto',
    schedule: [
      { day: 'monday', startTime: '17:00', endTime: '18:30' },
      { day: 'wednesday', startTime: '17:00', endTime: '18:30' },
      { day: 'friday', startTime: '17:00', endTime: '18:30' }
    ]
  },
  {
    id: '5',
    name: 'Juvenil (17 à 20 anos)',
    description: 'Aulas de futebol para jovens de 17 a 20 anos - Alto rendimento',
    ageRange: { min: 17, max: 20 },
    monthlyFee: 250.00,
    weeklyHours: 8,
    maxStudents: 22,
    currentStudents: 18,
    status: 'active',
    instructor: 'Professor Beto',
    schedule: [
      { day: 'tuesday', startTime: '18:30', endTime: '20:00' },
      { day: 'thursday', startTime: '18:30', endTime: '20:00' },
      { day: 'saturday', startTime: '08:00', endTime: '10:00' }
    ]
  },
  {
    id: '6',
    name: 'Aula Inaugural',
    description: 'Aula experimental gratuita para novos alunos conhecerem a metodologia',
    ageRange: { min: 3, max: 20 },
    monthlyFee: 0.00,
    weeklyHours: 1,
    maxStudents: 50,
    currentStudents: 0,
    status: 'active',
    instructor: 'Todos os professores',
    schedule: [
      { day: 'saturday', startTime: '10:00', endTime: '11:00' }
    ]
  }
];