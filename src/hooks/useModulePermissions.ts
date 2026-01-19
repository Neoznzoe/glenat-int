import { useQuery } from '@tanstack/react-query';
import { fetchUserViewMatrix, fetchAllModulesFromCms, type CmsModuleRecord } from '@/lib/adminApi';
import { fetchPages, type Page } from '@/lib/pagesApi';

/**
 * Normalizes a module code for use in URLs and comparisons
 * Converts to lowercase, replaces spaces with hyphens
 */
function normalizeModuleCode(code: string): string {
  return code.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Mapping of URL slugs to CMS PageCodes
 * This allows frontend URLs to differ from CMS PageCodes
 * Format: { 'url-slug': 'cms-page-code' }
 */
const URL_TO_PAGE_CODE_MAP: Record<string, string> = {
  'all': 'catalogue_all',
  'offices': 'prochaines_offices',
  'nouveautes': 'dernieres_nouveautes',
  'couverture-a-paraitre': 'catalogue_next_cover',
  'kiosque': 'kiosque',
  'book': 'book',
};

/**
 * Gets all possible PageCode matches for a URL slug
 */
function getPageCodeVariants(urlSlug: string): string[] {
  const variants = [urlSlug];

  // Add mapped variant if exists
  const mapped = URL_TO_PAGE_CODE_MAP[urlSlug];
  if (mapped && mapped !== urlSlug) {
    variants.push(mapped);
  }

  return variants;
}

export interface ModulePermission {
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  canView: boolean;
}

export interface PagePermission {
  pageId: number;
  pageCode: string;
  pageName: string;
  slug: string;
  moduleId: number;
  canView: boolean;
}

export interface ModulePermissionsResult {
  permissions: ModulePermission[];
  pagePermissions: PagePermission[];
  isLoading: boolean;
  error: Error | null;
  canAccessRoute: (path: string) => boolean;
  canAccessModule: (moduleId: number) => boolean;
  canAccessPage: (pageId: number) => boolean;
  getModuleForRoute: (path: string) => ModulePermission | undefined;
  getPageForRoute: (path: string) => PagePermission | undefined;
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

  // Fetch all CMS pages
  const {
    data: pages,
    isLoading: pagesLoading,
    error: pagesError,
  } = useQuery<Page[]>({
    queryKey: ['cms', 'all-pages'],
    queryFn: fetchPages,
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

  const isLoading = modulesLoading || pagesLoading || matrixLoading;
  const error = modulesError || pagesError || matrixError || null;

  // Build permissions map
  const permissions: ModulePermission[] = [];
  if (modules && viewMatrix) {
    const modulePermMap = new Map<number, boolean>();
    // Convert target to number since API returns string
    (viewMatrix.MODULE || []).forEach((perm) => {
      const targetId = typeof perm.target === 'string' ? parseInt(perm.target, 10) : perm.target;
      modulePermMap.set(targetId, perm.canView);
    });

    modules.forEach((module) => {
      const normalizedCode = normalizeModuleCode(module.moduleCode);
      const canView = modulePermMap.get(module.moduleId) ?? false;
      permissions.push({
        moduleId: module.moduleId,
        moduleCode: normalizedCode,
        moduleName: module.moduleName,
        canView,
      });
    });
  }

  // Build page permissions map
  const pagePermissions: PagePermission[] = [];
  if (pages && viewMatrix) {
    const pagePermMap = new Map<number, boolean>();
    // Convert target to number since API returns string
    (viewMatrix.PAGE || []).forEach((perm) => {
      const targetId = typeof perm.target === 'string' ? parseInt(perm.target, 10) : perm.target;
      pagePermMap.set(targetId, perm.canView);
    });

    pages.forEach((page) => {
      const pageId = typeof page.PageId === 'string' ? parseInt(page.PageId, 10) : page.PageId;
      const moduleId = typeof page.ModuleId === 'string' ? parseInt(page.ModuleId, 10) : page.ModuleId;
      const canView = pagePermMap.get(pageId) ?? false;
      pagePermissions.push({
        pageId,
        pageCode: page.PageCode.toLowerCase(),
        pageName: page.PageName,
        slug: page.PageCode.toLowerCase(),
        moduleId,
        canView,
      });
    });
  }

  /**
   * Check if user can access a specific route path
   * The path is matched against module codes and page slugs
   * e.g., "/catalogue" checks module "catalogue"
   * e.g., "/catalogue/offices" checks module "catalogue" AND page with slug "offices"
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

    // Normalize path: remove leading slash and split into segments
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const segments = normalizedPath.split('/').filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase();
    const secondSegment = segments[1]?.toLowerCase();

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
      return true;
    }

    // Check module permission first
    if (!matchingModule.canView) {
      return false;
    }

    // If there's a second segment, check page permissions
    if (secondSegment && pages) {
      // Get all possible PageCode variants for this URL slug
      const pageCodeVariants = getPageCodeVariants(secondSegment);

      // Find page that matches this slug within the module
      const matchingPage = pagePermissions.find(
        (perm) =>
          perm.moduleId === matchingModule.moduleId &&
          pageCodeVariants.some(
            (variant) => perm.slug === variant || perm.pageCode === variant
          )
      );

      if (matchingPage) {
        return matchingPage.canView;
      }
      // If no matching page found, allow access (page might not be in CMS)
    }

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
   * Check if user can access a specific page by ID
   */
  const canAccessPage = (pageId: number): boolean => {
    if (!userEmail) return false;
    if (isLoading) return true;

    const perm = pagePermissions.find((p) => p.pageId === pageId);
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

  /**
   * Get the page permission object for a given route
   */
  const getPageForRoute = (path: string): PagePermission | undefined => {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const segments = normalizedPath.split('/').filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase();
    const secondSegment = segments[1]?.toLowerCase();

    if (!firstSegment || !secondSegment) return undefined;

    // Find the module first
    const matchingModule = permissions.find((perm) => perm.moduleCode === firstSegment);
    if (!matchingModule) return undefined;

    // Get all possible PageCode variants for this URL slug
    const pageCodeVariants = getPageCodeVariants(secondSegment);

    // Find the page within the module
    return pagePermissions.find(
      (perm) =>
        perm.moduleId === matchingModule.moduleId &&
        pageCodeVariants.some(
          (variant) => perm.slug === variant || perm.pageCode === variant
        )
    );
  };

  return {
    permissions,
    pagePermissions,
    isLoading,
    error,
    canAccessRoute,
    canAccessModule,
    canAccessPage,
    getModuleForRoute,
    getPageForRoute,
  };
}
