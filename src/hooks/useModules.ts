import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchModules } from '@/lib/adminApi';
import type { PermissionDefinition } from '@/lib/access-control';
import { createModuleFingerprint } from '@/lib/moduleFingerprint';

export const SIDEBAR_MODULES_QUERY_KEY = ['modules', 'sidebar'] as const;

interface SidebarModuleQueryPayload {
  fingerprint: string;
  definitions: PermissionDefinition[];
}

export function useSidebarModules(userId?: number | null) {
  const hasValidId = typeof userId === 'number' && Number.isFinite(userId);
  const sanitizedId = hasValidId ? Math.trunc(userId) : undefined;
  const queryClient = useQueryClient();

  return useQuery<SidebarModuleQueryPayload, Error, PermissionDefinition[]>({
    queryKey: [...SIDEBAR_MODULES_QUERY_KEY, sanitizedId ?? 'anonymous'],
    queryFn: async ({ queryKey }) => {
      const definitions = await fetchModules(sanitizedId);
      const fingerprint = createModuleFingerprint(definitions);

      const previous = queryClient.getQueryData<SidebarModuleQueryPayload>(queryKey);
      if (previous && previous.fingerprint === fingerprint) {
        return previous;
      }

      return { fingerprint, definitions };
    },
    select: (payload) => payload.definitions,
    enabled: sanitizedId !== undefined,
    staleTime: 5 * 60 * 1000,
    refetchInterval: sanitizedId !== undefined ? 15_000 : false,
    refetchIntervalInBackground: true,
  });
}
