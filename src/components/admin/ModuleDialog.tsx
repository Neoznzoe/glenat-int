import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { useZones } from '@/hooks/useZones';
import type { Module, CreateModulePayload } from '@/hooks/useCmsModules';

interface ModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: Module | null;
  onSubmit: (data: CreateModulePayload) => Promise<void>;
  isLoading?: boolean;
}

export function ModuleDialog({
  open,
  onOpenChange,
  module,
  onSubmit,
  isLoading,
}: ModuleDialogProps) {
  const { data: zones = [], isLoading: loadingZones } = useZones();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateModulePayload>({
    defaultValues: {
      ModuleCode: '',
      ModuleName: '',
      ZoneId: '',
      ModuleType: null,
      TemplateKey: null,
      Description: null,
      IsActive: 1,
      DisplayOrder: null,
      CacheControl: 'no-cache',
    },
  });

  const isActive = watch('IsActive');

  useEffect(() => {
    if (module) {
      reset({
        ModuleCode: module.ModuleCode,
        ModuleName: module.ModuleName,
        ZoneId: module.ZoneId,
        ModuleType: module.ModuleType,
        TemplateKey: module.TemplateKey,
        Description: module.Description,
        IsActive: module.IsActive,
        DisplayOrder: module.DisplayOrder,
        CacheControl: module.CacheControl,
      });
    } else {
      reset({
        ModuleCode: '',
        ModuleName: '',
        ZoneId: zones.length > 0 ? zones[0].ZoneId : '',
        ModuleType: null,
        TemplateKey: null,
        Description: null,
        IsActive: 1,
        DisplayOrder: null,
        CacheControl: 'no-cache',
      });
    }
  }, [module, reset, zones]);

  const handleFormSubmit = async (data: CreateModulePayload) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{module ? 'Modifier le module' : 'Créer un module'}</DialogTitle>
          <DialogDescription>
            {module
              ? 'Modifiez les paramètres du module.'
              : 'Créez un nouveau module avec ses paramètres.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="ModuleCode">Code du module *</Label>
              <Input
                id="ModuleCode"
                placeholder="Ex: CATALOGUE, EVENTS"
                {...register('ModuleCode', { required: 'Le code du module est requis' })}
              />
              {errors.ModuleCode && (
                <p className="text-sm text-destructive">{errors.ModuleCode.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ModuleName">Nom du module *</Label>
              <Input
                id="ModuleName"
                placeholder="Ex: Module Catalogue"
                {...register('ModuleName', { required: 'Le nom du module est requis' })}
              />
              {errors.ModuleName && (
                <p className="text-sm text-destructive">{errors.ModuleName.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ZoneId">Zone *</Label>
              <Controller
                name="ZoneId"
                control={control}
                rules={{ required: 'La zone est requise' }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loadingZones}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.ZoneId} value={zone.ZoneId}>
                          {zone.ZoneName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ZoneId && (
                <p className="text-sm text-destructive">{errors.ZoneId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ModuleType">Type de module</Label>
              <Input
                id="ModuleType"
                placeholder="Ex: content, navigation"
                {...register('ModuleType')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="TemplateKey">Template Key</Label>
              <Input
                id="TemplateKey"
                placeholder="Ex: template_catalogue"
                {...register('TemplateKey')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="Description">Description</Label>
              <Input
                id="Description"
                placeholder="Ex: Module de gestion du catalogue"
                {...register('Description')}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="IsActive"
                checked={isActive === 1}
                onCheckedChange={(checked) => setValue('IsActive', checked ? 1 : 0)}
              />
              <Label htmlFor="IsActive" className="cursor-pointer">
                Module actif
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="DisplayOrder">Ordre d'affichage</Label>
              <Input
                id="DisplayOrder"
                type="number"
                placeholder="Ex: 1"
                {...register('DisplayOrder', {
                  setValueAs: (v) => (v === '' ? null : parseInt(v)),
                })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="CacheControl">Contrôle du cache</Label>
              <Input
                id="CacheControl"
                placeholder="Ex: public, max-age=3600, no-cache"
                {...register('CacheControl')}
              />
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
              {isLoading ? 'Enregistrement...' : module ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
