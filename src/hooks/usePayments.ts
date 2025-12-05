import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService, PaymentDB } from '@/services/paymentService';

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: paymentService.getAll
  });
};

export const usePaymentsByMonth = (month: string) => {
  return useQuery({
    queryKey: ['payments', 'month', month],
    queryFn: () => paymentService.getByMonth(month),
    enabled: !!month
  });
};

export const usePaymentsByStudent = (studentId: string) => {
  return useQuery({
    queryKey: ['payments', 'student', studentId],
    queryFn: () => paymentService.getByStudentId(studentId),
    enabled: !!studentId
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentService.getById(id),
    enabled: !!id
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payment: Omit<PaymentDB, 'id' | 'created_at' | 'updated_at'>) => 
      paymentService.create(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentDB> }) => 
      paymentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });
};

export const useMarkPaymentAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentService.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });
};

export const useGenerateMonthlyPayments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (month: string) => paymentService.generateMonthlyPayments(month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });
};
