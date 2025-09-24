import type { JobOfferProps } from '@/components/JobOffer';
import { jobOffers } from './mockData';

function cloneJobOffer(offer: JobOfferProps): JobOfferProps {
  return {
    ...offer,
    jobInfo: offer.jobInfo.map((info) => ({ ...info })),
    mission: [...offer.mission],
    profil: [...offer.profil],
    avantages: [...offer.avantages],
  };
}

export async function fetchJobOffers(): Promise<JobOfferProps[]> {
  return Promise.resolve(jobOffers.map(cloneJobOffer));
}

export type { JobOfferProps };
