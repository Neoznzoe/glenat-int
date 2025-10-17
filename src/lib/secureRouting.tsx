import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useAdminGroups, useCurrentUser } from '@/hooks/useAdminData';
import type { PermissionKey } from './access-control';
import { computeEffectivePermissions } from './mockDb';
import {
  decryptUrlToken,
  encryptUrlPayload,
  isUrlEncryptionConfigured,
  type EncryptedUrlPayload,
} from './urlEncryption';

export interface RouteDefinition {
  path: string;
  element: ReactElement;
  requiredPermission?: PermissionKey;
}

interface DecryptedLocation {
  pathname: string;
  search: string;
}

interface SecureRoutingContextValue {
  encryptionEnabled: boolean;
  ensureToken: (path: string, search: string) => Promise<string>;
  getCachedToken: (path: string, search: string) => string | undefined;
  setDecryptedLocation: (location: DecryptedLocation) => void;
  currentLocation: DecryptedLocation;
  tokenVersion: number;
}

const defaultLocation: DecryptedLocation = {
  pathname: '/',
  search: '',
};

const SecureRoutingContext = createContext<SecureRoutingContextValue | undefined>(
  undefined,
);

function useSecureRoutingContext(): SecureRoutingContextValue {
  const context = useContext(SecureRoutingContext);
  if (!context) {
    throw new Error('SecureRoutingContext manquant.');
  }
  return context;
}

function makeCacheKey(path: string, search: string): string {
  return `${path}?${search ?? ''}`;
}

function normaliseSearch(search: string | undefined): string {
  if (!search || search.length === 0) {
    return '';
  }
  return search.startsWith('?') ? search : `?${search}`;
}

function splitTarget(target: string): { path: string; search: string } {
  const [pathname, searchPart] = target.split('?');
  return { path: pathname || '/', search: normaliseSearch(searchPart) };
}

function formatToken(token: string): string {
  return token.match(/.{1,11}/g)?.join('/') ?? token;
}

function normalizeToken(formatted: string): string {
  return formatted.replace(/\//g, '');
}

export interface SecureRoutingProviderProps {
  routes: RouteDefinition[];
  children: ReactNode;
}

export function SecureRoutingProvider({
  routes,
  children,
}: SecureRoutingProviderProps): ReactElement {
  const encryptionEnabled = isUrlEncryptionConfigured();
  const [cache, setCache] = useState<Record<string, string>>({});
  const [tokenVersion, setTokenVersion] = useState(0);
  const pendingRef = useRef<Record<string, Promise<string>>>({});
  const [currentLocation, setCurrentLocation] = useState<DecryptedLocation>(() => {
    if (typeof window === 'undefined') {
      return defaultLocation;
    }
    return {
      pathname: window.location.pathname,
      search: window.location.search,
    };
  });

  const ensureToken = useCallback(
    async (path: string, search: string) => {
      if (!encryptionEnabled) {
        return '';
      }

      const normalisedSearch = normaliseSearch(search);
      const cacheKey = makeCacheKey(path, normalisedSearch);

      if (cache[cacheKey]) {
        return cache[cacheKey];
      }

      if (!pendingRef.current[cacheKey]) {
        pendingRef.current[cacheKey] = encryptUrlPayload({
          path,
          search: normalisedSearch,
          method: 'GET',
        }).then((token) => {
          const formatted = formatToken(token);
          setCache((previous) => {
            if (previous[cacheKey] === formatted) {
              return previous;
            }
            return {
              ...previous,
              [cacheKey]: formatted,
            };
          });
          return formatted;
        }).finally(() => {
          delete pendingRef.current[cacheKey];
        });
      }

      return pendingRef.current[cacheKey];
    },
    [cache, encryptionEnabled],
  );

  const getCachedToken = useCallback(
    (path: string, search: string) => {
      const normalisedSearch = normaliseSearch(search);
      const cacheKey = makeCacheKey(path, normalisedSearch);
      return cache[cacheKey];
    },
    [cache],
  );

  useEffect(() => {
    if (!encryptionEnabled) {
      return;
    }
    routes.forEach((route) => {
      void ensureToken(route.path, '');
    });
  }, [ensureToken, routes, encryptionEnabled]);

  const setDecryptedLocation = useCallback(
    (location: DecryptedLocation) => {
      setCurrentLocation(location);
      setCache({});
      pendingRef.current = {};
      setTokenVersion((previous) => previous + 1);
    },
    [setCache, setCurrentLocation, setTokenVersion],
  );

  const value = useMemo(
    () => ({
      encryptionEnabled,
      ensureToken,
      getCachedToken,
      setDecryptedLocation,
      currentLocation,
      tokenVersion,
    }),
    [
      encryptionEnabled,
      ensureToken,
      getCachedToken,
      setDecryptedLocation,
      currentLocation,
      tokenVersion,
    ],
  );

  return (
    <SecureRoutingContext.Provider value={value}>
      {children}
    </SecureRoutingContext.Provider>
  );
}

interface RouteRendererProps {
  path: string;
  element: ReactElement;
}

function RouteRenderer({ path, element }: RouteRendererProps): ReactElement | null {
  const location = useLocation();
  const navigate = useNavigate();
  const { encryptionEnabled, ensureToken, setDecryptedLocation } =
    useSecureRoutingContext();

  useEffect(() => {
    if (!encryptionEnabled) {
      setDecryptedLocation({ pathname: path, search: location.search });
      return;
    }

    if (location.pathname !== path) {
      return;
    }

    let cancelled = false;

    void ensureToken(path, location.search)
      .then((token) => {
        if (cancelled || !token) {
          return;
        }
        navigate(`/ci/${token}`, { replace: true });
      })
      .catch((error) => {
        console.error('Erreur lors de la génération du jeton chiffré :', error);
      });

    return () => {
      cancelled = true;
    };
  }, [
    encryptionEnabled,
    ensureToken,
    navigate,
    path,
    location.pathname,
    location.search,
    setDecryptedLocation,
  ]);

  if (encryptionEnabled) {
    return null;
  }

  return element;
}

function LoadingIndicator(): ReactElement {
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

function toErrorMessage(error: unknown): string {
  if (!error) {
    return "Une erreur inattendue est survenue.";
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Une erreur inattendue est survenue.";
  }
}

interface PermissionGateProps {
  requiredPermission?: PermissionKey;
  permissionSet: Set<PermissionKey>;
  loading: boolean;
  errorMessage: string | null;
  children: ReactElement;
}

function PermissionGate({
  requiredPermission,
  permissionSet,
  loading,
  errorMessage,
  children,
}: PermissionGateProps): ReactElement {
  if (!requiredPermission) {
    return children;
  }

  if (loading) {
    return <LoadingIndicator />;
  }

  if (errorMessage) {
    return (
      <div className="p-8 text-center">
        <h1 className="mb-2 text-2xl font-semibold">Erreur de chargement</h1>
        <p className="text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  if (!permissionSet.has(requiredPermission)) {
    return (
      <div className="p-8 text-center">
        <h1 className="mb-2 text-2xl font-semibold">Accès non autorisé</h1>
        <p className="text-muted-foreground">
          Vous n'avez pas la permission nécessaire pour consulter cette page.
        </p>
      </div>
    );
  }

  return children;
}

interface EncryptedRouteProps {
  routes: RouteDefinition[];
}

function EncryptedRoute({ routes }: EncryptedRouteProps): ReactElement {
  const params = useParams();
  const { encryptionEnabled, setDecryptedLocation } =
    useSecureRoutingContext();
  const token = params['*'] ?? '';
  const normalisedToken = normalizeToken(token);
  const [payload, setPayload] = useState<EncryptedUrlPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!encryptionEnabled) {
      return;
    }

    let cancelled = false;

    void decryptUrlToken(normalisedToken)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setPayload(data);
      })
      .catch((decryptionError) => {
        if (cancelled) {
          return;
        }
        setError(
          decryptionError instanceof Error
            ? decryptionError.message
            : 'URL sécurisée invalide.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [encryptionEnabled, normalisedToken]);

  useEffect(() => {
    if (payload) {
      setDecryptedLocation({
        pathname: payload.path,
        search: payload.search ?? '',
      });
    }
  }, [payload, setDecryptedLocation]);

  if (!encryptionEnabled) {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">URL sécurisée invalide</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!payload) {
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

  const route = routes.find((item) => item.path === payload.path);

  if (!route) {
    return <Navigate to="/" replace />;
  }

  return route.element;
}

export interface SecureRoutesProps {
  routes: RouteDefinition[];
}

export function SecureRoutes({ routes }: SecureRoutesProps): ReactElement {
  const {
    data: currentUser,
    isLoading: loadingCurrentUser,
    isError: hasCurrentUserError,
    error: currentUserError,
  } = useCurrentUser();
  const {
    data: groups = [],
    isLoading: loadingGroups,
    isError: hasGroupError,
    error: groupError,
  } = useAdminGroups();

  const permissionSet = useMemo(() => {
    if (!currentUser) {
      return new Set<PermissionKey>();
    }
    return new Set(computeEffectivePermissions(currentUser, groups));
  }, [currentUser, groups]);

  const loadingPermissions = loadingCurrentUser || loadingGroups;

  const permissionErrorMessage = useMemo(() => {
    if (hasCurrentUserError) {
      return toErrorMessage(currentUserError);
    }
    if (hasGroupError) {
      return toErrorMessage(groupError);
    }
    return null;
  }, [hasCurrentUserError, currentUserError, hasGroupError, groupError]);

  const guardedRoutes = useMemo(
    () =>
      routes.map((route) => ({
        ...route,
        element: (
          <PermissionGate
            requiredPermission={route.requiredPermission}
            permissionSet={permissionSet}
            loading={loadingPermissions}
            errorMessage={permissionErrorMessage}
          >
            {route.element}
          </PermissionGate>
        ),
      })),
    [routes, permissionSet, loadingPermissions, permissionErrorMessage],
  );

  const fallback = <LoadingIndicator />;

  return (
    <Routes>
      {guardedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <Suspense fallback={fallback}>
              <RouteRenderer path={route.path} element={route.element} />
            </Suspense>
          }
        />
      ))}
      <Route
        path="/ci/*"
        element={
          <Suspense fallback={fallback}>
            <EncryptedRoute routes={guardedRoutes} />
          </Suspense>
        }
      />
    </Routes>
  );
}

export function useEncryptedPath(target: string): string {
  const { encryptionEnabled, ensureToken, getCachedToken, tokenVersion } =
    useSecureRoutingContext();

  const isInternal = target.startsWith('/');

  const { path, search } = useMemo(() => splitTarget(target), [target]);
  const [resolved, setResolved] = useState<string | null>(null);

  useEffect(() => {
    if (!encryptionEnabled || !isInternal) {
      setResolved(null);
      return;
    }

    let cancelled = false;

    setResolved(null);

    const cached = getCachedToken(path, search);

    if (cached) {
      setResolved(cached);
      return;
    }

    void ensureToken(path, search).then((token) => {
      if (cancelled) {
        return;
      }
      setResolved(token);
    });

    return () => {
      cancelled = true;
    };
  }, [
    encryptionEnabled,
    ensureToken,
    getCachedToken,
    path,
    search,
    isInternal,
    tokenVersion,
  ]);

  if (!encryptionEnabled || !isInternal) {
    return target;
  }

  if (resolved) {
    return `/ci/${resolved}`;
  }

  return target;
}

export function useDecryptedLocation(): DecryptedLocation {
  const { currentLocation } = useSecureRoutingContext();
  return currentLocation;
}
