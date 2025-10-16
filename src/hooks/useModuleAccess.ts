import { useMemo } from 'react';
import { useAdminGroups, useCurrentUser } from '@/hooks/useAdminData';
import { computeEffectivePermissions } from '@/lib/mockDb';
import type { PermissionKey } from '@/lib/access-control';

interface ModulePermissionState {
  loading: boolean;
  allowed: boolean;
  error: Error | null;
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

  const loading = loadingCurrentUser || loadingGroups || fetchingCurrentUser || fetchingGroups;

  const allowed = useMemo(() => {
    if (!permission) {
      return true;
    }

    if (!currentUser) {
      return false;
    }

    if (currentUser.isSuperAdmin) {
      return true;
    }

    if (!groups) {
      return false;
    }

    const accessiblePermissions = new Set(
      computeEffectivePermissions(currentUser, groups),
    );

    return accessiblePermissions.has(permission);
  }, [currentUser, groups, permission]);

  const error = (currentUserError as Error | null) ?? (groupsError as Error | null) ?? null;

  return { loading, allowed, error };
}
