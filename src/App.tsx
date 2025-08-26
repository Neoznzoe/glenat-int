import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Home } from './pages/Home';

function App() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Home />
        </main>
      </div>
    </div>
  );
}

export default App;