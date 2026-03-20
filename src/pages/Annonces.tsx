import { useState, useMemo } from 'react';
import { useAnnonces } from '@/hooks/useAnnonces';
import AnnonceCard from '@/components/annonces/AnnonceCard';
import { Loader2, Search, ScrollText, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DeposerAnnonceDialog } from '@/components/annonces/DeposerAnnonceDialog';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const ALL_TYPES = ['Toutes', 'Actualité', 'Offre', 'Demande'] as const;

export function Annonces() {
  const { data: annonces, isLoading, isError, error, refetch, isFetching } = useAnnonces();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('Toutes');
  const [depositOpen, setDepositOpen] = useState(false);

  const filteredAnnonces = useMemo(() => {
    if (!annonces) return [];

    return annonces.filter((a) => {
      if (typeFilter !== 'Toutes' && a.type !== typeFilter) return false;

      if (search.trim()) {
        const lowerSearch = search.toLowerCase();
        const searchable = [
          a.title,
          a.description,
          a.price,
          a.category,
          a.type,
          a.author.firstName,
          a.author.lastName,
          a.author.department,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(lowerSearch)) return false;
      }

      return true;
    });
  }, [annonces, search, typeFilter]);

  const showLoading = isLoading || isFetching;
  const errorMessage =
    error instanceof Error
      ? error.message
      : 'Une erreur inattendue est survenue lors du chargement des annonces.';

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Petites annonces</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight">Petites annonces</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setDepositOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Déposer une annonce
          </Button>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap items-center gap-1 border-b">
        {ALL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              typeFilter === type
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Content */}
      {showLoading ? (
        <div className="flex min-h-[200px] w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Chargement des annonces...</span>
        </div>
      ) : isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive-foreground">
          <p className="font-semibold">Impossible de charger les annonces.</p>
          <p className="text-sm opacity-80">{errorMessage}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 inline-flex items-center rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
          >
            Réessayer
          </button>
        </div>
      ) : filteredAnnonces.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {filteredAnnonces.length} annonce{filteredAnnonces.length > 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnnonces.map((annonce) => (
              <AnnonceCard key={annonce.id} annonce={annonce} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
          <ScrollText className="h-16 w-16 text-muted-foreground/30" />
          <div className="space-y-1">
            <p className="text-lg font-medium text-muted-foreground">
              {annonces && annonces.length > 0
                ? 'Aucune annonce ne correspond à vos critères'
                : 'Aucune annonce disponible pour le moment'}
            </p>
            <p className="text-sm text-muted-foreground/70">
              {annonces && annonces.length > 0
                ? 'Essayez de modifier vos filtres ou votre recherche.'
                : 'Les petites annonces publiées par vos collègues apparaîtront ici.'}
            </p>
          </div>
          {annonces && annonces.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setTypeFilter('Toutes'); setSearch(''); }}
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}

      <DeposerAnnonceDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

export default Annonces;
