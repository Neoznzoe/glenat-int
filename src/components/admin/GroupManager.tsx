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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, Plus, UserPlus2 } from 'lucide-react';
import {
  useAddUserToGroup,
  useCreateGroup,
  type UserAccount,
  type GroupMember,
} from '@/hooks/useAdminData';
import type { GroupDefinition } from '@/lib/access-control';

interface GroupManagerProps {
  groups: GroupDefinition[];
  users: UserAccount[];
  memberships: GroupMember[];
  isLoading?: boolean;
}

export function GroupManager({ groups, users, memberships, isLoading }: GroupManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [activeGroupPopover, setActiveGroupPopover] = useState<string | null>(null);

  const createGroupMutation = useCreateGroup({
    onSuccess: () => {
      setIsCreateOpen(false);
      setNewGroupName('');
    },
  });

  const addUserMutation = useAddUserToGroup({
    onSuccess: () => {
      setActiveGroupPopover(null);
    },
  });

  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  const membersByGroup = useMemo(() => {
    const map = new Map<string, UserAccount[]>();
    for (const membership of memberships) {
      const user = usersById.get(membership.userId);
      if (!user) {
        continue;
      }
      if (!map.has(membership.groupId)) {
        map.set(membership.groupId, []);
      }
      map.get(membership.groupId)!.push(user);
    }
    for (const [groupId, members] of map) {
      members.sort((left, right) =>
        left.displayName.localeCompare(right.displayName, 'fr', { sensitivity: 'base' }),
      );
      map.set(groupId, members);
    }
    return map;
  }, [memberships, usersById]);

  const handleCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      toast.error('Nom du groupe requis', {
        description: 'Veuillez indiquer un nom avant de créer le groupe.',
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

  const handleAddMember = async (groupId: string, userId: string) => {
    const user = usersById.get(userId);
    const group = groups.find((candidate) => candidate.id === groupId);
    try {
      await addUserMutation.mutateAsync({ groupId, userId });
      toast.success('Collaborateur ajouté', {
        description: user && group ? `${user.displayName} rejoint « ${group.name} ».` : undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error("Impossible d'ajouter le collaborateur", { description: message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Groupes métiers</CardTitle>
          <CardDescription>
            Créez un groupe ou associez des collaborateurs pour synchroniser leurs droits communs.
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
              {groups.map((group) => {
                const members = membersByGroup.get(group.id) ?? [];
                const memberIds = new Set(members.map((member) => member.id));
                const availableUsers = users.filter((user) => !memberIds.has(user.id));

                return (
                  <div key={group.id} className="rounded-lg border bg-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-base">{group.name}</span>
                          <Badge variant="outline" className={cn('border text-xs', group.accentColor)}>
                            {members.length} membre{members.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        {group.description ? (
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        ) : null}
                        <div className="text-xs text-muted-foreground">
                          {group.defaultPermissions.length} accès par défaut
                        </div>
                      </div>
                      <Popover
                        open={activeGroupPopover === group.id}
                        onOpenChange={(open) => setActiveGroupPopover(open ? group.id : null)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={!availableUsers.length || addUserMutation.isPending}
                          >
                            {addUserMutation.isPending && activeGroupPopover === group.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus2 className="h-4 w-4" />
                            )}
                            Ajouter
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0" align="end">
                          <Command>
                            <CommandInput placeholder="Rechercher un collaborateur…" />
                            <CommandEmpty>Aucun collaborateur disponible.</CommandEmpty>
                            <CommandGroup heading="Collaborateurs">
                              {availableUsers.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  value={user.displayName}
                                  onSelect={() => handleAddMember(group.id, user.id)}
                                >
                                  <span className="truncate">{user.displayName}</span>
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    {user.department || user.email}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="mt-3">
                      {members.length ? (
                        <div className="flex flex-wrap gap-2">
                          {members.map((member) => (
                            <Badge key={`${group.id}-${member.id}`} variant="secondary" className="text-xs">
                              {member.displayName}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Aucun collaborateur n’est associé à ce groupe pour le moment.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Nouveau groupe</DialogTitle>
              <DialogDescription>
                Saisissez un intitulé explicite pour que les équipes identifient rapidement ce groupe.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Ex. Communication interne"
              value={newGroupName}
              autoFocus
              onChange={(event) => setNewGroupName(event.target.value)}
            />
            <DialogFooter className="gap-2 sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createGroupMutation.isPending} className="gap-2">
                {createGroupMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Créer le groupe
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
