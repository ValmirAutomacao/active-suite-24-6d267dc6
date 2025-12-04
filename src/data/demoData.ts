// Sistema de dados de demonstração para apresentação ao cliente
// Estes dados serão exibidos quando o sistema estiver em modo demo

import { Payment, Student } from '@/types';
import { mockPayments } from './mockPayments';
import { mockStudents } from './mockStudents';

export const isDemoMode = () => {
  // Verificar se está em modo demo baseado em variável de ambiente ou configuração
  return import.meta.env.VITE_DEMO_MODE === 'true' ||
         window.location.hostname === 'localhost' ||
         window.location.hostname.includes('vercel.app');
};

// Dados de demonstração que serão sempre exibidos no Financial
export const getDemoFinancialData = (): Payment[] => {
  if (!isDemoMode()) return [];

  // Retornar dados mockados para demonstração
  return mockPayments;
};

// Dados de demonstração para gráficos
export const getDemoChartData = () => {
  if (!isDemoMode()) return null;

  return {
    monthlyRevenue: [
      { month: 'Jan', revenue: 12500, students: 85 },
      { month: 'Fev', revenue: 13200, students: 88 },
      { month: 'Mar', revenue: 14100, students: 92 },
      { month: 'Abr', revenue: 13800, students: 89 },
      { month: 'Mai', revenue: 15200, students: 95 },
      { month: 'Jun', revenue: 16100, students: 98 },
      { month: 'Jul', revenue: 17500, students: 102 },
      { month: 'Ago', revenue: 18200, students: 105 }
    ],
    paymentStatus: [
      { status: 'Em dia', value: 78, color: '#22c55e' },
      { status: 'Atrasado', value: 15, color: '#ef4444' },
      { status: 'Pendente', value: 12, color: '#f59e0b' }
    ],
    modalityDistribution: [
      { name: 'Futebol', students: 45, percentage: 43 },
      { name: 'Natação', students: 28, percentage: 27 },
      { name: 'Basquete', students: 18, percentage: 17 },
      { name: 'Voleibol', students: 14, percentage: 13 }
    ]
  };
};

// Dados de demonstração para estudantes
export const getDemoStudents = (): Student[] => {
  if (!isDemoMode()) return [];

  return mockStudents;
};

// Função para mesclar dados reais com dados demo
export const mergeWithDemoData = <T>(realData: T[], demoData: T[]): T[] => {
  if (!isDemoMode()) return realData;

  // Se não há dados reais, retornar dados demo
  if (!realData || realData.length === 0) {
    return demoData;
  }

  // Se há dados reais, mesclar com alguns dados demo para demonstração
  return [...realData, ...demoData.slice(0, Math.max(0, 10 - realData.length))];
};

// Configurações específicas para demo
export const getDemoConfig = () => ({
  showDemoMessage: isDemoMode(),
  demoMessage: "💡 Os dados exibidos incluem informações de demonstração para apresentação.",
  allowDemoInteractions: true,
  hideRealDataMessages: isDemoMode()
});

export default {
  isDemoMode,
  getDemoFinancialData,
  getDemoChartData,
  getDemoStudents,
  mergeWithDemoData,
  getDemoConfig
};