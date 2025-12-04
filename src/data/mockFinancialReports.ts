import { FinancialReport } from '../types';

export const mockFinancialReports: FinancialReport[] = [
  {
    period: '2024-01',
    revenue: 45680.00,
    expenses: 28450.00,
    profit: 17230.00,
    studentCount: 285,
    churnRate: 3.2,
    defaultRate: 8.5
  },
  {
    period: '2024-02',
    revenue: 48920.00,
    expenses: 29150.00,
    profit: 19770.00,
    studentCount: 298,
    churnRate: 2.8,
    defaultRate: 7.2
  },
  {
    period: '2024-03',
    revenue: 52340.00,
    expenses: 31200.00,
    profit: 21140.00,
    studentCount: 312,
    churnRate: 2.1,
    defaultRate: 6.8
  },
  {
    period: '2024-04',
    revenue: 49680.00,
    expenses: 29800.00,
    profit: 19880.00,
    studentCount: 305,
    churnRate: 4.5,
    defaultRate: 9.1
  },
  {
    period: '2024-05',
    revenue: 53750.00,
    expenses: 32100.00,
    profit: 21650.00,
    studentCount: 320,
    churnRate: 1.9,
    defaultRate: 5.4
  },
  {
    period: '2024-06',
    revenue: 55200.00,
    expenses: 33450.00,
    profit: 21750.00,
    studentCount: 328,
    churnRate: 2.3,
    defaultRate: 6.2
  },
  {
    period: '2024-07',
    revenue: 57840.00,
    expenses: 34200.00,
    profit: 23640.00,
    studentCount: 335,
    churnRate: 1.7,
    defaultRate: 4.9
  },
  {
    period: '2024-08',
    revenue: 56920.00,
    expenses: 33800.00,
    profit: 23120.00,
    studentCount: 342,
    churnRate: 2.8,
    defaultRate: 7.3
  },
  {
    period: '2024-09',
    revenue: 58750.00,
    expenses: 35100.00,
    profit: 23650.00,
    studentCount: 348,
    churnRate: 1.5,
    defaultRate: 5.1
  }
];

export const mockABCData = [
  { category: 'A', description: 'Alunos Mensalidades em Dia', count: 248, percentage: 71.3, revenue: 41875.00 },
  { category: 'B', description: 'Alunos com Atraso até 15 dias', count: 68, percentage: 19.5, revenue: 11475.00 },
  { category: 'C', description: 'Alunos Inadimplentes', count: 32, percentage: 9.2, revenue: 5400.00 }
];