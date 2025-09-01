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
import BookCard, { BookCardProps } from '@/components/BookCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  ListFilter as ListFilterIcon,
  CalendarDays,
  CalendarClock,
  BarChart3,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
} from 'lucide-react';
import { Fragment, useState } from 'react';
import OnePiece110 from '@/assets/images/onepiece_110.webp';
import NayaPika from '@/assets/images/naya_pika.webp';
import JulesMatrat from '@/assets/images/jules_matrat.webp';
import CombatVie from '@/assets/images/le_combat_dune_vie.webp';
import Odysee from '@/assets/images/odyssee.webp';
import Cemotions from '@/assets/images/couleurs-emotions.webp';

interface OfficesProps {
  onBackToCatalogue?: () => void;
  onViewAll?: () => void;
  onViewKiosque?: () => void;
  onViewNouveautes?: () => void;
}

interface OfficeGroup {
  office: string;
  date: string;
  shipping: string;
  books: BookCardProps[];
}

export function Offices({ onBackToCatalogue, onViewAll, onViewKiosque, onViewNouveautes }: OfficesProps) {
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
  const [sortField, setSortField] = useState<'officeDate' | 'publicationDate' | 'views'>(
    'officeDate'
  );
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

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
    officeDate: { label: "Date de l'office", icon: CalendarDays },
    publicationDate: { label: 'Date de mise en vente', icon: CalendarClock },
    views: { label: 'Vues', icon: BarChart3 },
  } as const;

  const books1: BookCardProps[] = [
    {
      cover: OnePiece110,
      title: 'One Piece - Tome 110',
      ean: '9782380711102',
      authors: 'E. Oda',
      publisher: 'Glénat Manga',
      publicationDate: '01/02/2025',
      priceHT: '7.99',
      stock: 86,
      views: 140,
      color: '--glenat-manga',
      ribbonText: 'NOUVEAUTÉ',
    },
    {
      cover: NayaPika,
      title: 'Naya Pika - Tome 03',
      ean: '9782344059707',
      authors: 'Rabat · Rodi · Aneko',
      publisher: 'Glénat Jeunesse',
      publicationDate: '03/04/2024',
      priceHT: '10.95',
      stock: 42,
      views: 95,
      color: '--glenat-jeunesse',
    },
    {
      cover: JulesMatrat,
      title: 'Jules Matrat - Tome 03',
      ean: '9782344059905',
      authors: 'Corbeyran · Horne',
      publisher: 'Glénat BD',
      publicationDate: '17/01/2024',
      priceHT: '17.90',
      stock: 58,
      views: 45,
      color: '--glenat-bd',
      ribbonText: 'À paraître',
    },
  ];

  const books2: BookCardProps[] = [
    {
      cover: CombatVie,
      title: "Paul Watson - Le combat d'une vie",
      ean: '9782344059974',
      authors: 'Paul Watson',
      publisher: 'Glénat Livres',
      publicationDate: '05/06/2024',
      priceHT: '22.00',
      stock: 12,
      views: 60,
      color: '--glenat-livre',
      ribbonText: 'NOUVEAUTÉ',
    },
    {
      cover: Odysee,
      title: 'Alva Odyssée',
      ean: '9782344059936',
      authors: 'Alva',
      publisher: 'Glénat Livres',
      publicationDate: '19/06/2024',
      priceHT: '19.95',
      stock: 18,
      views: 30,
      color: '--glenat-livre',
      ribbonText: 'PROVISOIRE',
    },
    {
      cover: Cemotions,
      title: 'La couleur des émotions - Un livre tout animé',
      ean: '9791026400134',
      authors: 'Anna Llenas',
      publisher: 'Glénat Jeunesse',
      publicationDate: '10/10/2014',
      priceHT: '20.76',
      stock: 14574,
      views: 250,
      color: '--glenat-jeunesse',
    },
  ];

  const offices: OfficeGroup[] = [
    {
      office: '25503',
      date: '22/01/2025',
      shipping: 'Envoi Chronolivre mardi 07/01/2025 à 18h55',
      books: books1,
    },
    {
      office: '25504',
      date: '05/02/2025',
      shipping: 'Envoi Chronolivre mardi 21/01/2025 à 18h55',
      books: books2,
    },
  ];

  const currentSort = sortOptions[sortField];

  const sortedOffices =
    sortField === 'officeDate'
      ? [...offices].sort((a, b) => {
          const dateA = parseDate(a.date).getTime();
          const dateB = parseDate(b.date).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        })
      : offices.map(o => ({
          ...o,
          books: [...o.books].sort((a, b) => {
            const valA =
              sortField === 'views'
                ? a.views ?? 0
                : parseDate(a.publicationDate).getTime();
            const valB =
              sortField === 'views'
                ? b.views ?? 0
                : parseDate(b.publicationDate).getTime();
            return sortDirection === 'asc' ? valA - valB : valB - valA;
          }),
        }));

  const infoLabel =
    sortField === 'publicationDate'
      ? 'Date de mise en vente'
      : sortField === 'views'
      ? 'Vues'
      : undefined;

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={onBackToCatalogue}>
              Catalogue
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
          <CatalogueLayout
            active="Prochaines offices"
            onViewEditions={onBackToCatalogue}
            onViewAll={onViewAll}
            onViewKiosque={onViewKiosque}
            onViewNouveautes={onViewNouveautes}
          >
            <h3 className="mb-4 font-semibold text-xl">Prochaines offices</h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {sortedOffices.map(group => {
                const headerValue =
                  sortField === 'officeDate'
                    ? group.date
                    : sortField === 'publicationDate'
                    ? group.books[0].publicationDate
                    : group.books[0].views;

                const directionText =
                  sortField === 'views'
                    ? sortDirection === 'desc'
                      ? 'Tri du plus de vues au moins de vues'
                      : 'Tri du moins de vues au plus de vues'
                    : sortDirection === 'desc'
                    ? 'Tri du plus récent au plus ancien'
                    : 'Tri du plus ancien au plus récent';

                return (
                  <Fragment key={group.office}>
                    <Card className="col-span-full w-fit min-w-[280px]">
                      <CardHeader className="py-2">
                        {sortField === 'officeDate' ? (
                          <>
                            <CardTitle className="text-lg">
                              Office {group.office} : {group.date}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {group.shipping}
                            </p>
                          </>
                        ) : (
                          <>
                            <CardTitle className="text-lg">
                              {infoLabel} : {headerValue}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {directionText}
                            </p>
                          </>
                        )}
                      </CardHeader>
                    </Card>
                    {group.books.map(book => (
                      <BookCard
                        key={book.ean}
                        {...book}
                        infoLabel={infoLabel}
                        infoValue={
                          infoLabel === 'Vues'
                            ? book.views
                            : infoLabel === 'Date de mise en vente'
                            ? book.publicationDate
                            : undefined
                        }
                      />
                    ))}
                  </Fragment>
                );
              })}
            </div>
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Offices;
