import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home as HomeIcon, Search } from 'lucide-react';

// A small helper component to render a labeled search input
function SearchModule({ title, placeholder }: { title: string; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold">{title}</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-10 bg-muted border-input focus:bg-background"
        />
      </div>
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
      <CardHeader className="bg-[#ff3b30] text-white px-6 py-4">
        <CardTitle className="flex items-center space-x-2">
          <HomeIcon className="h-5 w-5" />
          <span>Actualités</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0">
          {/* Left column: search modules */}
          <div className="space-y-4 lg:pr-6 lg:border-r lg:border-border">
            <SearchModule title="Glénat'Fée" placeholder="Rechercher..." />
            <SearchModule title="Commande" placeholder="Rechercher..." />
            <SearchModule title="Contrats" placeholder="Rechercher..." />
          </div>

          {/* Right column: new arrivals and name day */}
          <div className="space-y-6 lg:pl-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">Nouveaux arrivants</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {newArrivals.map((person) => (
                  <li key={person}>{person}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">Bonnes fêtes aux :</h3>
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
