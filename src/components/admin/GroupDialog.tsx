import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { ApiGroupRecord } from '@/lib/adminApi';

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: ApiGroupRecord | null;
  onSubmit: (groupData: Partial<ApiGroupRecord>) => void;
  isLoading?: boolean;
}

export function GroupDialog({ open, onOpenChange, group, onSubmit, isLoading }: GroupDialogProps) {
  const isEdit = Boolean(group);
  const [formData, setFormData] = useState<Partial<ApiGroupRecord>>({
    GroupCode: group?.GroupCode || '',
    GroupName: group?.GroupName || '',
    Description: group?.Description || '',
    ProjectId: group?.ProjectId || 1,
    IsSystem: group?.IsSystem ? (typeof group.IsSystem === 'number' ? group.IsSystem === 1 : group.IsSystem) : false,
    IsActive: group?.IsActive ? (typeof group.IsActive === 'number' ? group.IsActive === 1 : group.IsActive) : true,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        GroupCode: group?.GroupCode || '',
        GroupName: group?.GroupName || '',
        Description: group?.Description || '',
        ProjectId: group?.ProjectId || 1,
        IsSystem: group?.IsSystem ? (typeof group.IsSystem === 'number' ? group.IsSystem === 1 : group.IsSystem) : false,
        IsActive: group?.IsActive ? (typeof group.IsActive === 'number' ? group.IsActive === 1 : group.IsActive) : true,
      });
    }
  }, [open, group]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ApiGroupRecord, value: string | number | boolean | undefined) => {
    setFormData((prev: Partial<ApiGroupRecord>) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le groupe' : 'Créer un groupe'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifiez les informations du groupe.'
              : 'Ajoutez un nouveau groupe dans le système.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="groupCode">Code Groupe *</Label>
              <Input
                id="groupCode"
                placeholder="service-informatique"
                value={formData.GroupCode}
                onChange={(e) => handleChange('GroupCode', e.target.value)}
                required
                disabled={isEdit}
              />
              <p className="text-xs text-muted-foreground">
                Identifiant unique du groupe (exemple: service-informatique)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="groupName">Nom du groupe *</Label>
              <Input
                id="groupName"
                placeholder="Service Informatique"
                value={formData.GroupName}
                onChange={(e) => handleChange('GroupName', e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Groupe interne pour l'équipe SI"
                value={formData.Description || ''}
                onChange={(e) => handleChange('Description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="projectId">ID Projet *</Label>
              <Input
                id="projectId"
                type="number"
                placeholder="1"
                value={formData.ProjectId ?? 1}
                onChange={(e) =>
                  handleChange('ProjectId', e.target.value ? Number(e.target.value) : 1)
                }
                required
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={typeof formData.IsActive === 'boolean' ? formData.IsActive : formData.IsActive === 1}
                  onCheckedChange={(checked) => handleChange('IsActive', checked)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Groupe actif
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isSystem"
                  checked={typeof formData.IsSystem === 'boolean' ? formData.IsSystem : formData.IsSystem === 1}
                  onCheckedChange={(checked) => handleChange('IsSystem', checked)}
                />
                <Label htmlFor="isSystem" className="cursor-pointer">
                  Groupe système
                </Label>
              </div>
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
              {isLoading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
