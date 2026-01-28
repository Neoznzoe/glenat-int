import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAdminData';
import { useCmsModules, useCmsPages } from '@/hooks/useAdminData';

interface ProtectedRouteProps {
  children: React.ReactNode;
  moduleCode?: string;
  pageId?: number;
  fallbackPath?: string;
}

/**
 * Protects a route by checking if the user has permission to access it.
 * Redirects to fallback path (default: '/') if access is denied.
 */
export function ProtectedRoute({
  children,
  moduleCode,
  pageId,
  fallbackPath = '/',
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { data: currentUser, isLoading: loadingUser } = useCurrentUser();
  const { data: cmsModules, isLoading: loadingModules } = useCmsModules(currentUser?.id);
  const { data: cmsPages, isLoading: loadingPages } = useCmsPages(currentUser?.id);

  useEffect(() => {
    // Wait for data to load
    if (loadingUser || loadingModules || (pageId && loadingPages)) {
      return;
    }

    // If no user, redirect
    if (!currentUser) {
      console.warn('No user found, redirecting to fallback');
      navigate(fallbackPath, { replace: true });
      return;
    }

    // Super admins have access to everything
    if (currentUser.isSuperAdmin) {
      return;
    }

    // Check module access
    if (moduleCode && cmsModules) {
      const hasModuleAccess = cmsModules.some(
        (module) => module.moduleCode.toLowerCase() === moduleCode.toLowerCase()
      );

      if (!hasModuleAccess) {
        console.warn(`Access denied to module: ${moduleCode}`);
        navigate(fallbackPath, { replace: true });
        return;
      }
    }

    // Check page access
    if (pageId && cmsPages) {
      const hasPageAccess = cmsPages.some((page) => page.pageId === pageId);

      if (!hasPageAccess) {
        console.warn(`Access denied to page: ${pageId}`);
        navigate(fallbackPath, { replace: true });
        return;
      }
    }
  }, [ currentUser, cmsModules, cmsPages, moduleCode, pageId, loadingUser, loadingModules, loadingPages, navigate, fallbackPath,
  ]);

  // Show loading state while checking permissions
  if (loadingUser || loadingModules || (pageId && loadingPages)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // If we get here, user has access
  return <>{children}</>;
}
