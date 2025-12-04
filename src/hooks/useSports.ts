import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sportService } from '@/services/sportService';
import { Sport } from '@/types';

export const useSports = () => {
  return useQuery({
    queryKey: ['sports'],
    queryFn: () => sportService.getAll(),
  });
};

export const useSport = (id: string) => {
  return useQuery({
    queryKey: ['sport', id],
    queryFn: () => sportService.getById(id),
    enabled: !!id,
  });
};

export const useCreateSport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sportData: Omit<Sport, 'id' | 'currentStudents' | 'created_at' | 'updated_at'>) => 
      sportService.create(sportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
};

export const useUpdateSport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sport> }) => 
      sportService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sport', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
};

export const useDeleteSport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sportService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
};