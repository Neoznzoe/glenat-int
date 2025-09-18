import { useState } from 'react';
import { SidebarContext } from './context/SidebarContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toaster } from '@/components/ui/sonner';
import AppRoutes, { ROUTES_CONFIG } from './routes';
import { jobOffers } from './pages/Emploi';
import { SecureRoutingProvider } from './lib/secureRouting';

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const jobCount = jobOffers.length;

  return (
    <SidebarContext.Provider value={isSidebarExpanded}>
      <SecureRoutingProvider routes={ROUTES_CONFIG}>
        <>
          <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar jobCount={jobCount} onExpandChange={setIsSidebarExpanded} />
            <div className="flex-1 flex flex-col">
              <Topbar />
              <main className="flex-1 overflow-auto">
                <AppRoutes />
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
