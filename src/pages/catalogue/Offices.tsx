import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import CatalogueLayout from './CatalogueLayout';
import BookCard from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ListFilter as ListFilterIcon, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { SecureLink } from '@/components/routing/SecureLink';
import { fetchCatalogueOffices, type CatalogueOfficeGroup } from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

export function Offices() {
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
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('asc');
  const [offices, setOffices] = useState<CatalogueOfficeGroup[] | null>(null);

  useEffect(() => {
    let isActive = true;

    const handleProgress = (groups: CatalogueOfficeGroup[]) => {
      if (isActive) {
        setOffices(groups);
      }
    };

    fetchCatalogueOffices({ hydrateCovers: false, onCoverProgress: handleProgress })
      .then(handleProgress)
      .catch(() => {
        // Silently ignore offices fetch errors
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

  const parseDate = (dateStr: string): Date | null => {
    const segments = dateStr.split('/');

    if (segments.length !== 3) {
      return null;
    }

    const [dayStr, monthStr, yearStr] = segments;
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);

    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
      return null;
    }

    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const sortedOffices = useMemo(() => {
    if (!offices) {
      return [] as CatalogueOfficeGroup[];
    }

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfTodayTime = startOfToday.getTime();

    const compare = (
      a: { group: CatalogueOfficeGroup; index: number },
      b: { group: CatalogueOfficeGroup; index: number },
    ) => {
      const dateA = parseDate(a.group.date);
      const dateB = parseDate(b.group.date);

      const hasDateA = dateA !== null;
      const hasDateB = dateB !== null;

      if (hasDateA !== hasDateB) {
        return hasDateA ? -1 : 1;
      }

      if (!dateA || !dateB) {
        return a.index - b.index;
      }

      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      const isFutureA = timeA >= startOfTodayTime;
      const isFutureB = timeB >= startOfTodayTime;

      if (isFutureA !== isFutureB) {
        return isFutureA ? -1 : 1;
      }

      if (isFutureA && isFutureB) {
        if (timeA !== timeB) {
          return timeA - timeB;
        }
        return a.index - b.index;
      }

      if (timeA !== timeB) {
        return timeB - timeA;
      }

      return a.index - b.index;
    };

    const direction = sortDirection === 'asc' ? 1 : -1;

    // Filtrer les offices par publisher si des filtres sont sélectionnés
    let filteredOffices = offices;
    if (selectedPublishers.length > 0) {
      filteredOffices = offices
        .map(group => ({
          ...group,
          books: group.books.filter(book =>
            selectedPublishers.includes(book.publisher)
          ),
        }))
        .filter(group => group.books.length > 0); // Garder uniquement les offices avec des livres
    }

    return filteredOffices
      .map((group, index) => ({ group, index }))
      .sort((a, b) => compare(a, b) * direction)
      .map(({ group }) => group);
  }, [offices, sortDirection, selectedPublishers]);

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
