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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ApiUserRecord } from '@/lib/adminApi';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: ApiUserRecord | null;
  onSave: (userData: Partial<ApiUserRecord>) => void;
  isLoading?: boolean;
}

export function UserDialog({ open, onOpenChange, user, onSave, isLoading }: UserDialogProps) {
  const isEdit = Boolean(user);
  const [formData, setFormData] = useState<Partial<ApiUserRecord>>({
    UserId: user?.UserId || '',
    DisplayName: user?.DisplayName || '',
    Email: user?.Email || '',
    ProjectId: user?.ProjectId || 1,
    Status: user?.Status || 'ACTIVE',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        UserId: user?.UserId || '',
        DisplayName: user?.DisplayName || '',
        Email: user?.Email || '',
        ProjectId: user?.ProjectId || 1,
        Status: user?.Status || 'ACTIVE',
      });
    }
  }, [open, user]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof ApiUserRecord, value: string | number | undefined) => {
    setFormData((prev: Partial<ApiUserRecord>) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifiez les informations de l\'utilisateur.'
              : 'Ajoutez un nouvel utilisateur dans le système.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">ID Utilisateur *</Label>
              <Input
                id="userId"
                placeholder="intranet\username"
                value={formData.UserId}
                onChange={(e) => handleChange('UserId', e.target.value)}
                required
                disabled={isEdit}
              />
              <p className="text-xs text-muted-foreground">
                Format: intranet\username (exemple: intranet\jean.dupont)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="displayName">Nom d'affichage *</Label>
              <Input
                id="displayName"
                placeholder="Jean Dupont"
                value={formData.DisplayName}
                onChange={(e) => handleChange('DisplayName', e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@glenat.com"
                value={formData.Email}
                onChange={(e) => handleChange('Email', e.target.value)}
                required
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

            <div className="grid gap-2">
              <Label htmlFor="status">Statut *</Label>
              <Select
                value={formData.Status}
                onValueChange={(value) => handleChange('Status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="INACTIVE">Inactif</SelectItem>
                </SelectContent>
              </Select>
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
