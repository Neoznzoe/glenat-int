import { useState } from 'react';
import { SidebarContext } from './context/SidebarContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toaster } from '@/components/ui/sonner';
import AppRoutes from './routes';
import { jobOffers } from './pages/Emploi';

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const jobCount = jobOffers.length;

  return (
    <SidebarContext.Provider value={isSidebarExpanded}>
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
    </SidebarContext.Provider>
  );
}

export default App;
