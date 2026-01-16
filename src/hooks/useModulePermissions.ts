import { useQuery } from '@tanstack/react-query';
import { fetchUserViewMatrix, fetchAllModulesFromCms, type CmsModuleRecord } from '@/lib/adminApi';

/**
 * Normalizes a module code for use in URLs and comparisons
 * Converts to lowercase, replaces spaces with hyphens
 */
function normalizeModuleCode(code: string): string {
  return code.toLowerCase().replace(/\s+/g, '-');
}

export interface ModulePermission {
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  canView: boolean;
}

export interface ModulePermissionsResult {
  permissions: ModulePermission[];
  isLoading: boolean;
  error: Error | null;
  canAccessRoute: (path: string) => boolean;
  canAccessModule: (moduleId: number) => boolean;
  getModuleForRoute: (path: string) => ModulePermission | undefined;
}

/**
 * Hook to fetch and manage module permissions for the current user
 * Combines CMS modules with the user's view matrix to determine access
 */
export function useModulePermissions(userEmail?: string): ModulePermissionsResult {
  // Fetch all CMS modules to get the module code -> ID mapping
  const {
    data: modules,
    isLoading: modulesLoading,
    error: modulesError,
  } = useQuery<CmsModuleRecord[]>({
    queryKey: ['cms', 'all-modules'],
    queryFn: fetchAllModulesFromCms,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user's view matrix
  const {
    data: viewMatrix,
    isLoading: matrixLoading,
    error: matrixError,
  } = useQuery({
    queryKey: ['user', 'view-matrix', userEmail],
    queryFn: () => fetchUserViewMatrix(userEmail!),
    enabled: !!userEmail,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const isLoading = modulesLoading || matrixLoading;
  const error = modulesError || matrixError || null;

  // Build permissions map
  const permissions: ModulePermission[] = [];
  if (modules && viewMatrix) {
    const modulePermMap = new Map<number, boolean>();
    // Convert target to number since API returns string
    (viewMatrix.MODULE || []).forEach((perm) => {
      const targetId = typeof perm.target === 'string' ? parseInt(perm.target, 10) : perm.target;
      modulePermMap.set(targetId, perm.canView);
    });

    console.debug('[useModulePermissions] Building permissions from', modules.length, 'modules and', modulePermMap.size, 'view matrix entries');

    modules.forEach((module) => {
      const normalizedCode = normalizeModuleCode(module.moduleCode);
      const canView = modulePermMap.get(module.moduleId) ?? false;
      permissions.push({
        moduleId: module.moduleId,
        moduleCode: normalizedCode,
        moduleName: module.moduleName,
        canView,
      });
      console.debug(`[useModulePermissions] Module ${module.moduleId} "${normalizedCode}": canView=${canView}`);
    });
  }

  /**
   * Check if user can access a specific route path
   * The path is matched against module codes (e.g., "/catalogue" matches module "catalogue")
   */
  const canAccessRoute = (path: string): boolean => {
    // Still loading or no user email - allow by default until we have data
    if (!userEmail || isLoading) {
      return true;
    }

    // No data yet - allow by default
    if (!modules || !viewMatrix) {
      return true;
    }

    // Normalize path: remove leading slash and get first segment
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const firstSegment = normalizedPath.split('/')[0].toLowerCase();

    // Special case: empty path or root goes to home/accueil
    if (!firstSegment || firstSegment === '') {
      return true; // Home is always accessible
    }

    // Find module that matches this path segment
    const matchingModule = permissions.find(
      (perm) => perm.moduleCode === firstSegment
    );

    // If no module found for this route, allow access (it's not a protected route)
    if (!matchingModule) {
      console.debug(`[RouteGuard] No module found for path segment "${firstSegment}", allowing access`);
      return true;
    }

    console.debug(`[RouteGuard] Module "${matchingModule.moduleName}" (${matchingModule.moduleCode}) canView: ${matchingModule.canView}`);
    return matchingModule.canView;
  };

  /**
   * Check if user can access a specific module by ID
   */
  const canAccessModule = (moduleId: number): boolean => {
    if (!userEmail) return false;
    if (isLoading) return true;

    const perm = permissions.find((p) => p.moduleId === moduleId);
    return perm?.canView ?? false;
  };

  /**
   * Get the module permission object for a given route
   */
  const getModuleForRoute = (path: string): ModulePermission | undefined => {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const firstSegment = normalizedPath.split('/')[0].toLowerCase();

    if (!firstSegment) return undefined;

    return permissions.find((perm) => perm.moduleCode === firstSegment);
  };

  return {
    permissions,
    isLoading,
    error,
    canAccessRoute,
    canAccessModule,
    getModuleForRoute,
  };
}
