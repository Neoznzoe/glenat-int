import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPages,
  fetchPage,
  createPage,
  updatePage,
  deletePage,
  type Page,
  type CreatePagePayload,
} from '@/lib/pagesApi';

export function useCmsPages() {
  return useQuery({
    queryKey: ['cms-pages'],
    queryFn: fetchPages,
  });
}

export function useCmsPage(pageId: string | null) {
  return useQuery({
    queryKey: ['cms-pages', pageId],
    queryFn: () => (pageId ? fetchPage(pageId) : Promise.reject(new Error('No page ID'))),
    enabled: pageId !== null,
  });
}

export function useCreateCmsPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePagePayload) => createPage(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
  });
}

export function useUpdateCmsPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, payload }: { pageId: string; payload: Partial<CreatePagePayload> }) =>
      updatePage(pageId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      void queryClient.invalidateQueries({ queryKey: ['cms-pages', variables.pageId] });
    },
  });
}

export function useDeleteCmsPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => deletePage(pageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
  });
}

export type { Page, CreatePagePayload };
