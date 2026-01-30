import { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarContext } from './context/SidebarContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toaster } from '@/components/ui/sonner';
import AppRoutes, { LAZY_ROUTE_PRELOADERS, ROUTES_CONFIG } from './routes';
import { usePublishedJobOfferCount } from '@/hooks/useJobOffers';
import { SecureRoutingProvider } from './lib/secureRouting';
import { useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/pages/Login';
import AdminApp from './AdminApp';
import { ModulePermissionsProvider } from '@/context/ModulePermissionsContext';
import { RouteGuard } from '@/components/RouteGuard';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { data: publishedJobCount, isLoading: loadingJobCount } = usePublishedJobOfferCount();
  const jobCount = loadingJobCount ? undefined : publishedJobCount;

  // Vérifier si on est sur une route admin (supporte à la fois /admin et #/admin)
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    if (typeof window === 'undefined') return false;
    return location.pathname.startsWith('/admin') || window.location.hash.startsWith('#/admin');
  });

  useEffect(() => {
    const checkAdminRoute = () => {
      const isAdmin = location.pathname.startsWith('/admin') ||
                     (typeof window !== 'undefined' && window.location.hash.startsWith('#/admin'));
      setIsAdminRoute(isAdmin);
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, [location.pathname]);

  const loadingScreen = (
    <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
      <span
        aria-hidden="true"
        className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
      />
      <span className="sr-only">Chargement…</span>
    </div>
  );

  // [PERF] bundle-preload: Échelonner les preloads pour éviter de surcharger le réseau
  useEffect(() => {
    const PRELOAD_DELAY_MS = 150; // Délai entre chaque preload
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    LAZY_ROUTE_PRELOADERS.forEach((preload, index) => {
      const timeoutId = setTimeout(() => {
        void preload().catch(() => {
          // Ignorer les erreurs de préchargement pour ne pas perturber l'expérience utilisateur
        });
      }, index * PRELOAD_DELAY_MS);
      timeoutIds.push(timeoutId);
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  if (loading) {
    return (
      <>
        {loadingScreen}
        <Toaster />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  // Si on est sur une route d'administration, on affiche l'application d'administration
  if (isAdminRoute) {
    return (
      <>
        <AdminApp />
        <Toaster />
      </>
    );
  }

  // Sinon, on affiche l'application principale
  return (
    <ModulePermissionsProvider>
      <SidebarContext.Provider value={isSidebarExpanded}>
        <SecureRoutingProvider routes={ROUTES_CONFIG}>
          <>
            <div className="flex h-screen bg-background text-foreground overflow-hidden">
              <Sidebar jobCount={jobCount} onExpandChange={setIsSidebarExpanded} />
              <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="flex-1 overflow-auto">
                  <Suspense
                    fallback={
                      <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
                        <span
                          aria-hidden="true"
                          className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
                        />
                        <span className="sr-only">Chargement…</span>
                      </div>
                    }
                  >
                    <RouteGuard>
                      <AppRoutes />
                    </RouteGuard>
                  </Suspense>
                </main>
              </div>
            </div>
            <Toaster />
          </>
        </SecureRoutingProvider>
      </SidebarContext.Provider>
    </ModulePermissionsProvider>
  );
}

export default App;
