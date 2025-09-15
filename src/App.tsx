import { useEffect, useState } from 'react';
import { SidebarContext } from './context/SidebarContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toaster } from '@/components/ui/sonner';
import AppRoutes from './routes';
import { jobOffers } from './pages/Emploi';
import { useMsal } from '@azure/msal-react';
import { hasMsalConfig } from './lib/msal';

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const jobCount = jobOffers.length;
  const { instance, accounts, inProgress } = useMsal();

  useEffect(() => {
    if (!hasMsalConfig) return;

    if (accounts.length === 0 && inProgress === 'none') {
      instance
        .ssoSilent({ scopes: ['User.Read'] })
        .then((response) => instance.setActiveAccount(response.account))
        .catch(() => instance.loginRedirect({ scopes: ['User.Read'] }));
    } else if (accounts.length > 0 && !instance.getActiveAccount()) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [accounts, inProgress, instance]);

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
