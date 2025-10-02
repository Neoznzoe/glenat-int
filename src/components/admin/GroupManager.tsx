import { useMemo, useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { useCreateGroup } from '@/hooks/useAdminData';
import type { GroupDefinition } from '@/lib/access-control';

interface GroupManagerProps {
  groups: GroupDefinition[];
  isLoading?: boolean;
}

export function GroupManager({ groups, isLoading }: GroupManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const normalizeName = (value: string) =>
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const normalizedExistingNames = useMemo(() => {
    return new Set(groups.map((group) => normalizeName(group.name)));
  }, [groups]);

  const createGroupMutation = useCreateGroup({
    onSuccess: () => {
      setIsCreateOpen(false);
      setNewGroupName('');
    },
  });

  const handleCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      toast.error('Nom du groupe requis', {
        description: 'Veuillez indiquer un nom avant de créer le groupe.',
      });
      return;
    }
    const normalizedName = normalizeName(trimmed);
    if (normalizedExistingNames.has(normalizedName)) {
      toast.error('Nom déjà utilisé', {
        description: 'Un groupe avec ce nom existe déjà.',
      });
      return;
    }
    try {
      await createGroupMutation.mutateAsync(trimmed);
      toast.success('Groupe créé', {
        description: `« ${trimmed} » est désormais disponible.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error('Impossible de créer le groupe', { description: message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Groupes métiers</CardTitle>
          <CardDescription>
            Consultez les groupes métiers existants et ajoutez-en de nouveaux au besoin.
          </CardDescription>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau groupe
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement des groupes…
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun groupe n’est défini pour le moment.</p>
        ) : (
          <ScrollArea className="max-h-[480px] pr-4">
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.id} className="rounded-lg border bg-card p-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-base">{group.name}</span>
                      <Badge variant="outline" className={cn('border text-xs', group.accentColor)}>
                        {group.defaultPermissions.length} accès par défaut
                      </Badge>
                    </div>
                    {group.description ? (
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau groupe</DialogTitle>
            <DialogDescription>Définissez le nom du groupe métier à créer.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="group-name" className="text-sm font-medium">
                Nom du groupe
              </label>
              <Input
                id="group-name"
                value={newGroupName}
                onChange={(event) => setNewGroupName(event.target.value)}
                placeholder="Saisissez un nom de groupe"
                disabled={createGroupMutation.isPending}
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createGroupMutation.isPending} className="gap-2">
                {createGroupMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Créer le groupe
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
