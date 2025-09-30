import { useQuery } from '@tanstack/react-query';
import { fetchAccessiblePages, type PageDefinition } from '@/lib/pageAccessApi';

export const ACCESSIBLE_PAGES_QUERY_KEY = ['access', 'pages'] as const;

export function useAccessiblePages() {
  return useQuery<PageDefinition[]>({
    queryKey: ACCESSIBLE_PAGES_QUERY_KEY,
    queryFn: fetchAccessiblePages,
  });
}

interface PagePermissionResult {
  allowed: boolean;
  loading: boolean;
  fetching: boolean;
  error: unknown;
}

export function usePagePermission(componentKey: string): PagePermissionResult {
  const query = useAccessiblePages();
  const normalizedKey = componentKey.trim().toLowerCase();
  const allowed =
    query.data?.some((page) => {
      const component = page.componentKey.trim().toLowerCase();
      if (component === normalizedKey) {
        return true;
      }
      const nameWithoutExtension = page.name.replace(/\.tsx?$/i, '').toLowerCase();
      return nameWithoutExtension === normalizedKey;
    }) ?? false;

  return {
    allowed,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.isError ? query.error : null,
  };
}

export type { PageDefinition };
