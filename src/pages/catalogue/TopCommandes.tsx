import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import CatalogueLayout from './CatalogueLayout';
import BookCard from '@/components/BookCard';
import { useEffect, useMemo, useState } from 'react';
import { SecureLink } from '@/components/routing/SecureLink';
import { fetchCatalogueTopOrders, type CatalogueBook } from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Skeleton } from '@/components/ui/skeleton';

const COMBINING_DIACRITICS = /[̀-ͯ]/g;
const stripAccents = (value: string): string =>
  value.normalize('NFD').replace(COMBINING_DIACRITICS, '');

export function TopCommandes() {
  useScrollRestoration();

  const [books, setBooks] = useState<CatalogueBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    fetchCatalogueTopOrders({
      signal: abortController.signal,
      onProgress: (next) => {
        if (isActive) setBooks(next);
      },
    })
      .then((result) => {
        if (!isActive) return;
        setBooks(result);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, []);

  const filteredBooks = useMemo(() => {
    const query = stripAccents(search.trim().toLowerCase());
    if (!query) return books;
    return books.filter((book) => {
      const haystack = stripAccents(
        `${book.title ?? ''} ${book.authors ?? ''} ${book.ean ?? ''} ${book.publisher ?? ''}`.toLowerCase(),
      );
      return haystack.includes(query);
    });
  }, [books, search]);

  const renderSkeleton = () => (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
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
            <BreadcrumbPage>Top des commandes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          <Input
            type="search"
            placeholder="Rechercher dans le top..."
            className="sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>
        <div className="px-6">
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout active="Top des commandes">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-xl">Top des commandes</h3>
                    <p className="text-xs text-muted-foreground">
                      Les 30 livres les plus commandés
                    </p>
                  </div>
                </div>
                {!loading && !error && books.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {filteredBooks.length} sur {books.length}
                  </p>
                )}
              </div>

              {loading && renderSkeleton()}

              {error && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && books.length === 0 && (
                <div className="flex items-center justify-center py-32 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">Aucune commande pour le moment.</p>
                </div>
              )}

              {!loading && filteredBooks.length === 0 && books.length > 0 && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <p>Aucun livre ne correspond à votre recherche.</p>
                </div>
              )}

              {filteredBooks.length > 0 && (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.ean} {...book} />
                  ))}
                </div>
              )}
            </div>
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default TopCommandes;
