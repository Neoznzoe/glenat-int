import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-3xl">Catalogue</CardTitle>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <QuickAccess items={quickLinks} />
            <div className="md:col-span-4">
              <h2 className="mb-4 text-lg font-semibold">Editions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {editions.map((ed) => (
                  <EditionCard key={ed.title} title={ed.title} color={ed.color} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Catalogue;
