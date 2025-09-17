import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { computeEffectivePermissions, type UserAccount } from '@/lib/mockDb';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { GroupDefinition } from '@/lib/access-control';

interface UserListPanelProps {
  filteredUsers: UserAccount[];
  search: string;
  onSearchChange: (value: string) => void;
  showOnlyInactive: boolean;
  onToggleShowOnlyInactive: () => void;
  groups: GroupDefinition[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  isLoading?: boolean;
}

export function UserListPanel({
  filteredUsers,
  search,
  onSearchChange,
  showOnlyInactive,
  onToggleShowOnlyInactive,
  groups,
  selectedUserId,
  onSelectUser,
  isLoading,
}: UserListPanelProps) {
  const groupsById = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle>Collaborateurs</CardTitle>
          <CardDescription>
            Sélectionnez un utilisateur pour consulter et modifier ses autorisations.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Rechercher par nom, email ou service..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="flex-1"
          />
          <Button
            variant={showOnlyInactive ? 'default' : 'outline'}
            size="sm"
            className="sm:whitespace-nowrap"
            onClick={onToggleShowOnlyInactive}
            aria-pressed={showOnlyInactive}
          >
            Afficher les utilisateurs inactifs
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Groupes</TableHead>
                <TableHead className="text-right">Dernière connexion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const isSelected = user.id === selectedUserId;
                const accessCount = computeEffectivePermissions(user, groups).length;

                return (
                  <TableRow
                    key={user.id}
                    data-state={isSelected ? 'selected' : undefined}
                    className={cn('cursor-pointer', isSelected && 'bg-muted/80')}
                    onClick={() => onSelectUser(user.id)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.displayName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.jobTitle} · {user.department}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.groups.map((groupId) => {
                          const group = groupsById.get(groupId);
                          if (!group) {
                            return null;
                          }
                          return (
                            <Badge
                              key={group.id}
                              variant="outline"
                              className={cn('border text-xs', group.accentColor)}
                            >
                              {group.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(user.lastConnection), {
                        locale: fr,
                        addSuffix: true,
                      })}
                      <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {accessCount} accès
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!filteredUsers.length && !isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Aucun utilisateur ne correspond à la recherche.
                  </TableCell>
                </TableRow>
              )}
              {isLoading && !filteredUsers.length && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Chargement des utilisateurs…
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
