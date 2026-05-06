import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import CatalogueLayout from './CatalogueLayout';
import { Input } from '@/components/ui/input';
import { CatalogueCategoryBar, publisherMatchesCategory, type CatalogueCategory } from '@/components/CatalogueCategoryBar';
import { ChevronRight, ListFilter as ListFilterIcon, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureLink } from '@/components/routing/SecureLink';
import {
  fetchCatalogueNoStockBooks,
  fetchCataloguePublishers,
  type CatalogueBook,
} from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Skeleton } from '@/components/ui/skeleton';

const COMBINING_DIACRITICS = /[̀-ͯ]/g;
const stripAccents = (value: string): string =>
  value.normalize('NFD').replace(COMBINING_DIACRITICS, '');

const abbreviateAuthors = (authors: string | undefined): string => {
  if (!authors) return '';
  return authors
    .split(/[,;&]|\s·\s/)
    .map((a) => a.trim())
    .filter(Boolean)
    .map((a) => {
      const parts = a.split(/\s+/);
      if (parts.length <= 1) return a;
      const firstInitial = parts[0].charAt(0).toUpperCase();
      const rest = parts.slice(1).join(' ');
      return `${firstInitial}. ${rest}`;
    })
    .slice(0, 4)
    .join('/');
};

export function PlusDeStock() {
  useScrollRestoration();
  const navigate = useNavigate();

  const [publishers, setPublishers] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<CatalogueCategory>('Toutes');
  const [allBooks, setAllBooks] = useState<CatalogueBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetchCataloguePublishers().then(setPublishers);
  }, []);

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    fetchCatalogueNoStockBooks({
      signal: abortController.signal,
      onProgress: (books) => {
        if (isActive) setAllBooks(books);
      },
    })
      .then((books) => {
        if (!isActive) return;
        setAllBooks(books);
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

  const togglePublisher = (publisher: string) => {
    setSelectedPublishers((prev) =>
      prev.includes(publisher) ? prev.filter((p) => p !== publisher) : [...prev, publisher],
    );
  };

  const filteredBooks = useMemo(() => {
    const query = stripAccents(search.trim().toLowerCase());
    return allBooks.filter((book) => {
      if (selectedPublishers.length > 0 && !selectedPublishers.includes(book.publisher)) {
        return false;
      }
      if (!publisherMatchesCategory(book.publisher, activeCategory)) {
        return false;
      }
      if (query) {
        const haystack = stripAccents(
          `${book.title ?? ''} ${book.authors ?? ''} ${book.ean ?? ''} ${book.publisher ?? ''}`.toLowerCase(),
        );
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [allBooks, selectedPublishers, activeCategory, search]);

  const renderSkeleton = () => (
    <ul className="divide-y rounded-lg border">
      {Array.from({ length: 10 }, (_, i) => (
        <li key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-14 w-10 rounded shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
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
            <BreadcrumbPage>Plus de stock</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher dans Plus de stock..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <div className="px-6 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <CatalogueCategoryBar activeCategory={activeCategory} onCategoryClick={setActiveCategory} />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <ListFilterIcon className="mr-2 h-4 w-4" />
                  Filtres
                  {selectedPublishers.length > 0 && ` (${selectedPublishers.length})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-4 space-y-2">
                {publishers.map((pub) => (
                  <label key={pub} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedPublishers.includes(pub)}
                      onCheckedChange={() => togglePublisher(pub)}
                    />
                    <span>{pub}</span>
                  </label>
                ))}
              </PopoverContent>
            </Popover>
          </div>
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout active="Plus de stock">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xl">Plus de stock</h3>
                {!loading && !error && (
                  <p className="text-sm text-muted-foreground">
                    {filteredBooks.length} livre{filteredBooks.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {loading && renderSkeleton()}

              {error && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && filteredBooks.length === 0 && (
                <div className="flex items-center justify-center py-32 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">Aucun livre en rupture de stock</p>
                </div>
              )}

              {!loading && filteredBooks.length > 0 && (
                <ul className="divide-y rounded-lg border overflow-hidden">
                  {filteredBooks.map((book) => {
                    const shortAuthors = abbreviateAuthors(book.authors);
                    return (
                      <li key={book.ean}>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/catalogue/book?ean=${encodeURIComponent(book.ean)}`)
                          }
                          className="w-full grid grid-cols-[auto_minmax(0,2fr)_minmax(0,1fr)_auto_auto] items-center gap-4 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                        >
                          {book.cover ? (
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="h-14 w-10 rounded object-cover shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-14 w-10 rounded bg-muted shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{book.title}</div>
                            {shortAuthors && (
                              <div className="text-xs text-muted-foreground truncate">
                                {shortAuthors}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground truncate hidden md:block">
                            {book.publisher}
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                            {book.publicationDate}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlusDeStock;
