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
import QuickAccess, { QuickAccessItem } from '@/components/QuickAccess';
import EditionCard from '@/components/EditionCard';
import GlenatLogo from '@/assets/logos/glenat/glenat_G.svg';
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

export function Catalogue() {
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

  const editions = [
    { title: 'Adonis', color: '--glenat-livre', logo: GlenatLogo },
    { title: 'Blanche', color: '--glenat-livre', logo: GlenatLogo },
    { title: 'Comix Buro', color: '--glenat-bd', logo: GlenatLogo },
    { title: 'Disney', color: '--glenat-jeunesse', logo: GlenatLogo },
    { title: 'Éditions licences', color: '--glenat-livre', logo: GlenatLogo },
    { title: 'Cheval Magazine', color: '--glenat-livre', logo: GlenatLogo },
    { title: 'Glénat BD', color: '--glenat-bd', logo: GlenatLogo },
    { title: 'Glénat Jeunesse', color: '--glenat-jeunesse', logo: GlenatLogo },
    { title: 'Glénat Manga', color: '--glenat-manga', logo: GlenatLogo },
    { title: 'Hugo', color: '--glenat-livre', logo: GlenatLogo },
    { title: 'Livres diffusés', color: '--glenat-livre', logo: GlenatLogo },
    { title: 'Rando éditions', color: '--glenat-livre', logo: GlenatLogo },
    { title: 'Glénat Livres', color: '--glenat-livre', logo: GlenatLogo },
    { title: "Vent d'Ouest", color: '--glenat-bd', logo: GlenatLogo },
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
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
        </CardHeader>
        <div className="px-6">
          <Separator />
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <QuickAccess items={quickLinks} />
            <div className="md:col-span-4">
              <h3 className="mb-4 font-semibold text-xl">Éditions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {editions.map((ed) => (
                  <EditionCard
                    key={ed.title}
                    title={ed.title}
                    color={ed.color}
                    logo={ed.logo}
                  />
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
