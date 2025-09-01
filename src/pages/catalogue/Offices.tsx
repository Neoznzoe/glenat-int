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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
}

interface OfficeGroup {
  office: string;
  date: string;
  shipping: string;
  books: BookCardProps[];
}

export function Offices({ onBackToCatalogue, onViewAll, onViewKiosque }: OfficesProps) {
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

  const togglePublisher = (publisher: string) => {
    setSelectedPublishers(prev =>
      prev.includes(publisher)
        ? prev.filter(p => p !== publisher)
        : [...prev, publisher]
    );
  };

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
          <Tabs defaultValue="all">
            <TabsList className="flex justify-start border-b bg-transparent p-0 text-sm text-muted-foreground rounded-none">
              <TabsTrigger
                value="all"
                className="w-32 rounded-none border-b-2 border-transparent px-4 py-2 flex items-center justify-center text-center data-[state=active]:border-[#ff3b30] data-[state=active]:bg-transparent data-[state=active]:text-[#ff3b30] data-[state=active]:shadow-none"
              >
                Toute
              </TabsTrigger>
              <TabsTrigger
                value="filters"
                className="w-32 rounded-none border-b-2 border-transparent px-4 py-2 flex items-center justify-center text-center data-[state=active]:border-[#ff3b30] data-[state=active]:bg-transparent data-[state=active]:text-[#ff3b30] data-[state=active]:shadow-none"
              >
                Filtres
              </TabsTrigger>
            </TabsList>
            <TabsContent value="filters" className="mt-4">
              <div className="flex flex-col gap-2">
                {publishers.map(pub => (
                  <label key={pub} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedPublishers.includes(pub)}
                      onCheckedChange={() => togglePublisher(pub)}
                    />
                    <span>{pub}</span>
                  </label>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout
            active="Prochaines offices"
            onViewEditions={onBackToCatalogue}
            onViewAll={onViewAll}
            onViewKiosque={onViewKiosque}
          >
            <h3 className="mb-4 font-semibold text-xl">Prochaines offices</h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {offices.map(group => (
                <Fragment key={group.office}>
                  <Card className="col-span-full w-fit min-w-[280px]">
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
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Offices;
