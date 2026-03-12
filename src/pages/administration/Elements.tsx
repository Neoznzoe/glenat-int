import { useState, useMemo } from 'react';
import { Component, Plus, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCmsElements, useCreateCmsElement, useUpdateCmsElement, useDeleteCmsElement } from '@/hooks/useCmsElements';
import type { Element, CreateElementPayload } from '@/hooks/useCmsElements';
import { ElementDialog } from '@/components/admin/ElementDialog';
import { useCmsBlocks } from '@/hooks/useCmsBlocks';

export function Elements() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [elementToDelete, setElementToDelete] = useState<Element | null>(null);

  const { data: elements = [], isLoading, refetch } = useCmsElements();
  const { data: blocks = [] } = useCmsBlocks();
  const createElementMutation = useCreateCmsElement();
  const updateElementMutation = useUpdateCmsElement();
  const deleteElementMutation = useDeleteCmsElement();

  const blockNameMap = useMemo(() => {
    const map = new Map<string, string>();
    blocks.forEach((block) => {
      map.set(block.BlockId.toString(), block.Title || block.BlockCode);
    });
    return map;
  }, [blocks]);

  const filteredElements = useMemo(() => {
    if (!search.trim()) {
      return elements;
    }
    const lowerSearch = search.toLowerCase().trim();
    return elements.filter((element) => {
      const searchableText = [
        element.ElementType,
        element.ElementKey,
        element.Content,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(lowerSearch);
    });
  }, [elements, search]);

  const handleCreateElement = () => {
    setEditingElement(null);
    setDialogOpen(true);
  };

  const handleEditElement = (element: Element) => {
    setEditingElement(element);
    setDialogOpen(true);
  };

  const handleDeleteElement = (element: Element) => {
    setElementToDelete(element);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateElementPayload) => {
    try {
      if (editingElement) {
        await updateElementMutation.mutateAsync({
          elementId: editingElement.ElementId,
          payload: data,
        });
        toast.success('Élément mis à jour', {
          description: `L'élément "${data.ElementType}" a été mis à jour avec succès.`,
        });
      } else {
        await createElementMutation.mutateAsync(data);
        toast.success('Élément créé', {
          description: `L'élément "${data.ElementType}" a été créé avec succès.`,
        });
      }
      setDialogOpen(false);
      setEditingElement(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(editingElement ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création', {
        description: message,
      });
    }
  };

  const confirmDelete = async () => {
    if (!elementToDelete) return;

    try {
      await deleteElementMutation.mutateAsync(elementToDelete.ElementId);
      toast.success('Élément supprimé', {
        description: `L'élément "${elementToDelete.ElementType}" a été supprimé avec succès.`,
      });
      setDeleteDialogOpen(false);
      setElementToDelete(null);
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
      description: 'La liste des éléments a été actualisée.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Component className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">Administration des éléments</h1>
        </div>
        <p className="text-muted-foreground">
          Gérez les éléments CMS et leur contenu.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Button onClick={handleCreateElement} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un élément
          </Button>
          <Input
            placeholder="Rechercher un élément..."
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
          <CardTitle>Liste des éléments ({filteredElements.length})</CardTitle>
          <CardDescription>
            Gérez les éléments et leur contenu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Clé</TableHead>
                  <TableHead>Bloc</TableHead>
                  <TableHead>Contenu</TableHead>
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
                      Chargement des éléments...
                    </TableCell>
                  </TableRow>
                ) : filteredElements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {search.trim()
                        ? 'Aucun élément ne correspond à la recherche.'
                        : 'Aucun élément disponible. Créez votre premier élément.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredElements.map((element) => (
                    <TableRow key={element.ElementId}>
                      <TableCell className="font-medium">{element.ElementType}</TableCell>
                      <TableCell>{element.ElementKey || '-'}</TableCell>
                      <TableCell>{blockNameMap.get(element.BlockId) || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {element.Content || '-'}
                      </TableCell>
                      <TableCell>
                        {element.IsActive === 1 ? (
                          <Badge variant="default" className="bg-green-500">
                            Oui
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell>{element.SortOrder ?? '-'}</TableCell>
                      <TableCell className="text-sm">
                        {element.CreatedAt
                          ? new Date(element.CreatedAt.date).toLocaleDateString('fr-FR')
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
                            <DropdownMenuItem onClick={() => handleEditElement(element)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteElement(element)}
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

      <ElementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        element={editingElement}
        onSubmit={handleSubmit}
        isLoading={createElementMutation.isPending || updateElementMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'élément "{elementToDelete?.ElementType}" ? Cette
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

export default Elements;
