import { Suspense, useEffect, useState } from 'react';
import { SidebarContext } from './context/SidebarContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toaster } from '@/components/ui/sonner';
import AppRoutes, { LAZY_ROUTE_PRELOADERS, ROUTES_CONFIG } from './routes';
import { useJobOffers } from '@/hooks/useJobOffers';
import { SecureRoutingProvider } from './lib/secureRouting';
import { useCurrentUser } from '@/hooks/useAdminData';

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { data: jobOffers, isLoading: loadingJobOffers } = useJobOffers();
  const jobCount = loadingJobOffers ? undefined : jobOffers?.length ?? 0;
  const {
    isPending: loadingCurrentUser,
    isError: failedToLoadCurrentUser,
    error: currentUserError,
  } = useCurrentUser();

  useEffect(() => {
    LAZY_ROUTE_PRELOADERS.forEach((preload) => {
      void preload().catch(() => {
        // Ignorer les erreurs de préchargement pour ne pas perturber l'expérience utilisateur
      });
    });
  }, []);

  if (loadingCurrentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
        />
        <span className="sr-only">Chargement du profil utilisateur…</span>
      </div>
    );
  }

  if (failedToLoadCurrentUser) {
    const message =
      currentUserError instanceof Error
        ? currentUserError.message
        : "Impossible de charger le profil de l'utilisateur.";

    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-background text-foreground">
        <p className="text-lg font-semibold">Une erreur est survenue</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
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
                  <AppRoutes />
                </Suspense>
              </main>
            </div>
          </div>
          <Toaster />
        </>
      </SecureRoutingProvider>
    </SidebarContext.Provider>
  );
}

export default App;
