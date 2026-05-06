import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CatalogueLayout from './CatalogueLayout';
import { CatalogueSearchInput } from '@/components/CatalogueSearchInput';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureLink } from '@/components/routing/SecureLink';
import { fetchCataloguePublishers } from '@/lib/catalogue';
import { CatalogueCategoryBar, publisherMatchesCategory, type CatalogueCategory } from '@/components/CatalogueCategoryBar';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

export function Catalogue() {
  useScrollRestoration();
  const navigate = useNavigate();
  const [publishers, setPublishers] = useState<string[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<CatalogueCategory>('Toutes');

  useEffect(() => {
    void fetchCataloguePublishers().then(setPublishers);
  }, []);

  const filteredPublishers = useMemo(() => {
    if (!publishers) return null;
    return publishers.filter(pub => publisherMatchesCategory(pub, activeCategory));
  }, [publishers, activeCategory]);

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
            <BreadcrumbPage>Catalogue</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          <CatalogueSearchInput />
        </CardHeader>
        <div className="px-6 space-y-4">
          <CatalogueCategoryBar activeCategory={activeCategory} onCategoryClick={setActiveCategory} />
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout active="Accueil">
            <h3 className="mb-6 font-semibold text-xl">Maisons d'édition</h3>

            {filteredPublishers === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : filteredPublishers.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">Aucun éditeur trouvé.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPublishers.map(publisher => (
                  <Card
                    key={publisher}
                    className="group hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/catalogue/all', { state: { publisher } })}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {publisher}
                      </span>
                    </CardContent>
                  </Card>
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
