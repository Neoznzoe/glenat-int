import { useState, useMemo } from 'react';
import { Box, Plus, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCmsModules, useCreateCmsModule, useUpdateCmsModule, useDeleteCmsModule } from '@/hooks/useCmsModules';
import type { Module, CreateModulePayload } from '@/hooks/useCmsModules';
import { ModuleDialog } from '@/components/admin/ModuleDialog';

export function Modules() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);

  const { data: modules = [], isLoading, refetch } = useCmsModules();
  const createModuleMutation = useCreateCmsModule();
  const updateModuleMutation = useUpdateCmsModule();
  const deleteModuleMutation = useDeleteCmsModule();

  const filteredModules = useMemo(() => {
    if (!search.trim()) {
      return modules;
    }
    const lowerSearch = search.toLowerCase().trim();
    return modules.filter((module) => {
      const searchableText = [
        module.ModuleCode,
        module.ModuleName,
        module.ModuleType,
        module.TemplateKey,
        module.Description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(lowerSearch);
    });
  }, [modules, search]);

  const handleCreateModule = () => {
    setEditingModule(null);
    setDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setDialogOpen(true);
  };

  const handleDeleteModule = (module: Module) => {
    setModuleToDelete(module);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateModulePayload) => {
    try {
      if (editingModule) {
        await updateModuleMutation.mutateAsync({
          moduleId: editingModule.ModuleId,
          payload: data,
        });
        toast.success('Module mis à jour', {
          description: `Le module "${data.ModuleName}" a été mis à jour avec succès.`,
        });
      } else {
        await createModuleMutation.mutateAsync(data);
        toast.success('Module créé', {
          description: `Le module "${data.ModuleName}" a été créé avec succès.`,
        });
      }
      setDialogOpen(false);
      setEditingModule(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(editingModule ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création', {
        description: message,
      });
    }
  };

  const confirmDelete = async () => {
    if (!moduleToDelete) return;

    try {
      await deleteModuleMutation.mutateAsync(moduleToDelete.ModuleId);
      toast.success('Module supprimé', {
        description: `Le module "${moduleToDelete.ModuleName}" a été supprimé avec succès.`,
      });
      setDeleteDialogOpen(false);
      setModuleToDelete(null);
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
      description: 'La liste des modules a été actualisée.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Box className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">Administration des modules</h1>
        </div>
        <p className="text-muted-foreground">
          Gérez les modules CMS et leurs paramètres de configuration.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Button onClick={handleCreateModule} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un module
          </Button>
          <Input
            placeholder="Rechercher un module..."
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
          <CardTitle>Liste des modules ({filteredModules.length})</CardTitle>
          <CardDescription>
            Gérez les modules et leurs paramètres de configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Chargement des modules...
                    </TableCell>
                  </TableRow>
                ) : filteredModules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {search.trim()
                        ? 'Aucun module ne correspond à la recherche.'
                        : 'Aucun module disponible. Créez votre premier module.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModules.map((module) => (
                    <TableRow key={module.ModuleId}>
                      <TableCell className="font-medium">{module.ModuleCode}</TableCell>
                      <TableCell>{module.ModuleName}</TableCell>
                      <TableCell>{module.ModuleType || '-'}</TableCell>
                      <TableCell>{module.TemplateKey || '-'}</TableCell>
                      <TableCell>
                        {module.IsActive === 1 ? (
                          <Badge variant="default" className="bg-green-500">
                            Oui
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell>{module.DisplayOrder ?? '-'}</TableCell>
                      <TableCell className="text-sm">
                        {module.CreatedAt
                          ? new Date(module.CreatedAt.date).toLocaleDateString('fr-FR')
                          : '-'}
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
                            <DropdownMenuItem onClick={() => handleEditModule(module)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteModule(module)}
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

      <ModuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        module={editingModule}
        onSubmit={handleSubmit}
        isLoading={createModuleMutation.isPending || updateModuleMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le module "{moduleToDelete?.ModuleCode}" ? Cette
              action est irréversible.
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

export default Modules;
