import { useEffect, useState } from 'react';
import JobOffer, { type JobOfferProps } from '@/components/JobOffer';
import { fetchJobOffers } from '@/api/jobs';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
export function Emploi() {
  const [offers, setOffers] = useState<JobOfferProps[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetchJobOffers()
      .then((data) => {
        if (isMounted) {
          setOffers(data);
        }
      })
      .catch((error) => {
        console.error('Impossible de récupérer les offres', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Emploi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {offers.map((offer, index) => (
        <JobOffer key={index} {...offer} />
      ))}
    </div>
  );
}

export default Emploi;
