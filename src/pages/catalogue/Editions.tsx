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
import EditionCard from '@/components/EditionCard';
import UniversBD from '@/assets/logos/univers/univers-bd.svg';
import UniversJeune from '@/assets/logos/univers/univers-jeunesse.svg';
import UniversLivre from '@/assets/logos/univers/univers-livres.svg';
import UniversManga from '@/assets/logos/univers/univers-manga.svg';

interface CatalogueProps {
  onViewAll: () => void;
  onViewKiosque: () => void;
}

export function Catalogue({ onViewAll, onViewKiosque }: CatalogueProps) {
  const editions = [
    { title: 'Adonis', color: '--glenat-bd', logo: UniversBD },
    { title: 'Blanche', color: '--glenat-livre', logo: UniversLivre },
    { title: 'Comix Buro', color: '--glenat-jeunesse', logo: UniversJeune },
    { title: 'Disney', color: '--glenat-bd', logo: UniversLivre },
    { title: 'Éditions licences', color: '--glenat-livre', logo: UniversLivre },
    { title: 'Cheval Magazine', color: '--glenat-livre', logo: UniversLivre },
    { title: 'Glénat BD', color: '--glenat-bd', logo: UniversBD },
    { title: 'Glénat Jeunesse', color: '--glenat-jeunesse', logo: UniversJeune },
    { title: 'Glénat Manga', color: '--glenat-manga', logo: UniversManga },
    { title: 'Hugo', color: '--glenat-livre', logo: UniversLivre },
    { title: 'Livres diffusés', color: '--glenat-jeunesse', logo: UniversJeune },
    { title: 'Rando éditions', color: '--glenat-livre', logo: UniversLivre },
    { title: 'Glénat Livres', color: '--glenat-livre', logo: UniversLivre },
    { title: "Vent d'Ouest", color: '--glenat-bd', logo: UniversBD },
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
            <BreadcrumbLink href="#">Catalogue</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Éditions</BreadcrumbPage>
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
          <CatalogueLayout
            active="Éditions"
            onViewAll={onViewAll}
            onViewKiosque={onViewKiosque}
          >
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
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Catalogue;
