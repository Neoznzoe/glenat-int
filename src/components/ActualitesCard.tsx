import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home as HomeIcon } from 'lucide-react';

// A small helper component to render a labeled search input
function SearchModule({ title, placeholder }: { title: string; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      <Input type="search" placeholder={placeholder} />
    </div>
  );
}

// Predefined names per weekday to avoid external calls
const namesByWeekday: Record<string, string[]> = {
  lundi: ['Gabin', 'Agathe'],
  mardi: ['Bernard', 'Brigitte'],
  mercredi: ['Camille', 'Céline'],
  jeudi: ['Denis', 'Diane'],
  vendredi: ['Eric', 'Emma'],
  samedi: ['Fanny', 'Florian'],
  dimanche: ['Gabriel', 'Gaëlle'],
};

export function ActualitesCard() {
  const saintNames = useMemo(() => {
    const weekday = new Date()
      .toLocaleDateString('fr-FR', { weekday: 'long' })
      .toLowerCase();
    return namesByWeekday[weekday] || [];
  }, []);

  const newArrivals = ['Alice Martin', 'Bob Dupont', 'Charles Durand'];

  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader className="bg-[#ff3b30] text-white p-4">
        <CardTitle className="flex items-center space-x-2">
          <HomeIcon className="h-5 w-5" />
          <span>Actualités</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0">
          {/* Left column: search modules */}
          <div className="space-y-4 lg:pr-6 lg:border-r lg:border-border">
            <SearchModule title="Rechercher un salarié" placeholder="Nom..." />
            <SearchModule title="Rechercher un projet" placeholder="Projet..." />
            <SearchModule title="Rechercher un document" placeholder="Document..." />
          </div>

          {/* Right column: new arrivals and name day */}
          <div className="space-y-6 lg:pl-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Nouveaux arrivants</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {newArrivals.map((person) => (
                  <li key={person}>{person}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Bonnes fêtes aux :</h3>
              <p className="text-sm text-muted-foreground">
                {saintNames.length > 0 ? saintNames.join(', ') : 'Aucun nom'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ActualitesCard;
