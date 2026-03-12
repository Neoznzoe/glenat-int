import { useState, useMemo } from 'react';
import { SquareStack, Plus, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCmsBlocks, useCreateCmsBlock, useUpdateCmsBlock, useDeleteCmsBlock } from '@/hooks/useCmsBlocks';
import type { Block, CreateBlockPayload } from '@/hooks/useCmsBlocks';
import { BlockDialog } from '@/components/admin/BlockDialog';
import { fetchPages } from '@/lib/pagesApi';
import { useQuery } from '@tanstack/react-query';

export function Blocks() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<Block | null>(null);

  const { data: blocks = [], isLoading, refetch } = useCmsBlocks();
  const { data: pages = [] } = useQuery({
    queryKey: ['cms-pages-lookup'],
    queryFn: fetchPages,
    staleTime: 5 * 60 * 1000,
  });
  const createBlockMutation = useCreateCmsBlock();
  const updateBlockMutation = useUpdateCmsBlock();
  const deleteBlockMutation = useDeleteCmsBlock();

  const pageNameMap = useMemo(() => {
    const map = new Map<string, string>();
    pages.forEach((page) => {
      map.set(page.PageId.toString(), page.PageName);
    });
    return map;
  }, [pages]);

  const filteredBlocks = useMemo(() => {
    if (!search.trim()) {
      return blocks;
    }
    const lowerSearch = search.toLowerCase().trim();
    return blocks.filter((block) => {
      const searchableText = [
        block.BlockCode,
        block.Title,
        block.LayoutRegion,
        block.Status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(lowerSearch);
    });
  }, [blocks, search]);

  const handleCreateBlock = () => {
    setEditingBlock(null);
    setDialogOpen(true);
  };

  const handleEditBlock = (block: Block) => {
    setEditingBlock(block);
    setDialogOpen(true);
  };

  const handleDeleteBlock = (block: Block) => {
    setBlockToDelete(block);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateBlockPayload) => {
    try {
      if (editingBlock) {
        await updateBlockMutation.mutateAsync({
          blockId: editingBlock.BlockId,
          payload: data,
        });
        toast.success('Bloc mis à jour', {
          description: `Le bloc "${data.BlockCode}" a été mis à jour avec succès.`,
        });
      } else {
        await createBlockMutation.mutateAsync(data);
        toast.success('Bloc créé', {
          description: `Le bloc "${data.BlockCode}" a été créé avec succès.`,
        });
      }
      setDialogOpen(false);
      setEditingBlock(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(editingBlock ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création', {
        description: message,
      });
    }
  };

  const confirmDelete = async () => {
    if (!blockToDelete) return;

    try {
      await deleteBlockMutation.mutateAsync(blockToDelete.BlockId);
      toast.success('Bloc supprimé', {
        description: `Le bloc "${blockToDelete.BlockCode}" a été supprimé avec succès.`,
      });
      setDeleteDialogOpen(false);
      setBlockToDelete(null);
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
      description: 'La liste des blocs a été actualisée.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <SquareStack className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">Administration des blocs</h1>
        </div>
        <p className="text-muted-foreground">
          Gérez les blocs CMS et leurs configurations.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Button onClick={handleCreateBlock} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un bloc
          </Button>
          <Input
            placeholder="Rechercher un bloc..."
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
          <CardTitle>Liste des blocs ({filteredBlocks.length})</CardTitle>
          <CardDescription>
            Gérez les blocs et leurs configurations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Réutilisable</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Chargement des blocs...
                    </TableCell>
                  </TableRow>
                ) : filteredBlocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {search.trim()
                        ? 'Aucun bloc ne correspond à la recherche.'
                        : 'Aucun bloc disponible. Créez votre premier bloc.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBlocks.map((block) => (
                    <TableRow key={block.BlockId}>
                      <TableCell className="font-medium">{block.BlockCode}</TableCell>
                      <TableCell>{block.Title || '-'}</TableCell>
                      <TableCell>{pageNameMap.get(block.PageId) || '-'}</TableCell>
                      <TableCell>{block.LayoutRegion || '-'}</TableCell>
                      <TableCell>
                        {block.IsReusable === 1 ? (
                          <Badge variant="default" className="bg-blue-500">
                            Oui
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {block.Status === 'active' ? (
                          <Badge variant="default" className="bg-green-500">
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{block.Status || '-'}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{block.SortOrder ?? '-'}</TableCell>
                      <TableCell className="text-sm">
                        {block.CreatedAt
                          ? new Date(block.CreatedAt.date).toLocaleDateString('fr-FR')
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
                            <DropdownMenuItem onClick={() => handleEditBlock(block)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteBlock(block)}
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

      <BlockDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        block={editingBlock}
        onSubmit={handleSubmit}
        isLoading={createBlockMutation.isPending || updateBlockMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le bloc "{blockToDelete?.BlockCode}" ? Cette
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

export default Blocks;
