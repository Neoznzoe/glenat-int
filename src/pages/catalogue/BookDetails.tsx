import { useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { SecureLink } from '@/components/routing/SecureLink';
import { CatalogueUnavailableSection } from './CatalogueUnavailable';
import { useDecryptedLocation } from '@/lib/secureRouting';

export function BookDetails() {
  const location = useDecryptedLocation();
  const ean = useMemo(() => {
    const search = location.search || '';
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    return params.get('ean');
  }, [location.search]);

  const description = ean ? (
    <span>
      La fiche catalogue pour l&apos;EAN{' '}
      <span className="font-medium text-foreground">{ean}</span> est indisponible pour le moment.
    </span>
  ) : (
    'Les fiches catalogue sont indisponibles pour le moment.'
  );

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <SecureLink to="/">Accueil</SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <SecureLink to="/catalogue">Catalogue</SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{ean ? `EAN ${ean}` : 'Fiche livre'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CatalogueUnavailableSection
        active="Tout le catalogue"
        title="Fiche livre"
        description={description}
      >
        <Button asChild>
          <SecureLink to="/catalogue/all">Retourner au catalogue</SecureLink>
        </Button>
      </CatalogueUnavailableSection>
    </div>
  );
}

export default BookDetails;
