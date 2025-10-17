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
import { useCurrentUser } from '@/hooks/useAdminData';
import { useSidebarModules } from '@/hooks/useModules';
import { extractInternalUserId, toNumericId } from '@/lib/userUtils';
import {
  extractModulePath,
  normalizeRoute,
  resolveModulePermissionKey,
  resolveModuleVisibility,
  type ModuleMetadata,
} from '@/lib/moduleAccess';
import { type PermissionDefinition, type PermissionKey } from '@/lib/access-control';

type GuardPermissionConfig = PermissionKey | PermissionKey[];

type GuardModulePathConfig = string | string[];

interface RouteGuardConfig {
  permissions?: GuardPermissionConfig;
  modulePaths?: GuardModulePathConfig;
}

export interface RouteDefinition {
  path: string;
  element: ReactElement;
  guard?: RouteGuardConfig;
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
  fingerprint?: string;
}

function normalizePermissionKeyValue(permission: PermissionKey): PermissionKey {
  return permission.trim().toLowerCase() as PermissionKey;
}

interface ModuleIndexes {
  byPath: Map<string, PermissionDefinition>;
  byPermission: Map<PermissionKey, PermissionDefinition>;
}

function pickMoreRestrictiveDefinition(
  current: PermissionDefinition | undefined,
  candidate: PermissionDefinition,
): PermissionDefinition {
  if (!current) {
    return candidate;
  }

  const currentMetadata = (current.metadata ?? {}) as ModuleMetadata;
  const candidateMetadata = (candidate.metadata ?? {}) as ModuleMetadata;

  const currentVisibility = resolveModuleVisibility(currentMetadata);
  const candidateVisibility = resolveModuleVisibility(candidateMetadata);

  if (currentVisibility === false) {
    return current;
  }

  if (candidateVisibility === false) {
    return candidate;
  }

  if (currentVisibility === undefined && candidateVisibility !== undefined) {
    return candidate;
  }

  return current;
}

function buildModuleIndexes(
  moduleDefinitions: PermissionDefinition[] | undefined,
): ModuleIndexes {
  const byPath = new Map<string, PermissionDefinition>();
  const byPermission = new Map<PermissionKey, PermissionDefinition>();

  if (!moduleDefinitions) {
    return { byPath, byPermission };
  }

  moduleDefinitions.forEach((definition) => {
    if (definition.type && definition.type !== 'module') {
      return;
    }

    const metadata = (definition.metadata ?? {}) as ModuleMetadata;
    const modulePath = extractModulePath(metadata, definition.key);
    if (modulePath) {
      const normalisedPath = normalizeRoute(modulePath);
      if (normalisedPath) {
        const existing = byPath.get(normalisedPath);
        const preferred = pickMoreRestrictiveDefinition(existing, definition);
        if (!existing || preferred !== existing) {
          byPath.set(normalisedPath, preferred);
        }
      }
    }

    const permissionKey = resolveModulePermissionKey(definition);
    const existingPermission = byPermission.get(permissionKey);
    const preferredPermission = pickMoreRestrictiveDefinition(existingPermission, definition);
    if (!existingPermission || preferredPermission !== existingPermission) {
      byPermission.set(permissionKey, preferredPermission);
    }
  });

  return { byPath, byPermission };
}

function computeModuleFingerprint(
  moduleIndexes: ModuleIndexes,
  hasModuleDefinitions: boolean,
): string | undefined {
  if (!hasModuleDefinitions) {
    return undefined;
  }

  const aggregated = new Map<
    string,
    { key: string; permission: PermissionKey; paths: Set<string>; visible: boolean }
  >();

  const upsert = (definition: PermissionDefinition) => {
    const metadata = (definition.metadata ?? {}) as ModuleMetadata;
    const resolvedPermission = resolveModulePermissionKey(definition);
    const path = extractModulePath(metadata, definition.key);
    const normalisedPath = path ? normalizeRoute(path) : '';
    const visible = resolveModuleVisibility(metadata) !== false;

    const existing = aggregated.get(definition.key);
    if (!existing) {
      aggregated.set(definition.key, {
        key: definition.key,
        permission: resolvedPermission,
        paths: normalisedPath ? new Set([normalisedPath]) : new Set<string>(),
        visible,
      });
      return;
    }

    if (normalisedPath) {
      existing.paths.add(normalisedPath);
    }

    if (!visible) {
      existing.visible = false;
    }
  };

  for (const definition of moduleIndexes.byPath.values()) {
    upsert(definition);
  }

  for (const definition of moduleIndexes.byPermission.values()) {
    upsert(definition);
  }

  const modules = Array.from(aggregated.values())
    .map((entry) => ({
      key: entry.key,
      permission: entry.permission,
      paths: Array.from(entry.paths).sort((left, right) => left.localeCompare(right)),
      visible: entry.visible,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));

  try {
    return JSON.stringify(modules);
  } catch (error) {
    console.warn('Impossible de sérialiser les droits modules :', error);
    return modules
      .map((entry) =>
        `${entry.key}:${entry.permission}:${entry.paths.join(',')}:${entry.visible ? 1 : 0}`,
      )
      .join('|');
  }
}

function collectGuardModuleCandidates(route: RouteDefinition): string[] {
  const candidates = new Set<string>();

  const pushCandidate = (value?: string) => {
    if (!value) {
      return;
    }
    const normalised = normalizeRoute(value);
    if (!normalised) {
      return;
    }
    candidates.add(normalised);
  };

  pushCandidate(route.path);

  const modulePaths = route.guard?.modulePaths;
  if (Array.isArray(modulePaths)) {
    modulePaths.forEach((entry) => pushCandidate(entry));
  } else {
    pushCandidate(modulePaths);
  }

  return Array.from(candidates);
}

function collectGuardPermissions(route: RouteDefinition): PermissionKey[] {
  const raw = route.guard?.permissions;
  if (!raw) {
    return [];
  }
  const values = Array.isArray(raw) ? raw : [raw];
  return Array.from(
    new Set(values.map((permission) => normalizePermissionKeyValue(permission))),
  );
}

function useModuleAccessState(route: RouteDefinition): ModuleAccessState {
  const normalizedTarget = useMemo(() => normalizeRoute(route.path), [route.path]);
  const moduleCandidates = collectGuardModuleCandidates(route);
  const guardPermissions = collectGuardPermissions(route);

  const { user: authUser } = useAuth();
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
  const resolvedUserId = internalUserId ?? currentUserId;
  const {
    data: moduleDefinitions,
    isLoading: loadingModules,
    error: moduleError,
  } = useSidebarModules(resolvedUserId);

  const moduleIndexes = useMemo<ModuleIndexes>(
    () => buildModuleIndexes(moduleDefinitions as PermissionDefinition[] | undefined),
    [moduleDefinitions],
  );

  const hasModuleDefinitions = Array.isArray(moduleDefinitions);
  const computedFingerprint = useMemo(
    () => computeModuleFingerprint(moduleIndexes, hasModuleDefinitions),
    [moduleIndexes, hasModuleDefinitions],
  );
  const lastFingerprintRef = useRef<string | undefined>();
  useEffect(() => {
    if (computedFingerprint !== undefined) {
      lastFingerprintRef.current = computedFingerprint;
    }
  }, [computedFingerprint]);
  const fingerprint = computedFingerprint ?? lastFingerprintRef.current;

  if (normalizedTarget.startsWith('http://') || normalizedTarget.startsWith('https://')) {
    return { status: 'allowed', fingerprint };
  }

  if (resolvedUserId === undefined) {
    if (loadingCurrentUser || (!currentUser && !currentUserError)) {
      return { status: 'loading', fingerprint };
    }
    return { status: 'allowed', fingerprint };
  }

  const isInitialLoading = loadingModules && !hasModuleDefinitions;

  if (isInitialLoading) {
    return { status: 'loading' };
  }

  if (!moduleDefinitions) {
    if (moduleError) {
      return { status: 'allowed', fingerprint };
    }
    return { status: 'loading', fingerprint };
  }
  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  if (isSuperAdmin) {
    return { status: 'allowed', fingerprint };
  }

  const modulesByPath = moduleIndexes.byPath;
  const modulesByPermission = moduleIndexes.byPermission;

  const matchedModulesByPath = moduleCandidates
    .map((candidate) => modulesByPath.get(candidate))
    .filter((definition): definition is PermissionDefinition => Boolean(definition));

  if (moduleCandidates.length > 0) {
    if (!matchedModulesByPath.length) {
      return { status: 'denied', fingerprint };
    }

    const hasHiddenModule = matchedModulesByPath.some((definition) => {
      const metadata = (definition.metadata ?? {}) as ModuleMetadata;
      return resolveModuleVisibility(metadata) === false;
    });

    if (hasHiddenModule) {
      return { status: 'denied', fingerprint };
    }
  }

  const derivedPermissions = matchedModulesByPath.map((definition) =>
    resolveModulePermissionKey(definition),
  );
  const permissionsToCheck = guardPermissions.length ? guardPermissions : derivedPermissions;

  if (permissionsToCheck.length > 0) {
    for (const permission of permissionsToCheck) {
      const definition = modulesByPermission.get(permission);
      if (!definition) {
        return { status: 'denied', fingerprint };
      }
      const metadata = (definition.metadata ?? {}) as ModuleMetadata;
      if (resolveModuleVisibility(metadata) === false) {
        return { status: 'denied', fingerprint };
      }
    }
  }

  return { status: 'allowed', fingerprint };
}

interface RouteRendererProps {
  route: RouteDefinition;
}

function ModuleAccessBoundary({ route }: RouteRendererProps): ReactElement {
  const access = useModuleAccessState(route);
  const lastStableAccessRef = useRef<ModuleAccessState | null>(null);
  const previousFingerprintRef = useRef<string | undefined>();

  useEffect(() => {
    if (access.status === 'loading') {
      return;
    }

    const nextFingerprint = access.fingerprint;
    const previousFingerprint = previousFingerprintRef.current;

    if (
      typeof window !== 'undefined' &&
      previousFingerprint !== undefined &&
      nextFingerprint !== undefined &&
      nextFingerprint !== previousFingerprint
    ) {
      window.location.reload();
      return;
    }

    if (nextFingerprint !== undefined) {
      previousFingerprintRef.current = nextFingerprint;
    }

    lastStableAccessRef.current = access;
  }, [access]);

  if (access.status === 'loading') {
    const lastStableAccess = lastStableAccessRef.current;
    if (lastStableAccess?.status === 'allowed') {
      return route.element;
    }
    if (lastStableAccess?.status === 'denied') {
      return <Navigate to="/" replace />;
    }
    return ROUTE_LOADING_FALLBACK;
  }

  if (access.status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return route.element;
}

function RouteRenderer({ route }: RouteRendererProps): ReactElement | null {
  const location = useLocation();
  const navigate = useNavigate();
  const { encryptionEnabled, ensureToken, setDecryptedLocation } =
    useSecureRoutingContext();

  useEffect(() => {
    if (!encryptionEnabled) {
      setDecryptedLocation({ pathname: route.path, search: location.search });
      return;
    }

    if (location.pathname !== route.path) {
      return;
    }

    let cancelled = false;

    void ensureToken(route.path, location.search)
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
    route.path,
    location.pathname,
    location.search,
    setDecryptedLocation,
  ]);

  if (encryptionEnabled) {
    return null;
  }

  return <ModuleAccessBoundary route={route} />;
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

  return <ModuleAccessBoundary route={route} />;
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
              <RouteRenderer route={route} />
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
