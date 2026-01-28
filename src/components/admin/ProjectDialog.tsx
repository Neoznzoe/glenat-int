import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Project, CreateProjectPayload } from '@/hooks/useProjects';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSubmit: (data: CreateProjectPayload) => Promise<void>;
  isLoading?: boolean;
}

export function ProjectDialog({ open, onOpenChange, project, onSubmit, isLoading}: ProjectDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateProjectPayload>({
    defaultValues: { ProjectCode: '', ProjectName: '', Company: '', Version: '', ProjectType: '', Uri: '', MemoryLimit: '', Domain: '', DomainSub: '', AssistanceEmail: '', WebsiteBrand: '' },
  });

  useEffect(() => {
    if (project) {
      reset({ ProjectCode: project.ProjectCode, ProjectName: project.ProjectName, Company: project.Company || '', Version: project.Version || '', ProjectType: project.ProjectType || '', Uri: project.Uri || '', MemoryLimit: project.MemoryLimit || '', Domain: project.Domain || '', DomainSub: project.DomainSub || '', AssistanceEmail: project.AssistanceEmail || '', WebsiteBrand: project.WebsiteBrand || '' });
    } else {
      reset({ ProjectCode: '', ProjectName: '', Company: '', Version: '', ProjectType: '', Uri: '', MemoryLimit: '', Domain: '', DomainSub: '', AssistanceEmail: '', WebsiteBrand: '' });
    }
  }, [project, reset]);

  const handleFormSubmit = async (data: CreateProjectPayload) => { await onSubmit(data); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{project ? 'Modifier le projet' : 'Créer un projet'}</DialogTitle>
          <DialogDescription>
            {project
              ? 'Modifiez les paramètres du projet.'
              : 'Créez un nouveau projet avec ses paramètres.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="ProjectCode">Code du projet *</Label>
              <Input id="ProjectCode" placeholder="Ex: INTRANET, WEBSITE" {...register('ProjectCode', { required: 'Le code du projet est requis' })} />
              {errors.ProjectCode && (
                <p className="text-sm text-destructive">{errors.ProjectCode.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ProjectName">Nom du projet *</Label>
              <Input id="ProjectName" placeholder="Ex: Intranet Glénat" {...register('ProjectName', { required: 'Le nom du projet est requis' })} />
              {errors.ProjectName && (
                <p className="text-sm text-destructive">{errors.ProjectName.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="Company">Entreprise</Label>
              <Input id="Company" placeholder="Ex: Glénat" {...register('Company')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="Version">Version</Label>
              <Input id="Version" placeholder="Ex: 1.0.0" {...register('Version')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ProjectType">Type de projet</Label>
              <Input id="ProjectType" placeholder="Ex: Web, API" {...register('ProjectType')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="Uri">URI</Label>
              <Input id="Uri" placeholder="Ex: https://intranet.glenat.com" {...register('Uri')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="MemoryLimit">Limite mémoire</Label>
              <Input id="MemoryLimit" placeholder="Ex: 256M" {...register('MemoryLimit')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="Domain">Domaine</Label>
              <Input id="Domain" placeholder="Ex: glenat.com" {...register('Domain')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="DomainSub">Sous-domaine</Label>
              <Input id="DomainSub" placeholder="Ex: intranet" {...register('DomainSub')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="AssistanceEmail">Email d'assistance</Label>
              <Input id="AssistanceEmail" type="email" placeholder="Ex: support@glenat.com" {...register('AssistanceEmail')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="WebsiteBrand">Marque du site</Label>
              <Input id="WebsiteBrand" placeholder="Ex: Glénat Intranet" {...register('WebsiteBrand')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : project ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
