import { useState, useMemo } from 'react';
import { FolderKanban, Plus, RefreshCw, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import type { Project, CreateProjectPayload } from '@/hooks/useProjects';
import { ProjectDialog } from '@/components/admin/ProjectDialog';

export function Projects() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { data: projects = [], isLoading, refetch } = useProjects();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const filteredProjects = useMemo(() => {
    if (!search.trim()) {
      return projects;
    }
    const lowerSearch = search.toLowerCase().trim();
    return projects.filter((project) => {
      const searchableText = [
        project.ProjectCode,
        project.ProjectName,
        project.Company,
        project.Domain,
        project.DomainSub,
        project.Uri,
        project.WebsiteBrand,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(lowerSearch);
    });
  }, [projects, search]);

  const handleCreateProject = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateProjectPayload) => {
    try {
      if (editingProject) {
        await updateProjectMutation.mutateAsync({
          projectId: editingProject.ProjectId,
          payload: data,
        });
        toast.success('Projet mis à jour', {
          description: `Le projet "${data.ProjectName}" a été mis à jour avec succès.`,
        });
      } else {
        await createProjectMutation.mutateAsync(data);
        toast.success('Projet créé', {
          description: `Le projet "${data.ProjectName}" a été créé avec succès.`,
        });
      }
      setDialogOpen(false);
      setEditingProject(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(
        editingProject ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création',
        {
          description: message,
        },
      );
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProjectMutation.mutateAsync(projectToDelete.ProjectId);
      toast.success('Projet supprimé', {
        description: `Le projet "${projectToDelete.ProjectName}" a été supprimé avec succès.`,
      });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
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
      description: 'La liste des projets a été actualisée.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">
            Administration des projets
          </h1>
        </div>
        <p className="text-muted-foreground">
          Gérez les informations et les paramètres des projets dans la base de données.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Button onClick={handleCreateProject} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un projet
          </Button>
          <Input
            placeholder="Rechercher un projet..."
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
          <CardTitle>Liste des projets ({filteredProjects.length})</CardTitle>
          <CardDescription>
            Gérez les projets et leurs paramètres de configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>URI</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Chargement des projets...
                    </TableCell>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {search.trim()
                        ? 'Aucun projet ne correspond à la recherche.'
                        : 'Aucun projet disponible. Créez votre premier projet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.ProjectId}>
                      <TableCell className="font-medium">{project.ProjectCode}</TableCell>
                      <TableCell>{project.ProjectName}</TableCell>
                      <TableCell>{project.Company || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {project.Uri || '-'}
                      </TableCell>
                      <TableCell>
                        {project.DomainSub && project.Domain
                          ? `${project.DomainSub}.${project.Domain}`
                          : project.Domain || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {project.CreatedAt
                          ? new Date(project.CreatedAt.date).toLocaleDateString('fr-FR')
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
                            <DropdownMenuItem onClick={() => handleEditProject(project)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProject(project)}
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

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        onSubmit={handleSubmit}
        isLoading={createProjectMutation.isPending || updateProjectMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le projet "{projectToDelete?.ProjectCode}" ?
              Cette action est irréversible.
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

export default Projects;
