import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import { useCmsBlocks } from '@/hooks/useCmsBlocks';
import type { Element, CreateElementPayload } from '@/hooks/useCmsElements';

interface ElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  element?: Element | null;
  onSubmit: (data: CreateElementPayload) => Promise<void>;
  isLoading?: boolean;
}

export function ElementDialog({ open, onOpenChange, element, onSubmit, isLoading }: ElementDialogProps) {
  const { data: blocks = [], isLoading: loadingBlocks } = useCmsBlocks();

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<CreateElementPayload>({
    defaultValues: {
      BlockId: '',
      ElementType: '',
      ElementKey: null,
      Content: null,
      Metadata: null,
      IsActive: 1,
      SortOrder: null,
    },
  });

  const isActive = watch('IsActive');

  useEffect(() => {
    if (element) {
      reset({
        BlockId: element.BlockId,
        ElementType: element.ElementType,
        ElementKey: element.ElementKey,
        Content: element.Content,
        Metadata: element.Metadata,
        IsActive: element.IsActive,
        SortOrder: element.SortOrder,
      });
    } else {
      reset({
        BlockId: blocks.length > 0 ? blocks[0].BlockId : '',
        ElementType: '',
        ElementKey: null,
        Content: null,
        Metadata: null,
        IsActive: 1,
        SortOrder: null,
      });
    }
  }, [element, reset, blocks]);

  const handleFormSubmit = async (data: CreateElementPayload) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{element ? "Modifier l'élément" : 'Créer un élément'}</DialogTitle>
          <DialogDescription>
            {element
              ? "Modifiez les paramètres de l'élément."
              : 'Créez un nouvel élément avec ses paramètres.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="ElementType">Type d'élément *</Label>
              <Input
                id="ElementType"
                placeholder="Ex: text, image, video, html"
                {...register('ElementType', { required: "Le type d'élément est requis" })}
              />
              {errors.ElementType && (
                <p className="text-sm text-destructive">{errors.ElementType.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ElementKey">Clé de l'élément</Label>
              <Input
                id="ElementKey"
                placeholder="Ex: main_title, hero_image"
                {...register('ElementKey')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="BlockId">Bloc *</Label>
              <Controller
                name="BlockId"
                control={control}
                rules={{ required: 'Le bloc est requis' }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loadingBlocks}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un bloc" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map((block) => (
                        <SelectItem key={block.BlockId} value={block.BlockId}>
                          {block.Title || block.BlockCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.BlockId && (
                <p className="text-sm text-destructive">{errors.BlockId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="Content">Contenu</Label>
              <Textarea
                id="Content"
                placeholder="Contenu de l'élément..."
                {...register('Content')}
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="Metadata">Métadonnées (JSON)</Label>
              <Textarea
                id="Metadata"
                placeholder='Ex: {"alt": "Description image", "width": 800}'
                {...register('Metadata')}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="IsActive"
                checked={isActive === 1}
                onCheckedChange={(checked) => setValue('IsActive', checked ? 1 : 0)}
              />
              <Label htmlFor="IsActive" className="cursor-pointer">
                Élément actif
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
              {isLoading ? 'Enregistrement...' : element ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
