import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBlocks, fetchBlock, createBlock, updateBlock, deleteBlock, type Block, type CreateBlockPayload } from '@/lib/blocksApi';

export function useCmsBlocks() {
  return useQuery({
    queryKey: ['cms-blocks'],
    queryFn: fetchBlocks,
  });
}

export function useCmsBlock(blockId: string | null) {
  return useQuery({
    queryKey: ['cms-blocks', blockId],
    queryFn: () => (blockId ? fetchBlock(blockId) : Promise.reject(new Error('No block ID'))),
    enabled: blockId !== null,
  });
}

export function useCreateCmsBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBlockPayload) => createBlock(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cms-blocks'] });
    },
  });
}

export function useUpdateCmsBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ blockId, payload }: { blockId: string; payload: Partial<CreateBlockPayload> }) =>
      updateBlock(blockId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['cms-blocks'] });
      void queryClient.invalidateQueries({ queryKey: ['cms-blocks', variables.blockId] });
    },
  });
}

export function useDeleteCmsBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockId: string) => deleteBlock(blockId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cms-blocks'] });
    },
  });
}

export type { Block, CreateBlockPayload };
