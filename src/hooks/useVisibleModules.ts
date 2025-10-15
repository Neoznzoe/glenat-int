import { useEffect, useMemo, useState } from "react";
import { USE_REACT_QUERY, SIDEBAR_OPTIONS } from "@/config";
import { computeVisibleModules } from "@/lib/visibleModules";
import { useCurrentUserQuery, useModulesQuery, useUserPermissionsQuery } from "@/api/query";
import { getCurrentUser, getModules, getUserPermissions } from "@/api/client";
import { CurrentUser, Module, UserPermission, VisibleModule } from "@/types/sidebar";

type HookState = {
  data: VisibleModule[] | null;
  loading: boolean;
  error: string | null;
};

export function useVisibleModules(): HookState {
  if (USE_REACT_QUERY) {
    return useReactQueryVariant();
  }

  return useFetchVariant();
}

function useFetchVariant(): HookState {
  const [modules, setModules] = useState<Module[] | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[] | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const modulesController = new AbortController();
    const permissionsController = new AbortController();
    const userController = new AbortController();

    setLoading(true);
    setError(null);

    Promise.all([
      getModules({ signal: modulesController.signal }),
      getUserPermissions({ signal: permissionsController.signal }),
      getCurrentUser({ signal: userController.signal }),
    ])
      .then(([modulesResponse, permissionsResponse, currentUserResponse]) => {
        if (cancelled) {
          return;
        }

        setModules(modulesResponse);
        setPermissions(permissionsResponse);
        setCurrentUser(currentUserResponse);
      })
      .catch((caughtError) => {
        if (cancelled) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Une erreur inattendue est survenue.";
        setError(message);
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
      modulesController.abort();
      permissionsController.abort();
      userController.abort();
    };
  }, []);

  const denyList = SIDEBAR_OPTIONS.denyList;
  const superAdmin = currentUser?.isSuperAdmin ?? false;

  const data = useMemo(() => {
    if (!modules || !permissions || !currentUser) {
      return null;
    }

    const userPermissions = permissions.filter((permission) => permission.userId === currentUser.id);

    return computeVisibleModules(modules, userPermissions, {
      denyList,
      isSuperAdmin: superAdmin,
    });
  }, [modules, permissions, currentUser, denyList, superAdmin]);

  return {
    data,
    loading,
    error,
  };
}

function useReactQueryVariant(): HookState {
  const modulesQuery = useModulesQuery();
  const permissionsQuery = useUserPermissionsQuery();
  const currentUserQuery = useCurrentUserQuery();

  const loading =
    modulesQuery.isPending || permissionsQuery.isPending || currentUserQuery.isPending;

  const error = useMemo(() => {
    const errors = [modulesQuery.error, permissionsQuery.error, currentUserQuery.error]
      .filter((maybeError): maybeError is Error => Boolean(maybeError))
      .map((item) => item.message);

    if (errors.length === 0) {
      return null;
    }

    return errors.join(" · ");
  }, [modulesQuery.error, permissionsQuery.error, currentUserQuery.error]);

  const denyList = SIDEBAR_OPTIONS.denyList;
  const superAdmin = currentUserQuery.data?.isSuperAdmin ?? false;

  const data = useMemo(() => {
    if (!modulesQuery.data || !permissionsQuery.data || !currentUserQuery.data) {
      return null;
    }

    const userPermissions = permissionsQuery.data.filter(
      (permission) => permission.userId === currentUserQuery.data.id
    );

    return computeVisibleModules(modulesQuery.data, userPermissions, {
      denyList,
      isSuperAdmin: superAdmin,
    });
  }, [modulesQuery.data, permissionsQuery.data, currentUserQuery.data, denyList, superAdmin]);

  return {
    data,
    loading,
    error,
  };
}
