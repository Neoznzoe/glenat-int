import { useState, useMemo } from 'react';
import { Globe, Plus, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useZones, useCreateZone, useUpdateZone, useDeleteZone } from '@/hooks/useZones';
import type { Zone, CreateZonePayload } from '@/hooks/useZones';
import { ZoneDialog } from '@/components/admin/ZoneDialog';

export function Zones() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);

  const { data: zones = [], isLoading, refetch } = useZones();
  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();
  const deleteZoneMutation = useDeleteZone();

  const filteredZones = useMemo(() => {
    if (!search.trim()) {
      return zones;
    }
    const lowerSearch = search.toLowerCase().trim();
    return zones.filter((zone) => {
      const searchableText = [
        zone.ZoneCode,
        zone.ZoneName,
        zone.DefaultLanguage,
        zone.AuthorizedLanguages,
        zone.DefaultTimeZone,
        zone.CacheControl,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(lowerSearch);
    });
  }, [zones, search]);

  const handleCreateZone = () => {
    setEditingZone(null);
    setDialogOpen(true);
  };

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone);
    setDialogOpen(true);
  };

  const handleDeleteZone = (zone: Zone) => {
    setZoneToDelete(zone);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateZonePayload) => {
    try {
      if (editingZone) {
        await updateZoneMutation.mutateAsync({
          zoneId: editingZone.ZoneId,
          payload: data,
        });
        toast.success('Zone mise à jour', {
          description: `La zone "${data.ZoneName}" a été mise à jour avec succès.`,
        });
      } else {
        await createZoneMutation.mutateAsync(data);
        toast.success('Zone créée', {
          description: `La zone "${data.ZoneName}" a été créée avec succès.`,
        });
      }
      setDialogOpen(false);
      setEditingZone(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(editingZone ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création', {
        description: message,
      });
    }
  };

  const confirmDelete = async () => {
    if (!zoneToDelete) return;

    try {
      await deleteZoneMutation.mutateAsync(zoneToDelete.ZoneId);
      toast.success('Zone supprimée', {
        description: `La zone "${zoneToDelete.ZoneName}" a été supprimée avec succès.`,
      });
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error('Erreur lors de la suppression', {
        description: message,
      });
    }
  };

  const handleRefresh = () => {
    void refetch();
    toast.success('Actualisation', {
      description: 'La liste des zones a été actualisée.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">Administration des zones</h1>
        </div>
        <p className="text-muted-foreground">
          Vous pouvez facilement administrer les différentes zones des sites grâce à ces actions.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Button onClick={handleCreateZone} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer une zone
          </Button>
          <Input
            placeholder="Rechercher une zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Button onClick={handleRefresh} variant="destructive" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des zones ({filteredZones.length})</CardTitle>
          <CardDescription>
            Gérez les zones et leurs paramètres de configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Langue par défaut</TableHead>
                  <TableHead>Zone par défaut</TableHead>
                  <TableHead>Langues autorisées</TableHead>
                  <TableHead>Fuseau horaire par défaut</TableHead>
                  <TableHead>Contrôle du cache</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Chargement des zones...
                    </TableCell>
                  </TableRow>
                ) : filteredZones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {search.trim()
                        ? 'Aucune zone ne correspond à la recherche.'
                        : 'Aucune zone disponible. Créez votre première zone.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredZones.map((zone) => (
                    <TableRow key={zone.ZoneId}>
                      <TableCell className="font-medium">{zone.ZoneCode}</TableCell>
                      <TableCell>{zone.TemplateKey || '-'}</TableCell>
                      <TableCell>{zone.DefaultLanguage}</TableCell>
                      <TableCell>
                        {zone.DefaultSiteZone === 1 ? (
                          <Badge variant="default" className="bg-green-500">
                            Oui
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell>{zone.AuthorizedLanguages}</TableCell>
                      <TableCell>{zone.DefaultTimeZone || '-'}</TableCell>
                      <TableCell className="text-sm">{zone.CacheControl || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditZone(zone)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteZone(zone)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ZoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        zone={editingZone}
        onSubmit={handleSubmit}
        isLoading={createZoneMutation.isPending || updateZoneMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la zone "{zoneToDelete?.ZoneCode}" ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Zones;
