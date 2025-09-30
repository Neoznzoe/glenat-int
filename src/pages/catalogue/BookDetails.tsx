import { useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SecureLink } from '@/components/routing/SecureLink';
import { useDecryptedLocation } from '@/lib/secureRouting';

export function BookDetails() {
  const location = useDecryptedLocation();
  const ean = useMemo(() => {
    const search = location.search || '';
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    return params.get('ean');
  }, [location.search]);

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
            <BreadcrumbPage>Fiche titre</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-[2.5rem]">Fiche titre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Fiche détaillée en cours de préparation</h2>
          <p className="text-muted-foreground">
            {ean
              ? `Les informations détaillées pour l’EAN ${ean} seront bientôt disponibles.`
              : 'Les informations détaillées seront bientôt disponibles.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild>
              <SecureLink to="/catalogue/offices">Consulter les prochaines offices</SecureLink>
            </Button>
            <Button asChild variant="outline">
              <SecureLink to="/catalogue">Retour au catalogue</SecureLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BookDetails;
