import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import CatalogueLayout from './CatalogueLayout';
import BookCard from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ListFilter as ListFilterIcon, CalendarDays, CalendarClock, BarChart3, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { SecureLink } from '@/components/routing/SecureLink';
import { fetchCatalogueKiosques, type CatalogueKiosqueGroup } from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

export function Kiosque() {
  useScrollRestoration();
  const publishers = [
    'Hugo',
    'Comix Buro',
    'Disney',
    'Éditions Licences',
    'Glénat bd',
    'Glénat Jeunesse',
    'Glénat Livres',
    'Glénat Manga',
    'Rando Editions',
    "Vents d'Ouest",
    'Livres diffusés',
  ];

  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'publicationDate' | 'creationDate' | 'views'>(
    'creationDate'
  );
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [kiosques, setKiosques] = useState<CatalogueKiosqueGroup[] | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchCatalogueKiosques()
      .then(data => {
        if (isActive) {
          setKiosques(data);
        }
      })
      .catch(error => {
        console.error('Impossible de récupérer le kiosque', error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const toggleSortDirection = () =>
    setSortDirection(prev => (prev === 'desc' ? 'asc' : 'desc'));

  const togglePublisher = (publisher: string) => {
    setSelectedPublishers(prev =>
      prev.includes(publisher)
        ? prev.filter(p => p !== publisher)
        : [...prev, publisher]
    );
  };

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const sortOptions = {
    publicationDate: { label: 'Date de mise en vente', icon: CalendarClock },
    creationDate: { label: 'Date de création', icon: CalendarDays },
    views: { label: 'Vues', icon: BarChart3 },
  } as const;

  const sortedKiosques = useMemo(
    () =>
      (kiosques ?? []).map(k => ({
        ...k,
        books: [...k.books].sort((a, b) => {
          const valueA =
            sortField === 'views'
              ? a.views ?? 0
              : sortField === 'creationDate'
              ? parseDate(a.creationDate ?? '01/01/1970').getTime()
              : parseDate(a.publicationDate).getTime();
          const valueB =
            sortField === 'views'
              ? b.views ?? 0
              : sortField === 'creationDate'
              ? parseDate(b.creationDate ?? '01/01/1970').getTime()
              : parseDate(b.publicationDate).getTime();
          return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }),
      })),
    [kiosques, sortDirection, sortField]
  );

  const currentSort = sortOptions[sortField];

  const infoLabel =
    sortField === 'publicationDate'
      ? 'Date de mise en vente'
      : sortField === 'creationDate'
      ? 'Date de création'
      : sortField === 'views'
      ? 'Vues'
      : undefined;

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
            <BreadcrumbPage>Kiosque</BreadcrumbPage>
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
            <Button variant="default" size="sm" className="whitespace-nowrap">
              Toutes
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap flex items-center"
                >
                  <currentSort.icon className="mr-2 h-4 w-4" />
                  Trier par {currentSort.label.toLowerCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {(Object.keys(sortOptions) as (keyof typeof sortOptions)[]).map(key => {
                  const OptionIcon = sortOptions[key].icon;
                  return (
                    <DropdownMenuItem key={key} onClick={() => setSortField(key)}>
                      <OptionIcon className="mr-2 h-4 w-4" />
                      {sortOptions[key].label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortDirection}
              className="whitespace-nowrap flex items-center"
            >
              {sortDirection === 'desc' ? (
                <>
                  <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
                  Décroissant
                </>
              ) : (
                <>
                  <ArrowUpWideNarrow className="mr-2 h-4 w-4" />
                  Croissant
                </>
              )}
            </Button>
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
          <CatalogueLayout active="Kiosque">
            <h3 className="mb-4 font-semibold text-xl">Kiosque</h3>
            {sortedKiosques.length > 0 && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 bg-ba">
                {sortedKiosques.map(kiosque => {
                  const [firstBook] = kiosque.books;
                  const headerValue =
                    sortField === 'views'
                      ? firstBook?.views ?? 0
                      : sortField === 'creationDate'
                      ? firstBook?.creationDate ?? '—'
                      : firstBook?.publicationDate ?? '—';

                  return (
                    <Fragment key={kiosque.office}>
                      <Card className="col-span-full bg-background">
                        <CardHeader className="py-2">
                          <CardTitle className="text-lg">
                            {`${infoLabel} : ${headerValue}`}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      {kiosque.books.map(book => (
                        <BookCard
                          key={book.ean}
                          {...book}
                          infoLabel={infoLabel}
                          infoValue={
                            infoLabel === 'Vues'
                              ? book.views
                              : infoLabel === 'Date de mise en vente'
                              ? book.publicationDate
                              : infoLabel === 'Date de création'
                              ? book.creationDate
                              : undefined
                          }
                        />
                      ))}
                    </Fragment>
                  );
                })}
              </div>
            )}
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Kiosque;
