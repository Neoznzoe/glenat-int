import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export interface ModuleDto {
  id: number;
  name: string;
  path: string;
  icon?: string | null;
  order?: number | null;
  section?: string | null;
}

interface UseSidebarModulesResult {
  modules: ModuleDto[];
  isLoading: boolean;
  error?: Error;
  refetch: () => Promise<void>;
}

/**
 * Fetches the modules visible to the current user. The server already applies all permission checks.
 */
export function useSidebarModules(): UseSidebarModulesResult {
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const loadModules = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const data = await apiFetch<ModuleDto[]>('/api/me/sidebar-modules', { signal });
        setModules(data);
        setError(undefined);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadModules(controller.signal);
    return () => controller.abort();
  }, [loadModules]);

  const refetch = useCallback(async () => {
    const controller = new AbortController();
    await loadModules(controller.signal);
  }, [loadModules]);

  return {
    modules,
    isLoading,
    error,
    refetch,
  };
}
