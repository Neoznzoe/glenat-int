import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { SidebarContext } from './context/SidebarContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toaster } from '@/components/ui/sonner';
import AppRoutes, { LAZY_ROUTE_PRELOADERS, ROUTES_CONFIG } from './routes';
import { usePublishedJobOfferCount } from '@/hooks/useJobOffers';
import { SecureRoutingProvider } from './lib/secureRouting';
import { useAuth } from '@/context/AuthContext';
import Login from './pages/Login';

function App() {
  const { user, loading } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { data: publishedJobCount, isLoading: loadingJobCount } =
    usePublishedJobOfferCount(Boolean(user));
  const jobCount = loadingJobCount ? undefined : publishedJobCount;

  useEffect(() => {
    if (!user) {
      return;
    }

    LAZY_ROUTE_PRELOADERS.forEach((preload) => {
      void preload().catch(() => {
        // Ignorer les erreurs de préchargement pour ne pas perturber l'expérience utilisateur
      });
    });
  }, [user]);

  useEffect(() => {
    if (user) {
      console.log('Utilisateur connecté :', user);
    }
  }, [user]);

  let content: ReactNode;

  if (loading) {
    content = (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
        />
        <span className="sr-only">Chargement…</span>
      </div>
    );
  } else if (!user) {
    content = <Login />;
  } else {
    content = (
      <SidebarContext.Provider value={isSidebarExpanded}>
        <SecureRoutingProvider routes={ROUTES_CONFIG}>
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
        </SecureRoutingProvider>
      </SidebarContext.Provider>
    );
  }

  return (
    <>
      {content}
      <Toaster />
    </>
  );
}

export default App;
