import { LockKeyhole, TriangleAlert } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/useAdminData';
import { useSidebarModules } from '@/hooks/useModules';
import { useAuth } from '@/context/AuthContext';
import { computeEffectivePermissions } from '@/lib/mockDb';
import { GROUP_DEFINITIONS, type PermissionDefinition, type PermissionKey } from '@/lib/access-control';
import { extractInternalUserId, toNumericId } from '@/lib/userIdentifiers';

interface ModuleAccessGuardProps {
  permission: PermissionKey;
  children: ReactNode;
}

function LoadingPlaceholder() {
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

function AccessDeniedView() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center px-6 py-12">
      <div className="max-w-lg text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <LockKeyhole className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Accès refusé</h1>
          <p className="text-muted-foreground">
            Vous n&apos;avez pas les droits nécessaires pour accéder à ce module. Si vous pensez
            qu&apos;il s&apos;agit d&apos;une erreur, contactez l&apos;équipe intranet.
          </p>
        </div>
      </div>
    </div>
  );
}

function AccessErrorView() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center px-6 py-12">
      <div className="max-w-lg text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <TriangleAlert className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Module inaccessible</h1>
          <p className="text-muted-foreground">
            Impossible de vérifier vos autorisations pour ce module pour le moment. Merci de
            réessayer plus tard.
          </p>
        </div>
      </div>
    </div>
  );
}

function normalizePermissionKey(definition: PermissionDefinition): PermissionKey | null {
  const metadataKey = typeof definition.metadata?.permissionKey === 'string'
    ? definition.metadata.permissionKey.trim().toLowerCase()
    : undefined;
  const definitionKey = typeof definition.key === 'string'
    ? definition.key.trim().toLowerCase()
    : undefined;

  const resolved = metadataKey || definitionKey;
  return resolved ? (resolved as PermissionKey) : null;
}

export function ModuleAccessGuard({ permission, children }: ModuleAccessGuardProps) {
  const { user: authUser, loading: loadingAuth } = useAuth();
  const {
    data: currentUser,
    isLoading: loadingCurrentUser,
    error: currentUserError,
  } = useCurrentUser();

  const internalUserId = useMemo(
    () => extractInternalUserId(authUser?.internalUser),
    [authUser?.internalUser],
  );
  const currentUserId = useMemo(() => toNumericId(currentUser?.id), [currentUser?.id]);
  const sidebarUserId = internalUserId ?? currentUserId;

  const {
    data: moduleDefinitions,
    isLoading: loadingModules,
    isFetching: fetchingModules,
    error: modulesError,
  } = useSidebarModules(sidebarUserId);

  const accessiblePermissions = useMemo(() => {
    const permissionsFromProfile = currentUser
      ? computeEffectivePermissions(currentUser, GROUP_DEFINITIONS)
      : [];
    const permissionsFromModules = moduleDefinitions
      ? moduleDefinitions
          .map((definition) => normalizePermissionKey(definition))
          .filter((key): key is PermissionKey => Boolean(key))
      : [];

    return new Set<PermissionKey>([...permissionsFromProfile, ...permissionsFromModules]);
  }, [currentUser, moduleDefinitions]);

  const isLoading =
    loadingAuth ||
    loadingCurrentUser ||
    (sidebarUserId !== undefined && (loadingModules || fetchingModules));
  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  if (currentUserError) {
    console.error('Impossible de vérifier les autorisations de module :', currentUserError);
    return <AccessErrorView />;
  }

  if (modulesError) {
    console.warn('Impossible de charger la liste des modules visibles :', modulesError);
  }

  const isAllowed = currentUser?.isSuperAdmin || accessiblePermissions.has(permission);

  if (!isAllowed) {
    return <AccessDeniedView />;
  }

  return <>{children}</>;
}
