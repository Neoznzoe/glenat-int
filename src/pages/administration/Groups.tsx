import { useState, useMemo } from 'react';
import { Users, Plus, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useGroupsFromApi, useCreateGroupViaApi, useUpdateGroupViaApi, useDeleteGroupViaApi, type ApiGroupRecord } from '@/hooks/useAdminData';
import { GroupDialog } from '@/components/admin/GroupDialog';

export function Groups() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ApiGroupRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ApiGroupRecord | null>(null);

  const { data: groups = [], isLoading, refetch } = useGroupsFromApi();
  const createGroupMutation = useCreateGroupViaApi();
  const updateGroupMutation = useUpdateGroupViaApi();
  const deleteGroupMutation = useDeleteGroupViaApi();

  const filteredGroups = useMemo(() => {
    if (!search.trim()) {
      return groups;
    }
    const lowerSearch = search.toLowerCase().trim();
    return groups.filter((group) => {
      const searchableText = [
        group.GroupCode,
        group.GroupName,
        group.Description,
        String(group.UserGroupId),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(lowerSearch);
    });
  }, [groups, search]);

  // Helper function to normalize date values from API
  const normalizeDate = (dateValue: unknown): Date | null => {
    if (!dateValue) return null;

    // Handle object format: { date: "2025-12-02 14:29:50.230000", timezone_type: 3, timezone: "UTC" }
    if (typeof dateValue === 'object' && dateValue !== null && 'date' in dateValue) {
      const dateObj = dateValue as { date: string };
      const timestamp = Date.parse(dateObj.date);
      if (!isNaN(timestamp)) {
        return new Date(timestamp);
      }
    }

    // Handle string format
    if (typeof dateValue === 'string') {
      const timestamp = Date.parse(dateValue);
      if (!isNaN(timestamp)) {
        return new Date(timestamp);
      }
    }

    return null;
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setDialogOpen(true);
  };

  const handleEditGroup = (group: ApiGroupRecord) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const handleDeleteGroup = (group: ApiGroupRecord) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<ApiGroupRecord>) => {
    try {
      if (editingGroup) {
        await updateGroupMutation.mutateAsync({
          groupId: String(editingGroup.UserGroupId),
          updates: data,
        });
        toast.success('Groupe mis à jour', {
          description: `Le groupe "${data.GroupName}" a été mis à jour avec succès.`,
        });
      } else {
        await createGroupMutation.mutateAsync(data);
        toast.success('Groupe créé', {
          description: `Le groupe "${data.GroupName}" a été créé avec succès.`,
        });
      }
      setDialogOpen(false);
      setEditingGroup(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(
        editingGroup ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création',
        {
          description: message,
        },
      );
    }
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      await deleteGroupMutation.mutateAsync(String(groupToDelete.UserGroupId));
      toast.success('Groupe supprimé', {
        description: `Le groupe "${groupToDelete.GroupName}" a été supprimé avec succès.`,
      });
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
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
      description: 'La liste des groupes a été actualisée.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">
            Administration des groupes
          </h1>
        </div>
        <p className="text-muted-foreground">
          Gérez les groupes d'utilisateurs et leurs permissions dans le système.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Button onClick={handleCreateGroup} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un groupe
          </Button>
          <Input
            placeholder="Rechercher un groupe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des groupes ({filteredGroups.length})</CardTitle>
          <CardDescription>
            Gérez les groupes d'utilisateurs et leurs configurations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Modifié le</TableHead>
                  <TableHead>Modifié par</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Chargement des groupes...
                    </TableCell>
                  </TableRow>
                ) : filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {search.trim()
                        ? 'Aucun groupe ne correspond à la recherche.'
                        : 'Aucun groupe disponible. Créez votre premier groupe.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group) => {
                    const isActive = typeof group.IsActive === 'boolean' ? group.IsActive : group.IsActive === 1;
                    const createdDate = normalizeDate(group.CreatedAt);
                    const updatedDate = normalizeDate(group.UpdatedAt);

                    return (
                      <TableRow key={group.UserGroupId}>
                        <TableCell className="font-medium">{group.UserGroupId}</TableCell>
                        <TableCell>{group.GroupName}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {group.Description || '-'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              isActive
                                ? 'text-green-600'
                                : 'text-muted-foreground'
                            }
                          >
                            {isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {createdDate
                            ? createdDate.toLocaleDateString('fr-FR')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {updatedDate
                            ? updatedDate.toLocaleDateString('fr-FR')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {group.UpdatedBy || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditGroup(group)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteGroup(group)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <GroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
        onSubmit={handleSubmit}
        isLoading={createGroupMutation.isPending || updateGroupMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le groupe "{groupToDelete?.GroupName}" ?
              Cette action est irréversible et supprimera toutes les associations avec les utilisateurs.
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

export default Groups;
