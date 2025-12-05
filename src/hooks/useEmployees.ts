import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService, EmployeeDB } from '@/services/employeeService';

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeeService.getById(id),
    enabled: !!id
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: Omit<EmployeeDB, 'id' | 'created_at' | 'updated_at'>) => 
      employeeService.create(employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeDB> }) => 
      employeeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};
