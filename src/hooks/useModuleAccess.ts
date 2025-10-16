import { useMemo } from 'react';
import { useCurrentUser } from '@/hooks/useAdminData';
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

  const loading = loadingCurrentUser || fetchingCurrentUser;

  const deniedPermissions = useMemo(() => {
    if (!currentUser) {
      return new Set<PermissionKey>();
    }

    return new Set<PermissionKey>(
      (currentUser.permissionOverrides ?? [])
        .filter((override) => override.mode === 'deny' && typeof override.key === 'string')
        .map((override) => override.key.trim().toLowerCase() as PermissionKey),
    );
  }, [currentUser]);

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

    const normalizedPermission = permission.trim().toLowerCase() as PermissionKey;

    return !deniedPermissions.has(normalizedPermission);
  }, [currentUser, deniedPermissions, permission]);

  const error = currentUserError as Error | null;

  return { loading, allowed, error };
}
