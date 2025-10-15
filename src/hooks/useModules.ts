import { useQuery } from '@tanstack/react-query';
import { fetchModules } from '@/lib/adminApi';
import type { PermissionDefinition } from '@/lib/access-control';

export const SIDEBAR_MODULES_QUERY_KEY = ['modules', 'sidebar'] as const;

export function useSidebarModules() {
  return useQuery<PermissionDefinition[]>({
    queryKey: SIDEBAR_MODULES_QUERY_KEY,
    queryFn: fetchModules,
    staleTime: 5 * 60 * 1000,
  });
}
