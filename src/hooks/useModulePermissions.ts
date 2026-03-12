import { useQuery } from '@tanstack/react-query';
import { fetchUserViewMatrix, fetchAllModulesFromCms, fetchAllBlocsFromCms, fetchAllElementsFromCms, type CmsModuleRecord, type CmsBlocRecord, type CmsElementRecord } from '@/lib/adminApi';
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
  'accueil': 'catalogue_accueil',
  'kiosque': 'kiosque',
  'book': 'book',
  'auteurs': 'catalogue_auteurs',
  'telecharger': 'catalogue_download',
  'top-commandes': 'catalogue_top_order',
  'informations': 'catalogue_needed_info',
  'plus-de-stock': 'catalogue_no_stock',
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

export interface BlocPermission {
  blocId: number;
  blocCode: string;
  blocName: string;
  pageId: number;
  canView: boolean;
}

export interface ElementPermission {
  elementId: number;
  elementCode: string;
  elementName: string;
  blocId: number;
  canView: boolean;
}

export interface ModulePermissionsResult {
  permissions: ModulePermission[];
  pagePermissions: PagePermission[];
  blocPermissions: BlocPermission[];
  elementPermissions: ElementPermission[];
  isLoading: boolean;
  error: Error | null;
  canAccessRoute: (path: string) => boolean;
  canAccessModule: (moduleId: number) => boolean;
  canAccessPage: (pageId: number) => boolean;
  canAccessBloc: (blocCode: string) => boolean;
  canAccessElement: (elementCode: string) => boolean;
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

  // Fetch all CMS blocs
  const {
    data: blocs,
    isLoading: blocsLoading,
    error: blocsError,
  } = useQuery<CmsBlocRecord[]>({
    queryKey: ['cms', 'all-blocs'],
    queryFn: fetchAllBlocsFromCms,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch all CMS elements
  const {
    data: elements,
    isLoading: elementsLoading,
    error: elementsError,
  } = useQuery<CmsElementRecord[]>({
    queryKey: ['cms', 'all-elements'],
    queryFn: fetchAllElementsFromCms,
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

  const isLoading = modulesLoading || pagesLoading || blocsLoading || elementsLoading || matrixLoading;
  const error = modulesError || pagesError || blocsError || elementsError || matrixError || null;

  // If view matrix is empty (e.g. API returns 501), grant access to everything
  const isMatrixEmpty = viewMatrix &&
    (viewMatrix.MODULE || []).length === 0 &&
    (viewMatrix.PAGE || []).length === 0;

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
      // If matrix is empty (501 fallback), grant access by default
      const canView = isMatrixEmpty ? true : (modulePermMap.get(module.moduleId) ?? false);
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
      // If matrix is empty (501 fallback), grant access by default
      const canView = isMatrixEmpty ? true : (pagePermMap.get(pageId) ?? false);
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

  // Build bloc permissions map
  const blocPermissionsList: BlocPermission[] = [];
  if (blocs && viewMatrix) {
    const blocPermMap = new Map<number, boolean>();
    (viewMatrix.BLOC || []).forEach((perm) => {
      const targetId = typeof perm.target === 'string' ? parseInt(perm.target, 10) : perm.target;
      blocPermMap.set(targetId, perm.canView);
    });

    blocs.forEach((bloc) => {
      const canView = isMatrixEmpty ? true : (blocPermMap.get(bloc.blocId) ?? true);
      blocPermissionsList.push({
        blocId: bloc.blocId,
        blocCode: bloc.blocCode,
        blocName: bloc.blocName,
        pageId: bloc.pageId,
        canView,
      });
    });
  }

  // Build element permissions map
  const elementPermissionsList: ElementPermission[] = [];
  if (elements && viewMatrix) {
    const elementPermMap = new Map<number, boolean>();
    (viewMatrix.ELEMENT || []).forEach((perm) => {
      const targetId = typeof perm.target === 'string' ? parseInt(perm.target, 10) : perm.target;
      elementPermMap.set(targetId, perm.canView);
    });

    elements.forEach((element) => {
      const canView = isMatrixEmpty ? true : (elementPermMap.get(element.elementId) ?? true);
      elementPermissionsList.push({
        elementId: element.elementId,
        elementCode: element.elementCode,
        elementName: element.elementName,
        blocId: element.blocId,
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

      // If no matching page found in CMS, inherit from module permission
      // (page not yet registered in CMS should not block access)
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
   * Check if user can view a specific bloc by its code (e.g. "HOME_LINKS_SECTION")
   * Returns true if loading or bloc not found in CMS (graceful fallback)
   */
  const canAccessBloc = (blocCode: string): boolean => {
    if (!userEmail || isLoading) return true;
    if (!blocs || !viewMatrix) return true;

    const perm = blocPermissionsList.find(
      (p) => p.blocCode.toUpperCase() === blocCode.toUpperCase()
    );
    // If bloc not found in CMS, allow by default
    if (!perm) return true;
    return perm.canView;
  };

  /**
   * Check if user can view a specific element by its code (e.g. "HOME_TEXT_BONNE_JOURNEE")
   * Returns true if loading or element not found in CMS (graceful fallback)
   */
  const canAccessElement = (elementCode: string): boolean => {
    if (!userEmail || isLoading) return true;
    if (!elements || !viewMatrix) return true;

    const perm = elementPermissionsList.find(
      (p) => p.elementCode.toUpperCase() === elementCode.toUpperCase()
    );
    // If element not found in CMS, allow by default
    if (!perm) return true;
    return perm.canView;
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
    blocPermissions: blocPermissionsList,
    elementPermissions: elementPermissionsList,
    isLoading,
    error,
    canAccessRoute,
    canAccessModule,
    canAccessPage,
    canAccessBloc,
    canAccessElement,
    getModuleForRoute,
    getPageForRoute,
  };
}
