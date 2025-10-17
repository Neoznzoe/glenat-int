import { useQuery } from '@tanstack/react-query';
import { fetchModules } from '@/lib/adminApi';
import type { PermissionDefinition } from '@/lib/access-control';

export const SIDEBAR_MODULES_QUERY_KEY = ['modules', 'sidebar'] as const;

const MODULES_REFRESH_INTERVAL_MS = 30_000;
const MODULES_STALE_TIME_MS = 15_000;

export function useSidebarModules(userId?: number | null) {
  const hasValidId = typeof userId === 'number' && Number.isFinite(userId);
  const sanitizedId = hasValidId ? Math.trunc(userId) : undefined;

  return useQuery<PermissionDefinition[]>({
    queryKey: [...SIDEBAR_MODULES_QUERY_KEY, sanitizedId ?? 'anonymous'],
    queryFn: () => fetchModules(sanitizedId),
    enabled: sanitizedId !== undefined,
    staleTime: sanitizedId !== undefined ? MODULES_STALE_TIME_MS : 0,
    refetchInterval: sanitizedId !== undefined ? MODULES_REFRESH_INTERVAL_MS : false,
    refetchOnMount: 'always',
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
    placeholderData: (previousData: PermissionDefinition[] | undefined) => previousData,
  });
}
