import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { useCmsPages } from '@/hooks/useCmsPages';
import type { Block, CreateBlockPayload } from '@/hooks/useCmsBlocks';

interface BlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block?: Block | null;
  onSubmit: (data: CreateBlockPayload) => Promise<void>;
  isLoading?: boolean;
}

export function BlockDialog({ open, onOpenChange, block, onSubmit, isLoading }: BlockDialogProps) {
  const { data: pages = [], isLoading: loadingPages } = useCmsPages();

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<CreateBlockPayload>({
    defaultValues: {
      PageId: '',
      BlockCode: '',
      Title: null,
      LayoutRegion: null,
      SortOrder: null,
      IsReusable: 0,
      Status: 'active',
      ContentDefinition: null,
    },
  });

  const isReusable = watch('IsReusable');

  useEffect(() => {
    if (block) {
      reset({
        PageId: block.PageId,
        BlockCode: block.BlockCode,
        Title: block.Title,
        LayoutRegion: block.LayoutRegion,
        SortOrder: block.SortOrder,
        IsReusable: block.IsReusable,
        Status: block.Status,
        ContentDefinition: block.ContentDefinition,
      });
    } else {
      reset({
        PageId: pages.length > 0 ? pages[0].PageId : '',
        BlockCode: '',
        Title: null,
        LayoutRegion: null,
        SortOrder: null,
        IsReusable: 0,
        Status: 'active',
        ContentDefinition: null,
      });
    }
  }, [block, reset, pages]);

  const handleFormSubmit = async (data: CreateBlockPayload) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{block ? 'Modifier le bloc' : 'Créer un bloc'}</DialogTitle>
          <DialogDescription>
            {block
              ? 'Modifiez les paramètres du bloc.'
              : 'Créez un nouveau bloc avec ses paramètres.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="BlockCode">Code du bloc *</Label>
              <Input
                id="BlockCode"
                placeholder="Ex: HEADER, SIDEBAR, CONTENT"
                {...register('BlockCode', { required: 'Le code du bloc est requis' })}
              />
              {errors.BlockCode && (
                <p className="text-sm text-destructive">{errors.BlockCode.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="Title">Titre</Label>
              <Input
                id="Title"
                placeholder="Ex: Bloc d'en-tête"
                {...register('Title')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="PageId">Page *</Label>
              <Controller
                name="PageId"
                control={control}
                rules={{ required: 'La page est requise' }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loadingPages}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une page" />
                    </SelectTrigger>
                    <SelectContent>
                      {pages.map((page) => (
                        <SelectItem key={page.PageId} value={page.PageId}>
                          {page.PageName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.PageId && (
                <p className="text-sm text-destructive">{errors.PageId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="LayoutRegion">Région du layout</Label>
              <Input
                id="LayoutRegion"
                placeholder="Ex: header, sidebar, main, footer"
                {...register('LayoutRegion')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="Status">Statut</Label>
              <Input
                id="Status"
                placeholder="Ex: active, draft, archived"
                {...register('Status')}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="IsReusable"
                checked={isReusable === 1}
                onCheckedChange={(checked) => setValue('IsReusable', checked ? 1 : 0)}
              />
              <Label htmlFor="IsReusable" className="cursor-pointer">
                Bloc réutilisable
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="SortOrder">Ordre d'affichage</Label>
              <Input
                id="SortOrder"
                type="number"
                placeholder="Ex: 1"
                {...register('SortOrder', {
                  setValueAs: (v) => (v === '' ? null : parseInt(v)),
                })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ContentDefinition">Définition du contenu (JSON)</Label>
              <Textarea
                id="ContentDefinition"
                placeholder='Ex: {"type": "text", "fields": [...]}'
                {...register('ContentDefinition')}
                rows={3}
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
              {isLoading ? 'Enregistrement...' : block ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
