import { Student } from '@/types';

export const mockStudents: Student[] = [
  {
    id: 'std-001',
    name: 'Gabriel Silva Santos',
    birthDate: '2015-03-15',
    cpf: '123.456.789-01',
    photo: 'https://images.unsplash.com/photo-1609542476847-8d2efbba5b2b?w=150',
    address: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apt 45',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60010-000'
    },
    guardian: {
      name: 'Maria Santos Silva',
      cpf: '987.654.321-00',
      phone: '(85) 99999-1234',
      email: 'maria.santos@email.com',
      profession: 'Enfermeira'
    },
    emergencyContacts: [
      {
        name: 'João Silva Santos',
        relationship: 'Pai',
        phone: '(85) 99999-5678',
        email: 'joao.santos@email.com'
      },
      {
        name: 'Ana Santos',
        relationship: 'Avó',
        phone: '(85) 99999-9012'
      }
    ],
    healthInfo: {
      allergies: 'Nenhuma alergia conhecida',
      medications: 'Não faz uso de medicamentos',
      restrictions: 'Nenhuma restrição',
      doctorContact: 'Dr. Carlos - (85) 3333-4444',
      healthPlan: 'Unimed'
    },
    enrolledSports: ['futebol-infantil'],
    status: 'active',
    enrollmentDate: '2024-01-15',
    monthlyFee: 120.00,
    paymentStatus: 'paid',
    lastPayment: '2024-08-05'
  },
  {
    id: 'std-002',
    name: 'Ana Clara Oliveira',
    birthDate: '2012-07-22',
    cpf: '234.567.890-12',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    address: {
      street: 'Avenida Beira Mar',
      number: '456',
      neighborhood: 'Meireles',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60165-000'
    },
    guardian: {
      name: 'Roberto Oliveira Lima',
      cpf: '876.543.210-98',
      phone: '(85) 98888-1234',
      email: 'roberto.oliveira@email.com',
      profession: 'Engenheiro'
    },
    emergencyContacts: [
      {
        name: 'Carla Oliveira',
        relationship: 'Mãe',
        phone: '(85) 98888-5678',
        email: 'carla.oliveira@email.com'
      }
    ],
    healthInfo: {
      allergies: 'Alergia a camarão',
      medications: 'Antialérgico conforme necessário',
      restrictions: 'Evitar frutos do mar',
      doctorContact: 'Dra. Paula - (85) 3333-5555',
      healthPlan: 'Bradesco Saúde'
    },
    enrolledSports: ['futsal', 'volei'],
    status: 'active',
    enrollmentDate: '2024-02-10',
    monthlyFee: 270.00,
    paymentStatus: 'pending',
    lastPayment: '2024-07-05'
  },
  {
    id: 'std-003',
    name: 'Pedro Henrique Costa',
    birthDate: '2013-11-08',
    cpf: '345.678.901-23',
    photo: 'https://images.unsplash.com/photo-1607406854287-6e3286c9a28a?w=150',
    address: {
      street: 'Rua José Vilar',
      number: '789',
      neighborhood: 'Aldeota',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60150-000'
    },
    guardian: {
      name: 'Fernanda Costa Rocha',
      cpf: '765.432.109-87',
      phone: '(85) 97777-1234',
      email: 'fernanda.costa@email.com',
      profession: 'Advogada'
    },
    emergencyContacts: [
      {
        name: 'Ricardo Costa',
        relationship: 'Pai',
        phone: '(85) 97777-5678'
      }
    ],
    healthInfo: {
      allergies: 'Rinite alérgica',
      medications: 'Bombinha para asma',
      restrictions: 'Ambientes com muito pó',
      doctorContact: 'Dr. Marcos - (85) 3333-6666',
      healthPlan: 'SulAmérica'
    },
    enrolledSports: ['basquete'],
    status: 'active',
    enrollmentDate: '2024-01-20',
    monthlyFee: 160.00,
    paymentStatus: 'overdue',
    lastPayment: '2024-06-15'
  },
  {
    id: 'std-004',
    name: 'Julia Mendes Ferreira',
    birthDate: '2014-05-12',
    cpf: '456.789.012-34',
    photo: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150',
    address: {
      street: 'Rua Monsenhor Tabosa',
      number: '321',
      neighborhood: 'Iracema',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60060-000'
    },
    guardian: {
      name: 'Luciana Mendes Silva',
      cpf: '654.321.098-76',
      phone: '(85) 96666-1234',
      email: 'luciana.mendes@email.com',
      profession: 'Psicóloga'
    },
    emergencyContacts: [
      {
        name: 'Daniel Ferreira',
        relationship: 'Pai',
        phone: '(85) 96666-5678',
        email: 'daniel.ferreira@email.com'
      }
    ],
    healthInfo: {
      allergies: 'Nenhuma',
      medications: 'Vitamina D',
      restrictions: 'Nenhuma',
      doctorContact: 'Dra. Sofia - (85) 3333-7777',
      healthPlan: 'Hapvida'
    },
    enrolledSports: ['natacao'],
    status: 'active',
    enrollmentDate: '2024-03-05',
    monthlyFee: 250.00,
    paymentStatus: 'paid',
    lastPayment: '2024-08-12'
  },
  {
    id: 'std-005',
    name: 'Lucas Rodrigues Alves',
    birthDate: '2011-09-18',
    cpf: '567.890.123-45',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    address: {
      street: 'Avenida Santos Dumont',
      number: '654',
      neighborhood: 'Papicu',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60175-000'
    },
    guardian: {
      name: 'Patricia Rodrigues Lima',
      cpf: '543.210.987-65',
      phone: '(85) 95555-1234',
      email: 'patricia.rodrigues@email.com',
      profession: 'Dentista'
    },
    emergencyContacts: [
      {
        name: 'Eduardo Alves',
        relationship: 'Pai',
        phone: '(85) 95555-5678'
      }
    ],
    healthInfo: {
      allergies: 'Pólen',
      medications: 'Antialérgico na primavera',
      restrictions: 'Treinos ao ar livre em dias de polinização',
      doctorContact: 'Dr. Luis - (85) 3333-8888',
      healthPlan: 'Unimed'
    },
    enrolledSports: ['futebol-juvenil', 'futsal'],
    status: 'active',
    enrollmentDate: '2024-01-08',
    monthlyFee: 320.00,
    paymentStatus: 'paid',
    lastPayment: '2024-08-20'
  },
  {
    id: 'std-006',
    name: 'Marina Silva Cardoso',
    birthDate: '2016-01-10',
    cpf: '678.901.234-56',
    photo: 'https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=150',
    address: {
      street: 'Rua Dragão do Mar',
      number: '234',
      neighborhood: 'Praia de Iracema',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60060-390'
    },
    guardian: {
      name: 'Carlos Cardoso Junior',
      cpf: '111.222.333-44',
      phone: '(85) 94444-1234',
      email: 'carlos.cardoso@email.com',
      profession: 'Professor'
    },
    emergencyContacts: [
      {
        name: 'Ana Silva Cardoso',
        relationship: 'Mãe',
        phone: '(85) 94444-5678'
      }
    ],
    healthInfo: {
      allergies: 'Lactose',
      medications: 'Enzima lactase',
      restrictions: 'Evitar laticínios',
      doctorContact: 'Dr. Roberto - (85) 3333-1111',
      healthPlan: 'Unimed'
    },
    enrolledSports: ['futsal'],
    status: 'active',
    enrollmentDate: '2024-02-18',
    monthlyFee: 140.00,
    paymentStatus: 'paid',
    lastPayment: '2024-08-01'
  },
  {
    id: 'std-007',
    name: 'Rafael Souza Lima',
    birthDate: '2013-04-25',
    cpf: '789.012.345-67',
    photo: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150',
    address: {
      street: 'Avenida Washington Soares',
      number: '567',
      neighborhood: 'Edson Queiroz',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60811-905'
    },
    guardian: {
      name: 'Juliana Lima Santos',
      cpf: '222.333.444-55',
      phone: '(85) 93333-1234',
      email: 'juliana.lima@email.com',
      profession: 'Médica'
    },
    emergencyContacts: [
      {
        name: 'Ricardo Souza',
        relationship: 'Pai',
        phone: '(85) 93333-5678'
      }
    ],
    healthInfo: {
      allergies: 'Nenhuma',
      medications: 'Não faz uso',
      restrictions: 'Nenhuma',
      doctorContact: 'Dra. Fernanda - (85) 3333-2222',
      healthPlan: 'Bradesco'
    },
    enrolledSports: ['basquete', 'natacao'],
    status: 'active',
    enrollmentDate: '2024-01-25',
    monthlyFee: 410.00,
    paymentStatus: 'overdue',
    lastPayment: '2024-06-10'
  },
  {
    id: 'std-008',
    name: 'Isabela Costa Martins',
    birthDate: '2014-12-03',
    cpf: '890.123.456-78',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150',
    address: {
      street: 'Rua Silva Jatahy',
      number: '890',
      neighborhood: 'Meireles',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60165-070'
    },
    guardian: {
      name: 'Fernando Martins Costa',
      cpf: '333.444.555-66',
      phone: '(85) 92222-1234',
      email: 'fernando.martins@email.com',
      profession: 'Arquiteto'
    },
    emergencyContacts: [
      {
        name: 'Camila Costa',
        relationship: 'Mãe',
        phone: '(85) 92222-5678'
      }
    ],
    healthInfo: {
      allergies: 'Amendoim',
      medications: 'EpiPen sempre disponível',
      restrictions: 'Cuidado extremo com amendoim',
      doctorContact: 'Dr. Anderson - (85) 3333-3333',
      healthPlan: 'SulAmérica'
    },
    enrolledSports: ['volei'],
    status: 'active',
    enrollmentDate: '2024-03-12',
    monthlyFee: 130.00,
    paymentStatus: 'pending',
    lastPayment: '2024-07-15'
  },
  {
    id: 'std-009',
    name: 'Mateus Almeida Rocha',
    birthDate: '2015-06-20',
    cpf: '901.234.567-89',
    photo: 'https://images.unsplash.com/photo-1595386770009-36f24b6b8488?w=150',
    address: {
      street: 'Rua Desembargador Moreira',
      number: '123',
      neighborhood: 'Aldeota',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60150-160'
    },
    guardian: {
      name: 'Sandra Rocha Almeida',
      cpf: '444.555.666-77',
      phone: '(85) 91111-1234',
      email: 'sandra.rocha@email.com',
      profession: 'Farmacêutica'
    },
    emergencyContacts: [
      {
        name: 'Paulo Almeida',
        relationship: 'Pai',
        phone: '(85) 91111-5678'
      }
    ],
    healthInfo: {
      allergies: 'Nenhuma',
      medications: 'Vitaminas',
      restrictions: 'Nenhuma',
      doctorContact: 'Dr. Felipe - (85) 3333-4444',
      healthPlan: 'Hapvida'
    },
    enrolledSports: ['futebol-infantil'],
    status: 'active',
    enrollmentDate: '2024-02-28',
    monthlyFee: 120.00,
    paymentStatus: 'paid',
    lastPayment: '2024-08-18'
  },
  {
    id: 'std-010',
    name: 'Sophia Barbosa Nunes',
    birthDate: '2013-08-14',
    cpf: '012.345.678-90',
    photo: 'https://images.unsplash.com/photo-1603775020644-eb8decd79994?w=150',
    address: {
      street: 'Avenida Dom Luis',
      number: '456',
      neighborhood: 'Meireles',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60160-230'
    },
    guardian: {
      name: 'Marcelo Nunes Silva',
      cpf: '555.666.777-88',
      phone: '(85) 90000-1234',
      email: 'marcelo.nunes@email.com',
      profession: 'Empresário'
    },
    emergencyContacts: [
      {
        name: 'Beatriz Barbosa',
        relationship: 'Mãe',
        phone: '(85) 90000-5678'
      }
    ],
    healthInfo: {
      allergies: 'Poeira',
      medications: 'Antialérgico',
      restrictions: 'Ambientes fechados por muito tempo',
      doctorContact: 'Dra. Carla - (85) 3333-5555',
      healthPlan: 'Unimed'
    },
    enrolledSports: ['natacao', 'volei'],
    status: 'active',
    enrollmentDate: '2024-01-30',
    monthlyFee: 380.00,
    paymentStatus: 'paid',
    lastPayment: '2024-08-22'
  }
];