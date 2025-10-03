import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useAdminUsers,
  useAdminGroups,
  usePermissionDefinitions,
  useAuditLog,
  useCurrentUser,
  usePersistModuleOverride,
  useUpdateUserAccess,
  type PermissionOverride,
  type UserAccount,
} from '@/hooks/useAdminData';
import { computeEffectivePermissions, evaluatePermission } from '@/lib/mockDb';
import {
  PERMISSION_DEFINITIONS,
  type GroupDefinition,
  type PermissionDefinition,
  type PermissionKey,
} from '@/lib/access-control';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserListPanel } from '@/components/admin/UserListPanel';
import {
  UserAccessEditor,
  type PermissionEvaluationRow,
} from '@/components/admin/UserAccessEditor';
import { type DraftAccessState, type PermissionSelectValue } from '@/components/admin/access-types';
import { GroupManager } from '@/components/admin/GroupManager';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

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

function applyOverrideChange(
  overrides: PermissionOverride[],
  key: PermissionKey,
  value: PermissionSelectValue,
): PermissionOverride[] {
  const filtered = overrides.filter((item) => item.key !== key);
  if (value === 'inherit') {
    return filtered;
  }
  return [...filtered, { key, mode: value }];
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
  const [showOnlyInactive, setShowOnlyInactive] = useState(false);
  const [draft, setDraft] = useState<DraftAccessState>({ groups: [], permissionOverrides: [] });
  const selectedUserIdRef = useRef<string | null>(null);

  const updateUserMutation = useUpdateUserAccess({ actorId: currentUser?.id });
  const moduleOverrideMutation = usePersistModuleOverride({ actorId: currentUser?.id });

  const lowerSearch = search.trim().toLowerCase();
  const filteredUsers = useMemo(() => {
    const candidates = showOnlyInactive ? users.filter((user) => user.status === 'inactive') : users;
    if (!lowerSearch) {
      return candidates;
    }
    return candidates.filter((user) => {
      const haystack = [
        user.displayName,
        user.email,
        user.department,
        user.jobTitle,
        user.username,
        user.preferredLanguage,
      ]
        .filter((value) => typeof value === 'string' && value.trim().length > 0)
        .join(' ')
        .toLowerCase();
      return haystack.includes(lowerSearch);
    });
  }, [users, lowerSearch, showOnlyInactive]);

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

  useEffect(() => {
    selectedUserIdRef.current = selectedUser?.id ?? null;
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
  const permissionEvaluations = useMemo<PermissionEvaluationRow[]>(() => {
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
  const isSaving = updateUserMutation.isPending || moduleOverrideMutation.isPending;

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

  const handlePermissionChange = async (
    definition: PermissionDefinition,
    value: PermissionSelectValue,
  ) => {
    const targetUser = selectedUser;
    const previousOverrides = draft.permissionOverrides;
    const nextOverrides = applyOverrideChange(previousOverrides, definition.key, value);

    setDraft((current) => ({
      ...current,
      permissionOverrides: applyOverrideChange(current.permissionOverrides, definition.key, value),
    }));

    if (!targetUser || definition.type !== 'module') {
      return;
    }

    const targetUserId = targetUser.id;
    const moduleOverridesToPersist = nextOverrides.filter((override) => {
      const permission = permissionsByKey.get(override.key);
      return permission?.type === 'module';
    });

    try {
      const updatedUser = await moduleOverrideMutation.mutateAsync({
        userId: targetUserId,
        groups: [...targetUser.groups],
        permissionOverrides: moduleOverridesToPersist,
      });

      if (selectedUserIdRef.current !== targetUserId) {
        return;
      }

      const sanitizedModules = (updatedUser.permissionOverrides ?? []).filter((override) => {
        const permission = permissionsByKey.get(override.key);
        return permission?.type === 'module';
      });

      setDraft((current) => {
        if (selectedUserIdRef.current !== targetUserId) {
          return current;
        }

        if (!overridesAreEqual(current.permissionOverrides, nextOverrides)) {
          return current;
        }

        const preservedNonModules = current.permissionOverrides.filter((override) => {
          const permission = permissionsByKey.get(override.key);
          return permission?.type !== 'module';
        });

        return {
          ...current,
          permissionOverrides: [...sanitizedModules, ...preservedNonModules],
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error("Impossible de mettre à jour le module", { description: message });

      setDraft((current) => {
        if (selectedUserIdRef.current !== targetUserId) {
          return current;
        }
        if (!overridesAreEqual(current.permissionOverrides, nextOverrides)) {
          return current;
        }
        return {
          ...current,
          permissionOverrides: previousOverrides,
        };
      });
    }
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
        <UserListPanel
          filteredUsers={filteredUsers}
          search={search}
          onSearchChange={setSearch}
          showOnlyInactive={showOnlyInactive}
          onToggleShowOnlyInactive={() => setShowOnlyInactive((current) => !current)}
          groups={groups}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
          isLoading={loadingUsers || loadingGroups}
        />
        <UserAccessEditor
          user={selectedUser}
          draft={draft}
          groups={groups}
          permissionEvaluations={permissionEvaluations}
          effectivePermissionSet={effectivePermissionSet}
          isDirty={isDirty}
          isSaving={isSaving}
          isSuperAdmin={isSuperAdmin}
          isLoading={isLoading}
          onToggleGroup={handleGroupToggle}
          onPermissionChange={handlePermissionChange}
          onReset={handleReset}
          onSave={handleSave}
        />
      </div>

      <GroupManager groups={groups} isLoading={loadingGroups || loadingUsers} />

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
