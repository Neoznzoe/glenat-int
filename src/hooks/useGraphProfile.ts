import { useQuery } from '@tanstack/react-query';
import { useMsal } from '@azure/msal-react';

import { fetchGraphProfile, type GraphProfile } from '@/lib/graph';
import { isMsalConfigured } from '@/lib/msal';

const graphProfileQueryKey = (accountId?: string | null) => [
  'microsoft-graph',
  'me',
  accountId ?? 'anonymous',
];

export const useGraphProfile = () => {
  const { instance, accounts } = useMsal();
  const activeAccount = instance.getActiveAccount() ?? accounts[0] ?? null;

  const queryResult = useQuery({
    queryKey: graphProfileQueryKey(activeAccount?.homeAccountId ?? null),
    queryFn: () => fetchGraphProfile(instance, activeAccount!),
    enabled: isMsalConfigured && Boolean(activeAccount),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  return {
    ...queryResult,
    profile: (queryResult.data ?? null) as GraphProfile | null,
  };
};
