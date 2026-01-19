import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useModulePermissionsContext } from '@/context/ModulePermissionsContext';

interface RouteGuardProps {
  children: ReactNode;
}

/**
 * RouteGuard component that checks module and page permissions before rendering routes
 * Redirects to AccessDenied page if user doesn't have permission
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const location = useLocation();
  const { canAccessRoute, isLoading, getModuleForRoute, getPageForRoute } = useModulePermissionsContext();

  // While loading permissions, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
        />
        <span className="sr-only">Verification des permissions...</span>
      </div>
    );
  }

  // Get current path from location
  const currentPath = location.pathname;

  // Check if user has access to this route
  if (!canAccessRoute(currentPath)) {
    const module = getModuleForRoute(currentPath);
    const page = getPageForRoute(currentPath);

    // Determine if this is a page-level or module-level restriction
    const isPageRestriction = page && !page.canView && module?.canView;
    const displayName = isPageRestriction
      ? page.pageName
      : (module?.moduleName || 'ce module');

    // Redirect to access denied with info about the module/page
    return (
      <Navigate
        to="/acces-refuse"
        replace
        state={{
          from: currentPath,
          moduleName: module?.moduleName,
          moduleCode: module?.moduleCode,
          pageName: page?.pageName,
          pageCode: page?.pageCode,
          isPageRestriction,
          displayName,
        }}
      />
    );
  }

  return <>{children}</>;
}
