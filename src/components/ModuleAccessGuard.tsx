import { useMemo, type ReactNode } from 'react';
import { type PermissionKey } from '@/lib/access-control';
import { useAdminGroups, useCurrentUser } from '@/hooks/useAdminData';
import { computeEffectivePermissions } from '@/lib/mockDb';

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
    isError: groupsError,
    error: groupsErrorDetails,
  } = useAdminGroups();

  const loading = loadingUser || loadingGroups;

  const accessiblePermissions = useMemo(() => {
    if (!currentUser) {
      return new Set<PermissionKey>();
    }
    return new Set(computeEffectivePermissions(currentUser, groups));
  }, [currentUser, groups]);

  const hasAccess = currentUser ? accessiblePermissions.has(permission) : false;

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

  if (userError) {
    const message =
      currentUserError instanceof Error
        ? currentUserError.message
        : "Impossible de récupérer vos informations utilisateur.";
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

  if (groupsError) {
    const message =
      groupsErrorDetails instanceof Error
        ? groupsErrorDetails.message
        : 'Une erreur est survenue lors du chargement de vos groupes.';
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Erreur d'accès</h1>
          <p className="text-muted-foreground">
            Vérification des autorisations impossible&nbsp;: {message}
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Erreur d'accès</h1>
          <p className="text-muted-foreground">
            Impossible de déterminer vos autorisations pour ce module.
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
