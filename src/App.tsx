import { Suspense, useEffect, useState } from 'react';
import { SidebarContext } from './context/SidebarContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toaster } from '@/components/ui/sonner';
import AppRoutes, { LAZY_ROUTE_PRELOADERS, ROUTES_CONFIG } from './routes';
import { jobOffers } from '@/data/jobOffers';
import { SecureRoutingProvider } from './lib/secureRouting';

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const jobCount = jobOffers.length;

  useEffect(() => {
    LAZY_ROUTE_PRELOADERS.forEach((preload) => {
      void preload().catch(() => {
        // Ignorer les erreurs de préchargement pour ne pas perturber l'expérience utilisateur
      });
    });
  }, []);

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
                    <div className="flex justify-center py-12">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
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
