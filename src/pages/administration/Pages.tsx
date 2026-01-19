import { useState, useMemo } from 'react';
import { FileText, Plus, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  useCmsPages,
  useCreateCmsPage,
  useUpdateCmsPage,
  useDeleteCmsPage,
} from '@/hooks/useCmsPages';
import type { Page, CreatePagePayload } from '@/hooks/useCmsPages';
import { PageDialog } from '@/components/admin/PageDialog';
import { fetchAllModulesFromCms } from '@/lib/adminApi';
import { useQuery } from '@tanstack/react-query';

export function Pages() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

  const { data: pages = [], isLoading, refetch } = useCmsPages();
  const { data: modules = [] } = useQuery({
    queryKey: ['cms', 'all-modules'],
    queryFn: fetchAllModulesFromCms,
    staleTime: 5 * 60 * 1000,
  });
  const createPageMutation = useCreateCmsPage();
  const updatePageMutation = useUpdateCmsPage();
  const deletePageMutation = useDeleteCmsPage();

  // Create a map of moduleId -> moduleName for quick lookup
  const moduleNameMap = useMemo(() => {
    const map = new Map<string, string>();
    modules.forEach((module) => {
      map.set(module.moduleId.toString(), module.moduleName);
    });
    return map;
  }, [modules]);

  const filteredPages = useMemo(() => {
    if (!search.trim()) {
      return pages;
    }
    const lowerSearch = search.toLowerCase().trim();
    return pages.filter((page) => {
      const searchableText = [
        page.PageCode,
        page.PageName,
        page.PageType,
        page.TemplateKey,
        page.Description,
        page.MetaTitle,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(lowerSearch);
    });
  }, [pages, search]);

  const handleCreatePage = () => {
    setEditingPage(null);
    setDialogOpen(true);
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setDialogOpen(true);
  };

  const handleDeletePage = (page: Page) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreatePagePayload) => {
    try {
      if (editingPage) {
        await updatePageMutation.mutateAsync({
          pageId: editingPage.PageId,
          payload: data,
        });
        toast.success('Page mise à jour', {
          description: `La page "${data.PageName}" a été mise à jour avec succès.`,
        });
      } else {
        await createPageMutation.mutateAsync(data);
        toast.success('Page créée', {
          description: `La page "${data.PageName}" a été créée avec succès.`,
        });
      }
      setDialogOpen(false);
      setEditingPage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(editingPage ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création', {
        description: message,
      });
    }
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;

    try {
      await deletePageMutation.mutateAsync(pageToDelete.PageId);
      toast.success('Page supprimée', {
        description: `La page "${pageToDelete.PageName}" a été supprimée avec succès.`,
      });
      setDeleteDialogOpen(false);
      setPageToDelete(null);
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
      description: 'La liste des pages a été actualisée.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">Administration des pages</h1>
        </div>
        <p className="text-muted-foreground">
          Gérez les pages CMS et leurs paramètres de configuration.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Button onClick={handleCreatePage} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer une page
          </Button>
          <Input
            placeholder="Rechercher une page..."
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
          <CardTitle>Liste des pages ({filteredPages.length})</CardTitle>
          <CardDescription>Gérez les pages et leurs paramètres de configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Publiée</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Chargement des pages...
                    </TableCell>
                  </TableRow>
                ) : filteredPages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {search.trim()
                        ? 'Aucune page ne correspond à la recherche.'
                        : 'Aucune page disponible. Créez votre première page.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPages.map((page) => (
                    <TableRow key={page.PageId}>
                      <TableCell className="font-medium">{page.PageCode}</TableCell>
                      <TableCell>{page.PageName}</TableCell>
                      <TableCell>{moduleNameMap.get(page.ModuleId) || '-'}</TableCell>
                      <TableCell>
                        {page.IsActive === 1 ? (
                          <Badge variant="default" className="bg-green-500">
                            Oui
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {page.IsPublished === 1 ? (
                          <Badge variant="default" className="bg-blue-500">
                            Oui
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell>{page.DisplayOrder ?? '-'}</TableCell>
                      <TableCell className="text-sm">
                        {page.CreatedAt
                          ? new Date(page.CreatedAt.date).toLocaleDateString('fr-FR')
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
                            <DropdownMenuItem onClick={() => handleEditPage(page)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePage(page)}
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

      <PageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        page={editingPage}
        onSubmit={handleSubmit}
        isLoading={createPageMutation.isPending || updatePageMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la page "{pageToDelete?.PageCode}" ? Cette action
              est irréversible.
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

export default Pages;
