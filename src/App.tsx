import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Home } from './pages/Home';
import { Emploi } from './pages/Emploi';

function App() {
  const [activePage, setActivePage] = useState('home');
  const jobCount = 1;

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
        </main>
      </div>
    </div>
  );
}

export default App;