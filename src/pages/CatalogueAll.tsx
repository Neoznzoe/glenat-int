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
import { Button } from '@/components/ui/button';
import QuickAccess, { QuickAccessItem } from '@/components/QuickAccess';
import BookFilters from '@/components/BookFilters';
import BookCard from '@/components/BookCard';
import OnePiece110 from '@/assets/images/onepiece_110.webp';
import { useState } from 'react';

import {
  BookOpen,
  CalendarDays,
  Download,
  Image,
  Info,
  Mail,
  PackageX,
  Sparkles,
  Store,
  TrendingUp,
  UserPen,
} from 'lucide-react';

interface CatalogueAllProps {
  onBackToCatalogue?: () => void;
}

export function CatalogueAll({ onBackToCatalogue }: CatalogueAllProps) {
  const quickLinks: QuickAccessItem[] = [
    { label: 'Kiosque', icon: Store },
    { label: 'Les auteurs', icon: UserPen },
    { label: 'Prochaines sorties', icon: CalendarDays },
    { label: 'Dernières nouveautés', icon: Sparkles },
    { label: 'Top des commandes', icon: TrendingUp },
    { label: 'Newsletter journaliste', icon: Mail },
    { label: 'Couverture à paraître', icon: Image },
    { label: 'Télécharger le catalogue', icon: Download },
    { label: 'Information à renseigner', icon: Info },
    { label: 'Plus de stock', icon: PackageX },
    { label: 'Voir tout le catalogue', icon: BookOpen },
  ];

  const filters = [
    'Toutes',
    'BD',
    'Manga',
    'Jeunesse',
    'Découverte',
    'Livres',
    'Voyage',
    'Montagne',
  ];

  const [activeFilter, setActiveFilter] = useState('Toutes');

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
            <BreadcrumbPage>Tout le catalogue</BreadcrumbPage>
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
            {filters.map(filter => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className="whitespace-nowrap"
              >
                {filter}
              </Button>
            ))}
            <BookFilters />
          </div>
          <Separator />
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <QuickAccess items={quickLinks} />
            <div className="md:col-span-4">
              <h3 className="mb-4 font-semibold text-xl">Tout le catalogue</h3>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                <BookCard
                  cover={OnePiece110}
                  title="One Piece - Tome 110"
                  ean="9782380711102"
                  authors="E. Oda"
                  publisher="Glénat Manga"
                  publicationDate="01/02/2025"
                  priceHT="7.99"
                  stock={86}
                  views={140}
                  color="--glenat-manga"
                  ribbonText="NOUVEAUTÉ"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CatalogueAll;

