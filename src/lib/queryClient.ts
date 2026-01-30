import { QueryClient } from '@tanstack/react-query';

// [PERF] client-swr-dedup: Configuration optimale du QueryClient pour améliorer le caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Durée pendant laquelle les données sont considérées fraîches (5 min)
      staleTime: 5 * 60 * 1000,
      // Durée de conservation en cache après unmount (10 min)
      gcTime: 10 * 60 * 1000,
      // Limiter les retries pour éviter les requêtes inutiles
      retry: 1,
      // Refetch automatique quand l'onglet redevient actif
      refetchOnWindowFocus: true,
      // Ne pas refetch sur mount si les données sont fraîches
      refetchOnMount: false,
    },
    mutations: {
      // Limiter les retries pour les mutations
      retry: 1,
    },
  },
});
