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
    // [PERF] Réduire la fréquence de refetch de 15s à 60s pour limiter la charge API
    refetchInterval: sanitizedId !== undefined ? 60_000 : false,
    // [PERF] Désactiver le refetch en arrière-plan pour économiser les ressources
    refetchIntervalInBackground: false,
  });
}
