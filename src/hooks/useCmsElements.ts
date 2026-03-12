import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchElements, fetchElement, createElement, updateElement, deleteElement, type Element, type CreateElementPayload } from '@/lib/elementsApi';

export function useCmsElements() {
  return useQuery({
    queryKey: ['cms-elements'],
    queryFn: fetchElements,
  });
}

export function useCmsElement(elementId: string | null) {
  return useQuery({
    queryKey: ['cms-elements', elementId],
    queryFn: () => (elementId ? fetchElement(elementId) : Promise.reject(new Error('No element ID'))),
    enabled: elementId !== null,
  });
}

export function useCreateCmsElement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateElementPayload) => createElement(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cms-elements'] });
    },
  });
}

export function useUpdateCmsElement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ elementId, payload }: { elementId: string; payload: Partial<CreateElementPayload> }) =>
      updateElement(elementId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['cms-elements'] });
      void queryClient.invalidateQueries({ queryKey: ['cms-elements', variables.elementId] });
    },
  });
}

export function useDeleteCmsElement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (elementId: string) => deleteElement(elementId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cms-elements'] });
    },
  });
}

export type { Element, CreateElementPayload };
