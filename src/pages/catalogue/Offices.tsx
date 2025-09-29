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
import BookCard from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  ListFilter as ListFilterIcon,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
} from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SecureLink } from '@/components/routing/SecureLink';
import { fetchCatalogueOffices, type CatalogueOfficeGroup } from '@/lib/catalogue';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
const SKELETON_GROUP_COUNT = 2;
const SKELETON_BOOKS_PER_GROUP = 5;

const BookCardSkeleton = () => (
  <Card className="flex flex-col overflow-hidden min-w-[230px]">
    <div className="relative flex items-center justify-center p-2 bg-muted/40">
      <Skeleton className="h-48 w-full rounded-md" />
    </div>
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-9 w-28" />
    </div>
  </Card>
);

const OfficeGroupSkeleton = () => (
  <Fragment>
    <Card className="col-span-full w-fit min-w-[280px] bg-background">
      <CardHeader className="py-2 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
    </Card>
    {Array.from({ length: SKELETON_BOOKS_PER_GROUP }).map((_, index) => (
      <BookCardSkeleton key={index} />
    ))}
  </Fragment>
);

export function Offices() {
  const location = useLocation();
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
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [offices, setOffices] = useState<CatalogueOfficeGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);
    setOffices(null);

    fetchCatalogueOffices()
      .then(data => {
        if (!isActive) {
          return;
        }

        console.log('[Offices] données reçues', data);
        setOffices(data);
      })
      .catch(fetchError => {
        console.error('Impossible de récupérer les offices', fetchError);
        if (!isActive) {
          return;
        }

        setOffices([]);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Impossible de charger les prochaines offices",
        );
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [location.key]);

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

  const filteredOffices = useMemo(() => {
    if (!offices) {
      return [] as CatalogueOfficeGroup[];
    }

    if (selectedPublishers.length === 0) {
      return offices;
    }

    return offices.filter(group =>
      group.books.some(book => selectedPublishers.includes(book.publisher)),
    );
  }, [offices, selectedPublishers]);

  const sortedOffices = useMemo(() => {
    return [...filteredOffices].sort((a, b) => {
      const dateA = parseDate(a.date).getTime();
      const dateB = parseDate(b.date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredOffices, sortDirection]);

  const shouldDisplaySkeletons = isLoading && !sortedOffices.length;

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
            <BreadcrumbPage>Prochaines offices</BreadcrumbPage>
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
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={toggleSortDirection}
            >
              Trier par date
              {sortDirection === 'desc' ? (
                <ArrowDownWideNarrow className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpWideNarrow className="ml-2 h-4 w-4" />
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
          <CatalogueLayout active="Prochaines offices">
            <h3 className="mb-4 font-semibold text-xl">Prochaines offices</h3>
                        {shouldDisplaySkeletons && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: SKELETON_GROUP_COUNT }).map((_, groupIndex) => (
                  <OfficeGroupSkeleton key={groupIndex} />
                ))}
              </div>
            )}              </div>
            )}
            {!isLoading && error && (
              <Alert variant="destructive" className="max-w-3xl">
                <AlertTitle>Impossible de charger les offices</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {!isLoading && !error && sortedOffices.length === 0 && (
              <Alert className="max-w-3xl">
                <AlertTitle>Aucune office disponible</AlertTitle>
                <AlertDescription>
                  Revenez plus tard pour découvrir les prochaines mises en vente.
                </AlertDescription>
              </Alert>
            )}
            {sortedOffices.length > 0 && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {sortedOffices.map(group => (
                  <Fragment key={group.office}>
                    <Card className="col-span-full w-fit min-w-[280px] bg-background">
                      <CardHeader className="py-2">
                        <CardTitle className="text-lg">
                          Office {group.office} : {group.date}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{group.shipping}</p>
                      </CardHeader>
                    </Card>
                    {group.books.map(book => (
                      <BookCard key={book.ean} {...book} />
                    ))}
                  </Fragment>
                ))}
              </div>
            )}
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Offices;

