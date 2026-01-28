import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import CatalogueLayout from './CatalogueLayout';
import EditionCard from '@/components/EditionCard';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SecureLink } from '@/components/routing/SecureLink';
import { fetchCatalogueEditions, type CatalogueEdition } from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { useModulePermissionsContext } from '@/context/ModulePermissionsContext';

/**
 * Priority order for catalogue pages redirection
 * The first accessible page will be used
 */
const CATALOGUE_PAGES_PRIORITY = [
  '/catalogue/offices',
  '/catalogue/nouveautes',
  '/catalogue/all',
  '/catalogue/couverture-a-paraitre',
];

export function Catalogue() {
  useScrollRestoration();
  const [editions, setEditions] = useState<CatalogueEdition[] | null>(null);
  const { canAccessRoute, isLoading } = useModulePermissionsContext();

  useEffect(() => {
    let isActive = true;

    fetchCatalogueEditions()
      .then(data => {
        if (isActive) {
          setEditions(data);
        }
      })
      .catch(() => {
        // Silently ignore editions fetch errors
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Wait for permissions to load before deciding where to redirect
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
        />
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  // Find the first accessible page from the priority list
  const firstAccessiblePage = CATALOGUE_PAGES_PRIORITY.find(page => canAccessRoute(page));

  // Redirect to the first accessible page if found
  if (firstAccessiblePage) {
    return <Navigate to={firstAccessiblePage} replace />;
  }

  // If no pages are accessible, show the default catalogue page (editions)
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
            {editions && (
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
