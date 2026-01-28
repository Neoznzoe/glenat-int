import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchModules, fetchModule, createModule, updateModule, deleteModule, type Module, type CreateModulePayload } from '@/lib/modulesApi';

export function useCmsModules() {
  return useQuery({
    queryKey: ['cms-modules'],
    queryFn: fetchModules,
  });
}

export function useCmsModule(moduleId: string | null) {
  return useQuery({
    queryKey: ['cms-modules', moduleId],
    queryFn: () => (moduleId ? fetchModule(moduleId) : Promise.reject(new Error('No module ID'))),
    enabled: moduleId !== null,
  });
}

export function useCreateCmsModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateModulePayload) => createModule(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cms-modules'] });
    },
  });
}

export function useUpdateCmsModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, payload }: { moduleId: string; payload: Partial<CreateModulePayload> }) =>
      updateModule(moduleId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['cms-modules'] });
      void queryClient.invalidateQueries({ queryKey: ['cms-modules', variables.moduleId] });
    },
  });
}

export function useDeleteCmsModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => deleteModule(moduleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cms-modules'] });
    },
  });
}

export type { Module, CreateModulePayload };
