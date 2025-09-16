import { useEffect, useMemo, useState } from 'react';
import {
  useAdminUsers,
  useAdminGroups,
  usePermissionDefinitions,
  useAuditLog,
  useCurrentUser,
  useUpdateUserAccess,
  type PermissionOverride,
  type UserAccount,
} from '@/hooks/useAdminData';
import {
  computeEffectivePermissions,
  evaluatePermission,
  type PermissionOverrideMode,
} from '@/lib/mockDb';
import {
  PERMISSION_DEFINITIONS,
  type GroupDefinition,
  type PermissionDefinition,
  type PermissionKey,
} from '@/lib/access-control';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const PERMISSION_SELECT_OPTIONS: Array<{
  value: PermissionSelectValue;
  label: string;
  description: string;
}> = [
  {
    value: 'inherit',
    label: 'Hérité',
    description: 'Conserver la règle fournie par les groupes ou la base.',
  },
  {
    value: 'allow',
    label: 'Autoriser',
    description: 'Accès accordé explicitement pour cette personne.',
  },
  {
    value: 'deny',
    label: 'Refuser',
    description: 'Bloquer l’accès même si le groupe le permet.',
  },
];

const STATUS_STYLES: Record<'active' | 'inactive', string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200',
  inactive: 'bg-amber-500/10 text-amber-600 border border-amber-200',
};

type PermissionSelectValue = 'inherit' | PermissionOverrideMode;

type DraftState = {
  groups: string[];
  permissionOverrides: PermissionOverride[];
};

function arraysAreEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

function overridesAreEqual(left: PermissionOverride[], right: PermissionOverride[]) {
  if (left.length !== right.length) {
    return false;
  }
  const map = new Map(left.map((override) => [override.key, override.mode]));
  for (const override of right) {
    if (map.get(override.key) !== override.mode) {
      return false;
    }
  }
  return true;
}

function getPermissionSelectValue(
  overrides: PermissionOverride[],
  key: PermissionKey,
): PermissionSelectValue {
  const override = overrides.find((candidate) => candidate.key === key);
  return override ? override.mode : 'inherit';
}

function describePermissionOrigin(
  origin:
    | 'superadmin'
    | 'override-allow'
    | 'override-deny'
    | 'group'
    | 'base'
    | 'none',
  inheritedFrom: string[],
  basePermission: boolean,
) {
  switch (origin) {
    case 'superadmin':
      return 'Super administrateur – accès permanent';
    case 'override-allow':
      return 'Autorisation directe définie pour cet utilisateur';
    case 'override-deny':
      return 'Refus direct défini pour cet utilisateur';
    case 'group':
      return `Hérité des groupes : ${inheritedFrom.join(', ')}`;
    case 'base':
      return basePermission
        ? 'Accès de base fourni à tous les utilisateurs'
        : 'Hérité des règles par défaut';
    case 'none':
    default:
      return inheritedFrom.length
        ? `Refusé (les groupes n’autorisent pas l’accès)`
        : 'Aucun groupe ne fournit cet accès';
  }
}

function mapGroupIdToName(groups: GroupDefinition[], ids: string[]) {
  const byId = new Map(groups.map((group) => [group.id, group.name]));
  return ids.map((id) => byId.get(id) ?? id);
}

export function Administration() {
  const { data: users = [], isLoading: loadingUsers } = useAdminUsers();
  const { data: groups = [], isLoading: loadingGroups } = useAdminGroups();
  const { data: permissions = [], isLoading: loadingPermissions } = usePermissionDefinitions();
  const { data: auditLog = [] } = useAuditLog(12);
  const { data: currentUser } = useCurrentUser();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState>({ groups: [], permissionOverrides: [] });

  const updateUserMutation = useUpdateUserAccess({ actorId: currentUser?.id });

  const lowerSearch = search.trim().toLowerCase();
  const filteredUsers = useMemo(() => {
    if (!lowerSearch) {
      return users;
    }
    return users.filter((user) => {
      const haystack = `${user.displayName} ${user.email} ${user.department}`.toLowerCase();
      return haystack.includes(lowerSearch);
    });
  }, [users, lowerSearch]);

  useEffect(() => {
    if (!users.length) {
      setSelectedUserId(null);
      return;
    }
    if (!selectedUserId || !users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  useEffect(() => {
    if (!filteredUsers.length) {
      return;
    }
    if (!selectedUserId || !filteredUsers.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedUserId]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  useEffect(() => {
    if (!selectedUser) {
      setDraft({ groups: [], permissionOverrides: [] });
      return;
    }
    setDraft({
      groups: [...selectedUser.groups],
      permissionOverrides: [...selectedUser.permissionOverrides],
    });
  }, [selectedUser]);

  const previewUser: UserAccount | null = useMemo(() => {
    if (!selectedUser) {
      return null;
    }
    return {
      ...selectedUser,
      groups: draft.groups,
      permissionOverrides: draft.permissionOverrides,
    };
  }, [selectedUser, draft.groups, draft.permissionOverrides]);

  const permissionDefinitions = useMemo<PermissionDefinition[]>(
    () => (permissions.length ? permissions : PERMISSION_DEFINITIONS),
    [permissions],
  );
  const permissionEvaluations = useMemo(() => {
    if (!previewUser) {
      return [];
    }
    const sourceGroups = groups ?? [];
    return permissionDefinitions.map((definition) => ({
      definition,
      evaluation: evaluatePermission(previewUser, sourceGroups, definition.key),
    }));
  }, [previewUser, groups, permissionDefinitions]);

  const effectivePermissionSet = useMemo(() => {
    if (!previewUser || !groups) {
      return new Set<PermissionKey>();
    }
    return new Set(computeEffectivePermissions(previewUser, groups));
  }, [previewUser, groups]);

  const stats = useMemo(() => {
    if (!groups?.length) {
      return {
        totalUsers: users.length,
        activeUsers: users.filter((user) => user.status === 'active').length,
        adminUsers: 0,
        inactiveUsers: users.filter((user) => user.status === 'inactive').length,
      };
    }
    const adminUsers = users.filter((user) =>
      computeEffectivePermissions(user, groups).includes('administration'),
    ).length;
    return {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.status === 'active').length,
      adminUsers,
      inactiveUsers: users.filter((user) => user.status === 'inactive').length,
    };
  }, [users, groups]);

  const groupsById = useMemo(() => new Map(groups?.map((group) => [group.id, group])), [groups]);
  const permissionsByKey = useMemo(
    () => new Map(permissionDefinitions.map((permission) => [permission.key, permission])),
    [permissionDefinitions],
  );

  const isSuperAdmin = previewUser?.isSuperAdmin ?? false;
  const groupsChanged = selectedUser
    ? !arraysAreEqual(draft.groups, selectedUser.groups)
    : false;
  const overridesChanged = selectedUser
    ? !overridesAreEqual(draft.permissionOverrides, selectedUser.permissionOverrides)
    : false;
  const isDirty = groupsChanged || overridesChanged;

  const isLoading = loadingUsers || loadingGroups || loadingPermissions;

  const handleGroupToggle = (groupId: string, checked: boolean) => {
    setDraft((current) => {
      const next = new Set(current.groups);
      if (checked) {
        next.add(groupId);
      } else {
        next.delete(groupId);
      }
      return {
        ...current,
        groups: Array.from(next),
      };
    });
  };

  const handlePermissionChange = (key: PermissionKey, value: PermissionSelectValue) => {
    setDraft((current) => {
      const overrides = current.permissionOverrides.filter((item) => item.key !== key);
      if (value === 'inherit') {
        return { ...current, permissionOverrides: overrides };
      }
      return {
        ...current,
        permissionOverrides: [...overrides, { key, mode: value }],
      };
    });
  };

  const handleReset = () => {
    if (!selectedUser) {
      return;
    }
    setDraft({
      groups: [...selectedUser.groups],
      permissionOverrides: [...selectedUser.permissionOverrides],
    });
  };

  const handleSave = async () => {
    if (!selectedUser) {
      return;
    }
    try {
      await updateUserMutation.mutateAsync({
        userId: selectedUser.id,
        groups: draft.groups,
        permissionOverrides: draft.permissionOverrides,
      });
      toast.success('Droits mis à jour', {
        description: `${selectedUser.displayName} a été synchronisé avec succès.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error("Impossible d'enregistrer", { description: message });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Administration des accès</h1>
        <p className="text-muted-foreground">
          Gérez les groupes, les exceptions et les droits fins des 300 collaborateurs connectés
          via Office 365.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Utilisateurs</CardDescription>
            <CardTitle className="text-3xl">{stats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {stats.activeUsers} actifs · {stats.inactiveUsers} inactifs
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Groupes métiers</CardDescription>
            <CardTitle className="text-3xl">{groups.length}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {groups.length ? 'Synchronisés avec la base interne' : 'Aucun groupe défini'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accès administration</CardDescription>
            <CardTitle className="text-3xl">{stats.adminUsers}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Collaborateurs disposant du module « Administration »
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dernière mise à jour</CardDescription>
            <CardTitle className="text-3xl">
              {auditLog.length
                ? formatDistanceToNow(new Date(auditLog[0].timestamp), {
                    locale: fr,
                    addSuffix: true,
                  })
                : '—'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {auditLog.length ? auditLog[0].message : 'Aucune activité enregistrée'}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_3fr]">
        <Card className="h-full">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>Collaborateurs</CardTitle>
              <CardDescription>
                Sélectionnez un utilisateur pour consulter et modifier ses autorisations.
              </CardDescription>
            </div>
            <Input
              placeholder="Rechercher par nom, email ou service..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[520px]">
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
                    const isSelected = user.id === selectedUser?.id;
                    const accessCount = groups
                      ? computeEffectivePermissions(user, groups).length
                      : 0;
                    return (
                      <TableRow
                        key={user.id}
                        data-state={isSelected ? 'selected' : undefined}
                        className={cn(
                          'cursor-pointer',
                          isSelected && 'bg-muted/80',
                        )}
                        onClick={() => setSelectedUserId(user.id)}
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
                                  className={cn('border', group.accentColor, 'text-xs')}
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
                  {!filteredUsers.length && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                        Aucun utilisateur ne correspond à la recherche.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>
                  {selectedUser ? selectedUser.displayName : 'Sélectionnez un utilisateur'}
                </CardTitle>
                <CardDescription>
                  {selectedUser
                    ? `${selectedUser.jobTitle} — ${selectedUser.department}`
                    : 'Choisissez une personne dans la liste pour afficher ses droits.'}
                </CardDescription>
              </div>
              {selectedUser && (
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn('border text-xs', STATUS_STYLES[selectedUser.status])}>
                    {selectedUser.status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                  {selectedUser.isSuperAdmin && (
                    <Badge className="border bg-primary/10 text-primary border-primary/40 text-xs">
                      Super administrateur
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedUser && (
              <div className="text-sm text-muted-foreground">
                Sélectionnez un collaborateur pour modifier ses groupes et exceptions d’accès.
              </div>
            )}

            {selectedUser && (
              <div className="space-y-8">
                <section className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">Groupes métiers</h3>
                    <p className="text-sm text-muted-foreground">
                      Les groupes déterminent les accès partagés. Vous pouvez ajouter ou retirer un
                      utilisateur d’un groupe pour modifier ses droits.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {groups.map((group) => {
                      const groupId = `group-${group.id}`;
                      const checked = draft.groups.includes(group.id);
                      return (
                        <label
                          key={group.id}
                          htmlFor={groupId}
                          className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition',
                            checked ? 'border-primary/50 bg-primary/5' : 'border-border',
                            isSuperAdmin && 'opacity-80 cursor-not-allowed',
                          )}
                        >
                          <Checkbox
                            id={groupId}
                            disabled={isSuperAdmin || isLoading || updateUserMutation.isPending}
                            checked={checked}
                            onCheckedChange={(value) =>
                              handleGroupToggle(group.id, value === true)
                            }
                          />
                          <div className="space-y-1">
                            <div className="font-medium">{group.name}</div>
                            <p className="text-sm text-muted-foreground">{group.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {group.defaultPermissions.map((permission) => {
                                const definition = permissionsByKey.get(permission);
                                if (!definition) {
                                  return null;
                                }
                                const isActive = effectivePermissionSet.has(permission);
                                return (
                                  <Badge
                                    key={permission}
                                    variant="outline"
                                    className={cn(
                                      'text-[10px] uppercase tracking-wide border',
                                      isActive
                                        ? 'border-emerald-200 bg-emerald-500/10 text-emerald-600'
                                        : 'border-border text-muted-foreground',
                                    )}
                                  >
                                    {definition.label}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Permissions détaillées</h3>
                      <p className="text-sm text-muted-foreground">
                        Les exceptions permettent de surcharger les droits hérités des groupes.
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {effectivePermissionSet.size} accès actifs
                    </div>
                  </div>
                  <ScrollArea className="h-[260px] rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Élément</TableHead>
                          <TableHead>Origine</TableHead>
                          <TableHead className="w-44">Décision</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permissionEvaluations.map(({ definition, evaluation }) => {
                          const value = getPermissionSelectValue(
                            draft.permissionOverrides,
                            definition.key,
                          );
                          const allowed = evaluation.effective;
                          return (
                            <TableRow key={definition.key}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{definition.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {definition.category}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'w-fit text-xs border',
                                      allowed
                                        ? 'border-emerald-200 bg-emerald-500/10 text-emerald-600'
                                        : 'border-rose-200 bg-rose-500/10 text-rose-600',
                                    )}
                                  >
                                    {allowed ? 'Autorisé' : 'Refusé'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {describePermissionOrigin(
                                      evaluation.origin,
                                      evaluation.inheritedFrom,
                                      evaluation.basePermission,
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={value}
                                  onValueChange={(selected) =>
                                    handlePermissionChange(
                                      definition.key,
                                      selected as PermissionSelectValue,
                                    )
                                  }
                                  disabled={isSuperAdmin || updateUserMutation.isPending}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PERMISSION_SELECT_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        <div className="flex flex-col">
                                          <span>{option.label}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {option.description}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </section>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    disabled={!isDirty || updateUserMutation.isPending}
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={
                      isSuperAdmin || !isDirty || updateUserMutation.isPending || isLoading
                    }
                  >
                    {updateUserMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>
            Historique des mises à jour réalisées via l’interface d’administration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLog.map((entry) => {
              const actor = users.find((user) => user.id === entry.actorId);
              const target = users.find((user) => user.id === entry.userId);
              const addedGroups = entry.groupChanges?.added ?? [];
              const removedGroups = entry.groupChanges?.removed ?? [];
              const overrideAdded = entry.overrideChanges?.added ?? [];
              const overrideRemoved = entry.overrideChanges?.removed ?? [];
              const overrideChanged = entry.overrideChanges?.changed ?? [];

              return (
                <div key={entry.id} className="border-l-2 border-border pl-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">
                      {actor?.displayName ?? entry.actorName}{' '}
                      <span className="text-muted-foreground font-normal">
                        a mis à jour {target?.displayName ?? entry.userId}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.timestamp), {
                        locale: fr,
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">{entry.message}</div>
                  {Boolean(addedGroups.length || removedGroups.length) && (
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      {addedGroups.length > 0 && (
                        <div>
                          +{' '}
                          {mapGroupIdToName(groups, addedGroups).join(', ')}
                        </div>
                      )}
                      {removedGroups.length > 0 && (
                        <div>
                          −{' '}
                          {mapGroupIdToName(groups, removedGroups).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                  {Boolean(
                    overrideAdded.length || overrideRemoved.length || overrideChanged.length,
                  ) && (
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      {overrideAdded.map((item) => (
                        <div key={`added-${entry.id}-${item.key}`}>
                          + {permissionsByKey.get(item.key)?.label ?? item.key} (autorisé)
                        </div>
                      ))}
                      {overrideRemoved.map((item) => (
                        <div key={`removed-${entry.id}-${item.key}`}>
                          × {permissionsByKey.get(item.key)?.label ?? item.key} (retour à l’héritage)
                        </div>
                      ))}
                      {overrideChanged.map((item) => (
                        <div key={`changed-${entry.id}-${item.key}`}>
                          {permissionsByKey.get(item.key)?.label ?? item.key} : {item.from} → {item.to}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {!auditLog.length && (
              <div className="text-sm text-muted-foreground">
                Aucune activité pour le moment. Les modifications enregistrées apparaîtront ici.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Administration;
