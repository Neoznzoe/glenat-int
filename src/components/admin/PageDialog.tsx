import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { useCmsModules } from '@/hooks/useCmsModules';
import type { Page, CreatePagePayload } from '@/hooks/useCmsPages';

interface PageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page?: Page | null;
  onSubmit: (data: CreatePagePayload) => Promise<void>;
  isLoading?: boolean;
}

export function PageDialog({ open, onOpenChange, page, onSubmit, isLoading }: PageDialogProps) {
  const { data: modules = [], isLoading: loadingModules } = useCmsModules();

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<CreatePagePayload>({
    defaultValues: { PageCode: '', PageName: '', ModuleId: '', PageType: null, TemplateKey: null, Description: null, IsActive: 1, IsPublished: 0, DisplayOrder: null, MetaTitle: null, MetaDescription: null, MetaKeywords: null, CacheControl: 'no-cache', },
  });
  const isActive = watch('IsActive');
  const isPublished = watch('IsPublished');

  useEffect(() => {
    if (page) {
      reset({ PageCode: page.PageCode, PageName: page.PageName, ModuleId: page.ModuleId, PageType: page.PageType, TemplateKey: page.TemplateKey, Description: page.Description, IsActive: page.IsActive, IsPublished: page.IsPublished, DisplayOrder: page.DisplayOrder, MetaTitle: page.MetaTitle, MetaDescription: page.MetaDescription, MetaKeywords: page.MetaKeywords, CacheControl: page.CacheControl, });
    } else {
      reset({ PageCode: '', PageName: '', ModuleId: modules.length > 0 ? modules[0].ModuleId : '', PageType: null, TemplateKey: null, Description: null, IsActive: 1, IsPublished: 0, DisplayOrder: null, MetaTitle: null, MetaDescription: null, MetaKeywords: null, CacheControl: 'no-cache', });
    }
  }, [page, reset, modules]);

  const handleFormSubmit = async (data: CreatePagePayload) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{page ? 'Modifier la page' : 'Créer une page'}</DialogTitle>
          <DialogDescription>
            {page
              ? 'Modifiez les paramètres de la page.'
              : 'Créez une nouvelle page avec ses paramètres.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="PageCode">Code de la page *</Label>
              <Input id="PageCode" placeholder="Ex: HOME, ABOUT, CONTACT" {...register('PageCode', { required: 'Le code de la page est requis' })} />
              {errors.PageCode && (
                <p className="text-sm text-destructive">{errors.PageCode.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="PageName">Nom de la page *</Label>
              <Input id="PageName" placeholder="Ex: Page d'accueil" {...register('PageName', { required: 'Le nom de la page est requis' })} />
              {errors.PageName && (
                <p className="text-sm text-destructive">{errors.PageName.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ModuleId">Module *</Label>
              <Controller name="ModuleId" control={control} rules={{ required: 'Le module est requis' }} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={loadingModules}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module.ModuleId} value={module.ModuleId}>
                          {module.ModuleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ModuleId && (
                <p className="text-sm text-destructive">{errors.ModuleId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="PageType">Type de page</Label>
              <Input id="PageType" placeholder="Ex: static, dynamic" {...register('PageType')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="TemplateKey">Template Key</Label>
              <Input id="TemplateKey" placeholder="Ex: template_home" {...register('TemplateKey')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="Description">Description</Label>
              <Textarea id="Description" placeholder="Ex: Page d'accueil du site" {...register('Description')} rows={3} />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch id="IsActive" checked={isActive === 1} onCheckedChange={(checked) => setValue('IsActive', checked ? 1 : 0)} />
                <Label htmlFor="IsActive" className="cursor-pointer">
                  Page active
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="IsPublished" checked={isPublished === 1} onCheckedChange={(checked) => setValue('IsPublished', checked ? 1 : 0)} />
                <Label htmlFor="IsPublished" className="cursor-pointer">
                  Page publiée
                </Label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="DisplayOrder">Ordre d'affichage</Label>
              <Input id="DisplayOrder" type="number" placeholder="Ex: 1" {...register('DisplayOrder', { setValueAs: (v) => (v === '' ? null : parseInt(v)) })} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="MetaTitle">Meta Title</Label>
              <Input id="MetaTitle" placeholder="Ex: Accueil - Glénat" {...register('MetaTitle')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="MetaDescription">Meta Description</Label>
              <Textarea id="MetaDescription" placeholder="Ex: Bienvenue sur le site de Glénat" {...register('MetaDescription')} rows={2} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="MetaKeywords">Meta Keywords</Label>
              <Input id="MetaKeywords" placeholder="Ex: glénat, édition, bd, manga" {...register('MetaKeywords')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="CacheControl">Contrôle du cache</Label>
              <Input id="CacheControl" placeholder="Ex: public, max-age=3600, no-cache" {...register('CacheControl')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : page ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
