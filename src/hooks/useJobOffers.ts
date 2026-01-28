import { useQuery } from '@tanstack/react-query';
import { fetchJobOffers, fetchPublishedJobOfferCount, JOB_OFFER_COUNT_QUERY_KEY, JOB_OFFERS_QUERY_KEY, type JobOfferRecord } from '@/lib/jobOffers';

export function useJobOffers() {
  return useQuery<JobOfferRecord[]>({
    queryKey: JOB_OFFERS_QUERY_KEY,
    queryFn: fetchJobOffers,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function usePublishedJobOfferCount() {
  return useQuery<number>({
    queryKey: JOB_OFFER_COUNT_QUERY_KEY,
    queryFn: fetchPublishedJobOfferCount,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { JobOfferRecord } from '@/lib/jobOffers';
