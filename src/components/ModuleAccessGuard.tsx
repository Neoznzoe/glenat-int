import { useMemo, type ReactNode } from 'react';
import { computeEffectivePermissions } from '@/lib/mockDb';
import { type PermissionKey } from '@/lib/access-control';
import { useAdminGroups, useCurrentUser } from '@/hooks/useAdminData';

interface ModuleAccessGuardProps {
  permission: PermissionKey;
  children: ReactNode;
}

export function ModuleAccessGuard({ permission, children }: ModuleAccessGuardProps) {
  const {
    data: currentUser,
    isLoading: loadingUser,
    isError: userError,
    error: currentUserError,
  } = useCurrentUser();
  const {
    data: groups = [],
    isLoading: loadingGroups,
    isError: groupError,
    error: groupsError,
  } = useAdminGroups();

  const loading = loadingUser || loadingGroups;

  const hasAccess = useMemo(() => {
    if (!currentUser) {
      return false;
    }
    if (currentUser.isSuperAdmin) {
      return true;
    }
    const effectivePermissions = new Set(
      computeEffectivePermissions(currentUser, groups),
    );
    return effectivePermissions.has(permission);
  }, [currentUser, groups, permission]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
        />
        <span className="sr-only">Chargement…</span>
      </div>
    );
  }

  if (userError || groupError) {
    const message =
      currentUserError instanceof Error
        ? currentUserError.message
        : groupsError instanceof Error
          ? groupsError.message
          : "Une erreur est survenue lors de la vérification de l'accès au module.";
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Erreur d'accès</h1>
          <p className="text-muted-foreground">
            {message || "Impossible de déterminer vos autorisations pour ce module."}
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Module inaccessible</h1>
          <p className="text-muted-foreground">
            Vous n’avez pas les autorisations nécessaires pour accéder à ce module.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ModuleAccessGuard;
