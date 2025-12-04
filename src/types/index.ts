// AcademyManager Type Definitions

export interface Student {
  id: string;
  name: string;
  birthDate: string;
  cpf: string;
  photo: string | null;
  address: any;
  guardian: any;
  emergencyContacts: any[];
  healthInfo: any;
  enrolledSports: string[];
  status: 'active' | 'inactive' | 'pending' | 'provisional' | 'effective';
  enrollmentDate: string;
  monthlyFee: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  lastPayment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  nickname: string;
  identity: string;
  cpf: string;
  education: string;
  specialization: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive';
  hireDate: string;
  salary: number;
  createdAt: string;
  updated_at: string;
  modalitiesIds?: string[];
}

export interface Employee {
  id: string;
  fullName: string;
  roleId: string;
  login: string;
  password: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  sport: string;
  month: string; // YYYY-MM
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: 'training' | 'match' | 'evaluation' | 'meeting' | 'special' | 'inaugural';
  sport_id?: string;
  students?: string[]; // IDs dos alunos
  location: string;
  instructor_id?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: string[]; // Para eventos semanais
  created_at: string;
  updated_at: string;
}

// Interface para o formato de evento que interage com o Supabase
export interface EventDB {
  id?: string; // uuid
  title: string;
  description?: string | null;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  event_type?: string; // e.g., 'training', 'match', 'inaugural'
  modality_id?: string; // uuid
  students?: string[]; // Array de uuids
  location: string;
  teacher_id?: string; // uuid
  frequency?: string; // e.g., 'daily', 'weekly', 'monthly'
  days_of_week?: string[]; // Array de strings (dias da semana)
  created_at?: string;
  updated_at?: string;
}

export interface Sport {
  id: string;
  name: string;
  description: string;
  ageRange: {
    min: number;
    max: number;
  };
  monthlyFee: number;
  weeklyHours: number;
  maxStudents: number;
  currentStudents: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  schedule: Array<{
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string;
    endTime: string;
  }>;
}

export interface InauguralClass {
  id: string;
  student_id: string;
  selected_date: string;
  selected_modality_id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  monthlyRevenue: number;
  defaultRate: number;
  upcomingEvents: number;
  churnRate: number;
  totalTeachers: number;
  totalEmployees: number;
}

export interface PaymentFilters {
  status: 'all' | 'paid' | 'pending' | 'overdue';
  month: string;
  sport: string;
}

export interface StudentFilters {
  search: string;
  sport: string;
  status: string;
  paymentStatus: string;
}

export interface FinancialReport {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  studentCount: number;
  churnRate: number;
  defaultRate: number;
}