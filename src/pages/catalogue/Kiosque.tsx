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
import ControNatura from '@/assets/images/contro-natura.webp';
import Brume01 from '@/assets/images/brume-01.webp';
import Shangri17 from '@/assets/images/shangri-17.webp';
import Momie from '@/assets/images/momie-bandelette.webp';
import Cemotions from '@/assets/images/couleurs-emotions.webp';

interface KiosqueProps {
  onBackToCatalogue?: () => void;
  onViewAll?: () => void;
  onViewOffices?: () => void;
  onViewNouveautes?: () => void;
}

interface KiosqueBook extends BookCardProps {
  creationDate: string;
}

interface KiosqueGroup {
  office: string;
  date: string;
  shipping: string;
  books: KiosqueBook[];
}

export function Kiosque({ onBackToCatalogue, onViewAll, onViewOffices, onViewNouveautes }: KiosqueProps) {
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

  const kiosques: KiosqueGroup[] = [
    {
      office: '25501',
      date: '05/09/2025',
      shipping: 'Envoi Chronolivre mardi 02/09/2025 à 18h55',
      books: [
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
          creationDate: '22/02/2024',
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
          creationDate: '15/03/2024',
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
          creationDate: '10/01/2024',
          views: 45,
          color: '--glenat-bd',
          ribbonText: 'À paraître',
        },
      ],
    },
    {
      office: '25502',
      date: '15/09/2025',
      shipping: 'Envoi Chronolivre mardi 09/09/2025 à 18h55',
      books: [
        {
          cover: CombatVie,
          title: "Paul Watson - Le combat d'une vie",
          ean: '9782344059974',
          authors: 'Paul Watson',
          publisher: 'Glénat Livres',
          publicationDate: '05/06/2024',
          priceHT: '22.00',
          stock: 12,
          creationDate: '18/04/2024',
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
          creationDate: '02/05/2024',
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
          creationDate: '01/01/2014',
          views: 250,
          color: '--glenat-jeunesse',
        },
      ],
    },
    {
      office: '25503',
      date: '25/09/2025',
      shipping: 'Envoi Chronolivre mardi 23/09/2025 à 18h55',
      books: [
        {
          cover: ControNatura,
          title: 'Contro Natura - Sang bleu',
          ean: '9782344069080',
          authors: 'M.Andolfo · I.Bigarella',
          publisher: 'Glénat BD',
          publicationDate: '27/08/2025',
          priceHT: '18.96',
          stock: 3373,
          creationDate: '11/06/2025',
          views: 12,
          color: '--glenat-bd',
          ribbonText: 'nouveauté',
        },
        {
          cover: Shangri17,
          title: 'Shangri-la Frontier - Tome 17',
          ean: '9782344066379',
          authors: 'Katarina · R.Fuji',
          publisher: 'Glénat Manga',
          publicationDate: '27/08/2025',
          priceHT: '6.82',
          stock: 6292,
          creationDate: '20/07/2025',
          views: 5,
          color: '--glenat-manga',
          ribbonText: 'nouveauté',
        },
        {
          cover: Brume01,
          title: 'Brume - Tome 01',
          ean: '9782344051733',
          authors: 'J.Pélissier · C.Hinder',
          publisher: 'Glénat BD',
          publicationDate: '26/04/2023',
          priceHT: '11.85',
          stock: 24479,
          creationDate: '13/03/2023',
          views: 410,
          color: '--glenat-bd',
        },
        {
          cover: Momie,
          title: 'Les bandelettes de Momie Molette',
          ean: '9782344057049',
          authors: 'Loïc Clément · Julien Arnal',
          publisher: 'Glénat Jeunesse',
          publicationDate: '09/10/2024',
          priceHT: '11.85',
          stock: 1952,
          creationDate: '25/09/2024',
          views: 80,
          color: '--glenat-jeunesse',
        },
      ],
    },
  ];

  const currentSort = sortOptions[sortField];

  const sortedKiosques = kiosques.map(k => ({
    ...k,
    books: [...k.books].sort((a, b) => {
      const valA =
        sortField === 'views'
          ? a.views ?? 0
          : sortField === 'creationDate'
          ? parseDate(a.creationDate).getTime()
          : parseDate(a.publicationDate).getTime();
      const valB =
        sortField === 'views'
          ? b.views ?? 0
          : sortField === 'creationDate'
          ? parseDate(b.creationDate).getTime()
          : parseDate(b.publicationDate).getTime();
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }),
  }));

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
          <CatalogueLayout
            active="Kiosque"
            onViewEditions={onBackToCatalogue}
            onViewAll={onViewAll}
            onViewOffices={onViewOffices}
            onViewNouveautes={onViewNouveautes}
          >
            <h3 className="mb-4 font-semibold text-xl">Kiosque</h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {sortedKiosques.map(kiosque => {
                const headerValue =
                  sortField === 'views'
                    ? kiosque.books[0].views
                    : sortField === 'creationDate'
                    ? kiosque.books[0].creationDate
                    : kiosque.books[0].publicationDate;

                return (
                  <Fragment key={kiosque.office}>
                    <Card className="col-span-full">
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
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Kiosque;
