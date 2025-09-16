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

  const accountId = activeAccount?.homeAccountId ?? null;

  const queryResult = useQuery({
    queryKey: graphProfileQueryKey(accountId),
    queryFn: () => fetchGraphProfile(instance, activeAccount!),
    enabled: isMsalConfigured && Boolean(activeAccount),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const profile = activeAccount ? ((queryResult.data ?? null) as GraphProfile | null) : null;

  return {
    ...queryResult,
    profile,
  };
};
