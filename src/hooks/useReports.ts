import { useQuery } from '@tanstack/react-query';
import { reportServiceSafe } from '@/services/reportServiceSafe';

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => reportServiceSafe.getDashboardMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Atualiza a cada 10 minutos
    retry: 3, // Retry em caso de erro
    retryDelay: 1000, // 1 segundo entre tentativas
  });
};

export const useStudentsABCCurve = () => {
  return useQuery({
    queryKey: ['students-abc-curve'],
    queryFn: () => reportServiceSafe.getStudentsABCCurve(),
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
    retryDelay: 1000,
  });
};

export const useRecentPayments = () => {
  return useQuery({
    queryKey: ['recent-payments'],
    queryFn: () => reportServiceSafe.getRecentPayments(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: 500,
  });
};

export const useTodayEvents = () => {
  return useQuery({
    queryKey: ['today-events'],
    queryFn: () => reportServiceSafe.getTodayEvents(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
    retry: 2,
    retryDelay: 500,
  });
};

export const useRevenueChart = (months: number = 12) => {
  return useQuery({
    queryKey: ['revenue-chart', months],
    queryFn: () => reportService.getRevenueChart(months),
    staleTime: 60 * 60 * 1000, // 1 hora
  });
};

export const useStudentsByModality = () => {
  return useQuery({
    queryKey: ['students-by-modality'],
    queryFn: () => reportService.getStudentsByModality(),
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
};