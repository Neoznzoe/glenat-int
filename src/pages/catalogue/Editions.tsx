import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import CatalogueLayout from './CatalogueLayout';
import EditionCard from '@/components/EditionCard';
import { useEffect, useState } from 'react';
import { SecureLink } from '@/components/routing/SecureLink';
import {
  fetchCatalogueEditions,
  type CatalogueEdition,
} from '@/lib/fakeApi/catalogue';

export function Catalogue() {
  const [editions, setEditions] = useState<CatalogueEdition[]>([]);

  useEffect(() => {
    let isActive = true;

    fetchCatalogueEditions()
      .then(data => {
        if (isActive) {
          setEditions(data);
        }
      })
      .catch(error => {
        console.error('Impossible de récupérer les éditions', error);
      });

    return () => {
      isActive = false;
    };
  }, []);

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
            <BreadcrumbPage>Accueil</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
        </CardHeader>
        <div className="px-6">
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout active="Éditions">
            <h3 className="mb-4 font-semibold text-xl">Accueil</h3>
            {editions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chargement des éditions…</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {editions.map(edition => (
                  <EditionCard
                    key={edition.title}
                    title={edition.title}
                    color={edition.color}
                    logo={edition.logo}
                  />
                ))}
              </div>
            )}
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Catalogue;
