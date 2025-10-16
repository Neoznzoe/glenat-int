import { useMemo, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { type PermissionKey } from '@/lib/access-control';
import { useCurrentUser } from '@/hooks/useAdminData';
import { useSidebarModules } from '@/hooks/useModules';
import { extractInternalUserId, toNumericId } from '@/lib/userIdentifiers';

interface ModuleAccessGuardProps {
  permission: PermissionKey;
  children: ReactNode;
}

export function ModuleAccessGuard({ permission, children }: ModuleAccessGuardProps) {
  const { user: authUser, loading: authLoading } = useAuth();
  const {
    data: currentUser,
    isLoading: loadingUser,
    isError: userError,
    error: currentUserError,
  } = useCurrentUser();

  const internalUserId = useMemo(
    () => extractInternalUserId(authUser?.internalUser),
    [authUser?.internalUser],
  );
  const currentUserId = useMemo(() => toNumericId(currentUser?.id), [currentUser?.id]);
  const resolvedUserId = internalUserId ?? currentUserId;

  const {
    data: modules = [],
    isLoading: loadingModules,
    isFetching: fetchingModules,
    isError: modulesError,
    error: modulesErrorDetails,
  } = useSidebarModules(resolvedUserId);

  const waitingForUserContext = authLoading || loadingUser;
  const waitingForModules = loadingModules || fetchingModules;
  const loading = waitingForUserContext || waitingForModules;

  const missingUserIdentifier =
    !resolvedUserId && !waitingForUserContext && !currentUser?.isSuperAdmin;

  const hasAccess = useMemo(() => {
    if (!currentUser) {
      return false;
    }
    if (currentUser.isSuperAdmin) {
      return true;
    }
    if (modules.length > 0) {
      const normalizedTarget = permission.toLowerCase();
      return modules.some((module) => {
        const moduleKey = module.key?.toLowerCase?.();
        const metadataKey =
          typeof module.metadata?.permissionKey === 'string'
            ? module.metadata.permissionKey.toLowerCase()
            : undefined;
        return moduleKey === normalizedTarget || metadataKey === normalizedTarget;
      });
    }
    return currentUser.permissionOverrides?.some(
      (override) => override.key === permission && override.mode === 'allow',
    )
      ? true
      : false;
  }, [currentUser, modules, permission]);

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

  if (missingUserIdentifier) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Erreur d'accès</h1>
          <p className="text-muted-foreground">
            Impossible de déterminer votre identifiant interne pour valider l'accès au
            module.
          </p>
        </div>
      </div>
    );
  }

  if (modulesError) {
    const message =
      modulesErrorDetails instanceof Error
        ? modulesErrorDetails.message
        : "Une erreur est survenue lors du chargement de vos modules.";
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
