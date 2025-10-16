import { useMemo } from 'react';
import { useAdminGroups, useCurrentUser } from '@/hooks/useAdminData';
import type { PermissionKey } from '@/lib/access-control';
import { computeEffectivePermissions } from '@/lib/mockDb';

interface ModulePermissionState {
  loading: boolean;
  allowed: boolean;
  error: Error | null;
}

function normalizePermissionKeyValue(value: unknown): PermissionKey | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized ? (normalized as PermissionKey) : null;
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export function useModulePermission(permission?: PermissionKey): ModulePermissionState {
  const {
    data: currentUser,
    isLoading: loadingCurrentUser,
    isFetching: fetchingCurrentUser,
    error: currentUserError,
  } = useCurrentUser();
  const {
    data: groups,
    isLoading: loadingGroups,
    isFetching: fetchingGroups,
    error: groupsError,
  } = useAdminGroups();

  const loading =
    loadingCurrentUser || fetchingCurrentUser || loadingGroups || fetchingGroups;

  const normalizedPermission = useMemo(() => {
    if (!permission) {
      return undefined;
    }
    return normalizePermissionKeyValue(permission) ?? undefined;
  }, [permission]);

  const normalizedGroups = useMemo(() => {
    if (!groups) {
      return [];
    }

    return groups.map((group) => ({
      ...group,
      defaultPermissions: group.defaultPermissions
        .map((key) => normalizePermissionKeyValue(key))
        .filter(isNotNull),
    }));
  }, [groups]);

  const normalizedUser = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    const normalizedOverrides = (currentUser.permissionOverrides ?? [])
      .map((override) => {
        const normalizedKey = normalizePermissionKeyValue(override.key);
        if (!normalizedKey) {
          return null;
        }
        return { ...override, key: normalizedKey };
      })
      .filter(isNotNull);

    return {
      ...currentUser,
      permissionOverrides: normalizedOverrides,
    };
  }, [currentUser]);

  const allowedPermissions = useMemo(() => {
    if (!normalizedUser) {
      return new Set<PermissionKey>();
    }

    const computed = computeEffectivePermissions(normalizedUser, normalizedGroups);
    return new Set(computed.map((key) => normalizePermissionKeyValue(key)).filter(isNotNull));
  }, [normalizedUser, normalizedGroups]);

  const deniedPermissions = useMemo(() => {
    if (!normalizedUser) {
      return new Set<PermissionKey>();
    }

    return new Set<PermissionKey>(
      normalizedUser.permissionOverrides
        .filter((override) => override.mode === 'deny')
        .map((override) => override.key),
    );
  }, [normalizedUser]);

  const allowed = useMemo(() => {
    if (!normalizedPermission) {
      return true;
    }

    if (!normalizedUser) {
      return false;
    }

    if (normalizedUser.isSuperAdmin) {
      return true;
    }

    if (deniedPermissions.has(normalizedPermission)) {
      return false;
    }

    if (allowedPermissions.has(normalizedPermission)) {
      return true;
    }

    // Par défaut, les modules sont accessibles sauf si un refus explicite est appliqué.
    return true;
  }, [
    allowedPermissions,
    deniedPermissions,
    normalizedPermission,
    normalizedUser,
  ]);

  const error = (currentUserError ?? groupsError) as Error | null;

  return { loading, allowed, error };
}
