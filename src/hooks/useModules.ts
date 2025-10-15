import { useQuery } from '@tanstack/react-query';
import { fetchModules } from '@/lib/adminApi';
import type { PermissionDefinition } from '@/lib/access-control';

export const SIDEBAR_MODULES_QUERY_KEY = ['modules', 'sidebar'] as const;

export function useSidebarModules(userId?: number | null) {
  const hasValidId = typeof userId === 'number' && Number.isFinite(userId);
  const sanitizedId = hasValidId ? Math.trunc(userId) : undefined;

  return useQuery<PermissionDefinition[]>({
    queryKey: [...SIDEBAR_MODULES_QUERY_KEY, sanitizedId ?? 'anonymous'],
    queryFn: () => fetchModules(sanitizedId),
    enabled: sanitizedId !== undefined,
    staleTime: 5 * 60 * 1000,
  });
}
