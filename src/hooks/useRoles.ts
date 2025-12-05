import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService, RoleDB } from '@/services/roleService';

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getAll
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => roleService.getById(id),
    enabled: !!id
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: Omit<RoleDB, 'id' | 'created_at' | 'updated_at'>) => 
      roleService.create(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoleDB> }) => 
      roleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
};
