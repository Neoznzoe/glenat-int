import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Home } from './pages/Home';
import Emploi, { jobOffers } from './pages/Emploi';
import Catalogue from './pages/catalogue/Editions';
import CatalogueAll from './pages/catalogue/CatalogueAll';
import Kiosque from './pages/catalogue/Kiosque';
import Offices from './pages/catalogue/Offices';

function App() {
  const [activePage, setActivePage] = useState('home');
  const jobCount = jobOffers.length;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        jobCount={jobCount}
      />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto">
          {activePage === 'home' && <Home />}
          {activePage === 'emploi' && <Emploi />}
          {activePage === 'catalogue' && (
            <Catalogue
              onViewAll={() => setActivePage('catalogueAll')}
              onViewKiosque={() => setActivePage('kiosque')}
              onViewOffices={() => setActivePage('offices')}
            />
          )}
          {activePage === 'catalogueAll' && (
            <CatalogueAll
              onBackToCatalogue={() => setActivePage('catalogue')}
              onViewKiosque={() => setActivePage('kiosque')}
              onViewOffices={() => setActivePage('offices')}
            />
          )}
          {activePage === 'kiosque' && (
            <Kiosque
              onBackToCatalogue={() => setActivePage('catalogue')}
              onViewAll={() => setActivePage('catalogueAll')}
              onViewOffices={() => setActivePage('offices')}
            />
          )}
          {activePage === 'offices' && (
            <Offices
              onBackToCatalogue={() => setActivePage('catalogue')}
              onViewAll={() => setActivePage('catalogueAll')}
              onViewKiosque={() => setActivePage('kiosque')}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
