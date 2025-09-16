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
  const enabled = isMsalConfigured && Boolean(activeAccount);

  const queryResult = useQuery<GraphProfile>({
    queryKey: graphProfileQueryKey(accountId),
    queryFn: () => {
      if (!activeAccount) {
        throw new Error('No active Microsoft 365 account available.');
      }

      return fetchGraphProfile(instance, activeAccount);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const profile = enabled ? ((queryResult.data ?? null) as GraphProfile | null) : null;

  return {
    ...queryResult,
    profile,
  };
};
