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
import { Button } from '@/components/ui/button';
import CatalogueLayout from './CatalogueLayout';
import BookFilters from '@/components/BookFilters';
import BookCard from '@/components/BookCard';
import { CataloguePagination } from '@/components/CataloguePagination';
import { CatalogueSearchInput } from '@/components/CatalogueSearchInput';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SecureLink } from '@/components/routing/SecureLink';
import { fetchCatalogueBooksWithPagination, type CatalogueBooksPage } from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Loader2 } from 'lucide-react';

// Générer ou récupérer la seed de session pour l'ordre aléatoire
const getSessionSeed = (): string => {
  const SEED_KEY = 'catalogue_random_seed';
  let seed = sessionStorage.getItem(SEED_KEY);
  if (!seed) {
    seed = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(SEED_KEY, seed);
  }
  return seed;
};

export function CatalogueAll() {
  useScrollRestoration();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = [
    'Toutes',
    'BD',
    'Manga',
    'Jeunesse',
    'Découverte',
    'Livres',
    'Voyage',
    'Montagne',
  ];

  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [cataloguePage, setCataloguePage] = useState<CatalogueBooksPage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer le numéro de page depuis l'URL ou utiliser 1 par défaut
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const sessionSeed = getSessionSeed();

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    const loadBooks = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCatalogueBooksWithPagination(currentPage, 50, {
          seed: sessionSeed,
          signal: abortController.signal,
          onProgress: (updatedPage) => {
            if (isActive) {
              setCataloguePage(updatedPage);
            }
          },
        });
        if (isActive) {
          setCataloguePage(data);
          setIsLoading(false);
        }
      } catch (error) {
        // Ignorer les erreurs d'annulation
        if (error instanceof Error && error.name === 'AbortError') {
          console.debug('[CatalogueAll] Chargement annulé');
          return;
        }
        console.error('Impossible de récupérer le catalogue', error);
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadBooks();

    return () => {
      isActive = false;
      // Annuler toutes les requêtes en cours
      abortController.abort();
    };
  }, [currentPage, sessionSeed]);

  const handlePageChange = (page: number) => {
    // Scroller l'élément main AVANT de changer la page
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'auto' });
    }
    // Mettre à jour l'URL avec le nouveau numéro de page
    setSearchParams({ page: page.toString() });
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
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
            <BreadcrumbPage>Tout le catalogue</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          <CatalogueSearchInput />
        </CardHeader>
        <div className="px-6 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            {filters.map(filter => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="whitespace-nowrap"
              >
                {filter}
              </Button>
            ))}
            <BookFilters />
          </div>
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout active="Tout le catalogue">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xl">Tout le catalogue</h3>
                {cataloguePage && (
                  <p className="text-sm text-muted-foreground">
                    {cataloguePage.totalBooks} livres au total
                  </p>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="sr-only">Chargement du catalogue...</span>
                </div>
              ) : cataloguePage && cataloguePage.books.length > 0 ? (
                <>
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                    {cataloguePage.books.map(book => (
                      <BookCard key={book.ean} {...book} />
                    ))}
                  </div>

                  <CataloguePagination
                    currentPage={cataloguePage.currentPage}
                    totalPages={cataloguePage.totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center py-32 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">Aucun livre trouvé</p>
                </div>
              )}
            </div>
          </CatalogueLayout>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default CatalogueAll;
