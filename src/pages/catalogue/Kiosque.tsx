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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
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
}

interface KiosqueBook extends BookCardProps {
  creationDate: string;
}

export function Kiosque({ onBackToCatalogue, onViewAll }: KiosqueProps) {
  const [creationSort, setCreationSort] = useState<string>();
  const [saleSort, setSaleSort] = useState<string>();
  const [viewsSort, setViewsSort] = useState<string>();
  const [sortField, setSortField] = useState<'creationDate' | 'publicationDate' | 'views'>('creationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleCreationChange = (value: string) => {
    setSortField('creationDate');
    setSortDirection(value as 'asc' | 'desc');
    setCreationSort(value);
    setSaleSort(undefined);
    setViewsSort(undefined);
  };

  const handleSaleChange = (value: string) => {
    setSortField('publicationDate');
    setSortDirection(value as 'asc' | 'desc');
    setSaleSort(value);
    setCreationSort(undefined);
    setViewsSort(undefined);
  };

  const handleViewsChange = (value: string) => {
    setSortField('views');
    setSortDirection(value as 'asc' | 'desc');
    setViewsSort(value);
    setCreationSort(undefined);
    setSaleSort(undefined);
  };

  const books: KiosqueBook[] = [
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
  ];

  const sortedBooks = [...books].sort((a, b) => {
    const fieldA = sortField === 'views' ? a.views ?? 0 : new Date(a[sortField]).getTime();
    const fieldB = sortField === 'views' ? b.views ?? 0 : new Date(b[sortField]).getTime();
    const comparison = fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const infoLabel =
    sortField === 'creationDate'
      ? 'Date de création'
      : sortField === 'publicationDate'
      ? 'Date de mise en vente'
      : 'Vues';

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
          <div className="flex flex-wrap gap-4">
            <Select value={creationSort} onValueChange={handleCreationChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Date de création" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Du plus récent au plus ancien</SelectItem>
                <SelectItem value="asc">Du plus ancien au plus récent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={saleSort} onValueChange={handleSaleChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Date de mise en vente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Du plus récent au plus ancien</SelectItem>
                <SelectItem value="asc">Du plus ancien au plus récent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={viewsSort} onValueChange={handleViewsChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Vues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Du plus vues au moins vues</SelectItem>
                <SelectItem value="asc">Du moins vues au plus vues</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout
            active="Kiosque"
            onViewEditions={onBackToCatalogue}
            onViewAll={onViewAll}
          >
            <h3 className="mb-4 font-semibold text-xl">Kiosque</h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {sortedBooks.map(book => (
                <BookCard
                  key={book.ean}
                  {...book}
                  infoLabel={infoLabel}
                  infoValue={
                    sortField === 'views'
                      ? book.views
                      : sortField === 'publicationDate'
                      ? book.publicationDate
                      : book.creationDate
                  }
                />
              ))}
            </div>
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Kiosque;

