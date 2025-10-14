import { useQuery } from '@tanstack/react-query';
import { fetchModules, MODULES_QUERY_KEY, type ModuleRecord } from '@/lib/modules';

export function useModules() {
  return useQuery<ModuleRecord[]>({
    queryKey: MODULES_QUERY_KEY,
    queryFn: fetchModules,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { ModuleRecord } from '@/lib/modules';
