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
import {
  decryptUrlToken,
  encryptUrlPayload,
  isUrlEncryptionConfigured,
  type EncryptedUrlPayload,
} from './urlEncryption';
import { useAuth } from '@/context/AuthContext';
import { useCurrentUser, useAdminGroups } from '@/hooks/useAdminData';
import { useSidebarModules } from '@/hooks/useModules';
import { computeEffectivePermissions } from '@/lib/mockDb';
import { extractInternalUserId, toNumericId } from '@/lib/userUtils';
import {
  extractModulePath,
  normalizeRoute,
  resolveModulePermissionKey,
  resolveModuleVisibility,
  type ModuleMetadata,
} from '@/lib/moduleAccess';

export interface RouteDefinition {
  path: string;
  element: ReactElement;
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

const ROUTE_LOADING_FALLBACK = (
  <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
    <span
      aria-hidden="true"
      className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
    />
    <span className="sr-only">Chargement…</span>
  </div>
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

interface ModuleAccessState {
  status: 'loading' | 'allowed' | 'denied';
}

function useModuleAccessState(targetPath: string): ModuleAccessState {
  const normalizedTarget = useMemo(() => normalizeRoute(targetPath), [targetPath]);
  const { user: authUser } = useAuth();
  const {
    data: currentUser,
    isLoading: loadingCurrentUser,
    error: currentUserError,
  } = useCurrentUser();
  const {
    data: groupsData,
    isLoading: loadingGroups,
    error: groupsError,
  } = useAdminGroups();
  const internalUserId = useMemo(
    () => extractInternalUserId(authUser?.internalUser),
    [authUser?.internalUser],
  );
  const currentUserId = useMemo(() => toNumericId(currentUser?.id), [currentUser?.id]);
  const resolvedUserId = internalUserId ?? currentUserId;
  const {
    data: moduleDefinitions,
    isLoading: loadingModules,
    isFetching: fetchingModules,
    error: moduleError,
  } = useSidebarModules(resolvedUserId);

  if (normalizedTarget.startsWith('http://') || normalizedTarget.startsWith('https://')) {
    return { status: 'allowed' };
  }

  if (resolvedUserId === undefined) {
    if (loadingCurrentUser || (!currentUser && !currentUserError)) {
      return { status: 'loading' };
    }
    return { status: 'allowed' };
  }

  if (loadingModules || fetchingModules) {
    return { status: 'loading' };
  }

  if (!moduleDefinitions) {
    if (moduleError) {
      return { status: 'allowed' };
    }
    return { status: 'loading' };
  }

  if (loadingCurrentUser) {
    return { status: 'loading' };
  }

  if (!currentUser) {
    if (currentUserError) {
      return { status: 'allowed' };
    }
    return { status: 'loading' };
  }

  if (loadingGroups) {
    return { status: 'loading' };
  }

  const groups = groupsData ?? [];

  if (!groups.length && groupsError) {
    return { status: 'allowed' };
  }

  const matchingModule = moduleDefinitions.find((definition) => {
    if (definition.type !== 'module') {
      return false;
    }
    const metadata = (definition.metadata ?? {}) as ModuleMetadata;
    const path = extractModulePath(metadata, definition.key);
    if (!path || path.startsWith('http://') || path.startsWith('https://')) {
      return false;
    }
    return normalizeRoute(path) === normalizedTarget;
  });

  if (!matchingModule) {
    return { status: 'allowed' };
  }

  const metadata = (matchingModule.metadata ?? {}) as ModuleMetadata;
  const visibility = resolveModuleVisibility(metadata);
  if (visibility === false) {
    return { status: 'denied' };
  }

  if (currentUser.isSuperAdmin) {
    return { status: 'allowed' };
  }

  const permissionKey = resolveModulePermissionKey(matchingModule);
  const permissions = new Set(computeEffectivePermissions(currentUser, groups));

  if (!permissions.has(permissionKey)) {
    return { status: 'denied' };
  }

  return { status: 'allowed' };
}

interface RouteRendererProps {
  path: string;
  element: ReactElement;
}

function ModuleAccessBoundary({ path, element }: RouteRendererProps): ReactElement {
  const access = useModuleAccessState(path);

  if (access.status === 'loading') {
    return ROUTE_LOADING_FALLBACK;
  }

  if (access.status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return element;
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

  return <ModuleAccessBoundary path={path} element={element} />;
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

  return <ModuleAccessBoundary path={route.path} element={route.element} />;
}

export interface SecureRoutesProps {
  routes: RouteDefinition[];
}

export function SecureRoutes({ routes }: SecureRoutesProps): ReactElement {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <Suspense fallback={ROUTE_LOADING_FALLBACK}>
              <RouteRenderer path={route.path} element={route.element} />
            </Suspense>
          }
        />
      ))}
      <Route
        path="/ci/*"
        element={
          <Suspense fallback={ROUTE_LOADING_FALLBACK}>
            <EncryptedRoute routes={routes} />
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
