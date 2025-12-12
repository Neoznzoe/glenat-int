import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';
import type { Zone, CreateZonePayload } from '@/hooks/useZones';

interface ZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: Zone | null;
  onSubmit: (data: CreateZonePayload) => Promise<void>;
  isLoading?: boolean;
}

export function ZoneDialog({ open, onOpenChange, zone, onSubmit, isLoading }: ZoneDialogProps) {
  const { data: projects = [], isLoading: loadingProjects } = useProjects();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateZonePayload>({
    defaultValues: {
      ZoneCode: '',
      ZoneName: '',
      ProjectId: '1',
      TemplateKey: null,
      DefaultLanguage: 'fr-FR',
      DefaultSiteZone: 0,
      AuthorizedLanguages: 'fr-FR,en-US',
      DefaultTimeZone: 'Europe/Paris',
      CacheControl: 'no-cache',
    },
  });

  const isDefault = watch('DefaultSiteZone');

  useEffect(() => {
    if (zone) {
      reset({
        ZoneCode: zone.ZoneCode,
        ZoneName: zone.ZoneName,
        ProjectId: zone.ProjectId,
        TemplateKey: zone.TemplateKey,
        DefaultLanguage: zone.DefaultLanguage,
        DefaultSiteZone: zone.DefaultSiteZone,
        AuthorizedLanguages: zone.AuthorizedLanguages,
        DefaultTimeZone: zone.DefaultTimeZone,
        CacheControl: zone.CacheControl,
      });
    } else {
      reset({
        ZoneCode: '',
        ZoneName: '',
        ProjectId: '1',
        TemplateKey: null,
        DefaultLanguage: 'fr-FR',
        DefaultSiteZone: 0,
        AuthorizedLanguages: 'fr-FR,en-US',
        DefaultTimeZone: 'Europe/Paris',
        CacheControl: 'no-cache',
      });
    }
  }, [zone, reset]);

  const handleFormSubmit = async (data: CreateZonePayload) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{zone ? 'Modifier la zone' : 'Créer une zone'}</DialogTitle>
          <DialogDescription>
            {zone
              ? 'Modifiez les paramètres de la zone.'
              : 'Créez une nouvelle zone avec ses paramètres.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ZoneCode">Code de la zone</Label>
              <Input
                id="ZoneCode"
                placeholder="Ex: public, admin, debug"
                {...register('ZoneCode', { required: 'Le code de la zone est requis' })}
              />
              {errors.ZoneCode && (
                <p className="text-sm text-destructive">{errors.ZoneCode.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ZoneName">Nom de la zone</Label>
              <Input
                id="ZoneName"
                placeholder="Ex: Zone publique"
                {...register('ZoneName', { required: 'Le nom de la zone est requis' })}
              />
              {errors.ZoneName && (
                <p className="text-sm text-destructive">{errors.ZoneName.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ProjectId">Projet</Label>
              <Controller
                name="ProjectId"
                control={control}
                rules={{ required: 'Le projet est requis' }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loadingProjects}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un projet" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.ProjectId} value={project.ProjectId}>
                          {project.ProjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ProjectId && (
                <p className="text-sm text-destructive">{errors.ProjectId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="DefaultLanguage">Langue par défaut</Label>
              <Input
                id="DefaultLanguage"
                placeholder="Ex: fr-FR, en-US"
                {...register('DefaultLanguage', { required: 'La langue par défaut est requise' })}
              />
              {errors.DefaultLanguage && (
                <p className="text-sm text-destructive">{errors.DefaultLanguage.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="DefaultSiteZone"
                checked={isDefault === 1}
                onCheckedChange={(checked) => setValue('DefaultSiteZone', checked ? 1 : 0)}
              />
              <Label htmlFor="DefaultSiteZone" className="cursor-pointer">
                Zone par défaut
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="AuthorizedLanguages">Langues autorisées</Label>
              <Input
                id="AuthorizedLanguages"
                placeholder="Ex: fr-FR,en-US"
                {...register('AuthorizedLanguages', {
                  required: 'Les langues autorisées sont requises',
                })}
              />
              {errors.AuthorizedLanguages && (
                <p className="text-sm text-destructive">{errors.AuthorizedLanguages.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="DefaultTimeZone">Fuseau horaire par défaut</Label>
              <Input
                id="DefaultTimeZone"
                placeholder="Ex: Europe/Paris, UTC"
                {...register('DefaultTimeZone')}
              />
              {errors.DefaultTimeZone && (
                <p className="text-sm text-destructive">{errors.DefaultTimeZone.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="CacheControl">Contrôle du cache</Label>
              <Input
                id="CacheControl"
                placeholder="Ex: public, max-age=3600, no-cache"
                {...register('CacheControl')}
              />
              {errors.CacheControl && (
                <p className="text-sm text-destructive">{errors.CacheControl.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : zone ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
