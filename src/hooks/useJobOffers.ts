import { useQuery } from '@tanstack/react-query';
import { fetchJobOffers, JOB_OFFERS_QUERY_KEY, type JobOfferRecord } from '@/lib/jobOffers';

export function useJobOffers() {
  return useQuery<JobOfferRecord[]>({
    queryKey: JOB_OFFERS_QUERY_KEY,
    queryFn: fetchJobOffers,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { JobOfferRecord } from '@/lib/jobOffers';
