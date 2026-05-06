import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import CatalogueLayout from './CatalogueLayout';
import BookCard from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ListFilter as ListFilterIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SecureLink } from '@/components/routing/SecureLink';
import { fetchCatalogueReleases, fetchCatalogueCover, fetchCataloguePublishers, type CatalogueBook } from '@/lib/catalogue';
import { CatalogueCategoryBar, publisherMatchesCategory, type CatalogueCategory } from '@/components/CatalogueCategoryBar';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Skeleton } from '@/components/ui/skeleton';

const SESSION_KEY = 'nouveautes-shuffle-order';

function shuffle<T extends { ean: string }>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function applySessionOrder(books: CatalogueBook[]): CatalogueBook[] {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return shuffleAndPersist(books);

  try {
    const order: string[] = JSON.parse(raw);
    const byEan = new Map(books.map(b => [b.ean, b]));

    // Reorder books according to saved order, append any new ones at the end
    const ordered: CatalogueBook[] = [];
    for (const ean of order) {
      const book = byEan.get(ean);
      if (book) {
        ordered.push(book);
        byEan.delete(ean);
      }
    }
    // Append books not in the saved order (new books since last visit)
    for (const book of byEan.values()) {
      ordered.push(book);
    }

    return ordered;
  } catch {
    return shuffleAndPersist(books);
  }
}

function shuffleAndPersist(books: CatalogueBook[]): CatalogueBook[] {
  const shuffled = shuffle(books);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(shuffled.map(b => b.ean)));
  return shuffled;
}

export function Nouveautes() {
  useScrollRestoration();

  const [publishers, setPublishers] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<CatalogueCategory>('Toutes');
  const [allBooks, setAllBooks] = useState<CatalogueBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const coverAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void fetchCataloguePublishers().then(setPublishers);
  }, []);

  useEffect(() => {
    let isActive = true;

    fetchCatalogueReleases({ hydrateCovers: false })
      .then(groups => {
        if (!isActive) return;

        const books = groups.flatMap(g => g.books);
        const ordered = applySessionOrder(books);
        setAllBooks(ordered);
        setLoading(false);

        // Load covers in display order
        const abort = new AbortController();
        coverAbortRef.current = abort;
        void hydrateCoversInOrder(ordered, abort.signal, (ean, cover) => {
          if (!isActive) return;
          setAllBooks(prev =>
            prev.map(b => (b.ean === ean ? { ...b, cover } : b)),
          );
        });
      })
      .catch((err) => {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
      coverAbortRef.current?.abort();
    };
  }, []);

  const togglePublisher = (publisher: string) => {
    setSelectedPublishers(prev =>
      prev.includes(publisher)
        ? prev.filter(p => p !== publisher)
        : [...prev, publisher]
    );
  };

  const filteredBooks = useMemo(() => {
    return allBooks.filter(book => {
      if (selectedPublishers.length > 0 && !selectedPublishers.includes(book.publisher)) {
        return false;
      }
      if (!publisherMatchesCategory(book.publisher, activeCategory)) {
        return false;
      }
      return true;
    });
  }, [allBooks, selectedPublishers, activeCategory]);

  const renderSkeleton = () => (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: 15 }, (_, i) => (
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
            <BreadcrumbPage>Dernières nouveautés</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
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
                {publishers.map(pub => (
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
          <CatalogueLayout active="Dernières nouveautés">
            <h3 className="mb-4 font-semibold text-xl">Dernières nouveautés</h3>

            {loading && renderSkeleton()}

            {error && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && filteredBooks.length === 0 && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>Aucune nouveauté disponible pour le moment.</p>
              </div>
            )}

            {filteredBooks.length > 0 && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {filteredBooks.map(book => (
                  <BookCard key={book.ean} {...book} />
                ))}
              </div>
            )}
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

async function hydrateCoversInOrder(
  books: CatalogueBook[],
  signal: AbortSignal,
  onCover: (ean: string, cover: string) => void,
) {
  for (const book of books) {
    if (signal.aborted) return;
    try {
      const cover = await fetchCatalogueCover(book.ean);
      if (cover && cover !== book.cover) {
        onCover(book.ean, cover);
      }
    } catch {
      // Skip failed covers
    }
  }
}

export default Nouveautes;
