import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService, getProvisionalStudentByGuardianEmail, getInauguralClassByStudentId } from '@/services/studentService';
import { Student } from '@/types';

export const useStudents = (filters?: { status?: string; sport?: string }) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentService.getAll(filters),
  });
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getById(id),
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => 
      studentService.create(studentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) => 
      studentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => studentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

// Hooks otimizados seguindo as instruções da História 2.2

// Hook para buscar o aluno provisório usando a nova função otimizada
export const useProvisionalStudentByGuardianEmail = (email: string) => {
  return useQuery({
    queryKey: ['provisionalStudent', email],
    queryFn: () => getProvisionalStudentByGuardianEmail(email),
    enabled: !!email, // A consulta só será executada se o email estiver disponível
  });
};

// Hook para buscar a aula inaugural usando a nova função otimizada
export const useInauguralClassByStudentId = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['inauguralClass', studentId],
    queryFn: () => getInauguralClassByStudentId(studentId!),
    enabled: !!studentId, // A consulta só será executada se o studentId estiver disponível
  });
};

// Hook para buscar aluno efetivado pelo e-mail do responsável
export const useEffectiveStudentByGuardianEmail = (email: string) => {
  return useQuery({
    queryKey: ['effectiveStudent', email],
    queryFn: () => studentService.getEffectiveByGuardianEmail(email),
    enabled: !!email,
  });
};

// Hook para buscar pagamentos do aluno
export const useStudentPayments = (studentId: string) => {
  return useQuery({
    queryKey: ['studentPayments', studentId],
    queryFn: () => studentService.getPayments(studentId),
    enabled: !!studentId,
  });
};

// Hook para buscar eventos/aulas do aluno
export const useStudentEvents = (studentId: string) => {
  return useQuery({
    queryKey: ['studentEvents', studentId],
    queryFn: () => studentService.getEvents(studentId),
    enabled: !!studentId,
  });
};