import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import QuickAccess, { QuickAccessItem } from '@/components/QuickAccess';
import EditionCard from '@/components/EditionCard';
import {
  Newspaper,
  Store,
  BookOpen,
  CalendarDays,
  TrendingUp,
  Download,
  DownloadCloud,
  Compass,
} from 'lucide-react';

export function Catalogue() {
  const quickLinks: QuickAccessItem[] = [
    { label: 'Kiosque', icon: Newspaper },
    { label: 'Comptoir', icon: Store },
    { label: 'Catalogue distribution', icon: BookOpen },
    { label: 'Prochaines sorties', icon: CalendarDays },
    { label: 'Top des ventes', icon: TrendingUp },
    { label: 'Télécharger le catalogue', icon: Download },
    { label: 'Téléchargement BD/Manga', icon: DownloadCloud },
    { label: 'Votre tour du catalogue', icon: Compass },
  ];

  const editions = [
    { title: 'Adonis', color: '--glenat-livre' },
    { title: 'Blanche', color: '--glenat-livre' },
    { title: 'Comix Buro', color: '--glenat-bd' },
    { title: 'Disney', color: '--glenat-jeunesse' },
    { title: 'Éditions licences', color: '--glenat-livre' },
    { title: 'Cheval Magazine', color: '--glenat-livre' },
    { title: 'Glénat BD', color: '--glenat-bd' },
    { title: 'Glénat Jeunesse', color: '--glenat-jeunesse' },
    { title: 'Glénat Manga', color: '--glenat-manga' },
    { title: 'Hugo', color: '--glenat-livre' },
    { title: 'Livres diffusés', color: '--glenat-livre' },
    { title: 'Rando éditions', color: '--glenat-livre' },
    { title: 'Glénat Livres', color: '--glenat-livre' },
    { title: "Vent d'Ouest", color: '--glenat-bd' },
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
            <BreadcrumbPage>Catalogue</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
          <h1 className="text-3xl font-bold">Catalogue</h1>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <QuickAccess items={quickLinks} />
        </div>
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {editions.map((ed) => (
            <EditionCard key={ed.title} title={ed.title} color={ed.color} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Catalogue;
