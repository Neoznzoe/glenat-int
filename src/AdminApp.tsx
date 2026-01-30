import { Suspense, useEffect, useState, useMemo, type ComponentType, type LazyExoticComponent } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { lazy } from 'react';
import { SquareStack, Component, Zap, Users, Palette, Newspaper, ParkingCircle, Clock, CalendarDays, BriefcaseBusiness, Bell, BookOpen, MailMinus, Monitor, type LucideIcon } from 'lucide-react';
import { PlaceholderPage } from './pages/administration/PlaceholderPage';

const AdminDashboard = lazy(() => import('./pages/administration/Dashboard'));
const Administration = lazy(() => import('./pages/administration/Administration'));
const Groups = lazy(() => import('./pages/administration/Groups'));
const Zones = lazy(() => import('./pages/administration/Zones'));
const Projects = lazy(() => import('./pages/administration/Projects'));
const Modules = lazy(() => import('./pages/administration/Modules'));
const Pages = lazy(() => import('./pages/administration/Pages'));

const loadingScreen = (
  <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
    <span
      aria-hidden="true"
      className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
    />
    <span className="sr-only">Chargement…</span>
  </div>
);

// [PERF] Route map pour éviter la chaîne de if statements (rerender-memo)
interface RouteConfig {
  component: LazyExoticComponent<ComponentType<unknown>>;
  placeholder?: {
    title: string;
    description: string;
    icon: LucideIcon;
  };
}

const ADMIN_ROUTES: Record<string, RouteConfig> = {
  '/': { component: AdminDashboard },
  '': { component: AdminDashboard },
  '/users': { component: Administration },
  '/groups': { component: Groups },
  '/zones': { component: Zones },
  '/modules': { component: Modules },
  '/pages': { component: Pages },
  '/projects': { component: Projects },
  '/blocs': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Gestion des Blocs" description="Gérez les blocs et leurs configurations." icon={SquareStack} /> })),
  },
  '/elements': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Gestion des Éléments" description="Gérez les éléments et leur contenu." icon={Component} /> })),
  },
  '/phpulse': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="PHPulse" description="Vous pouvez facilement administrer les différentes fonctionnalités de PHPulse." icon={Zap} /> })),
  },
  '/qui-fait-quoi': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Qui fait quoi ?" description="Administrez la section Qui fait quoi." icon={Users} /> })),
  },
  '/glenatee': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Glénat'ée" description="Administrez la section Glénat'ée." icon={Palette} /> })),
  },
  '/glenatdoc': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Glénat'Doc" description="Administrez la section Glénat'Doc." icon={Newspaper} /> })),
  },
  '/parking': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Plans de parking" description="Gérez les plans de parking." icon={ParkingCircle} /> })),
  },
  '/temps': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Gestion des temps" description="Administrez la gestion des temps." icon={Clock} /> })),
  },
  '/agenda': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Agenda" description="Administrez l'agenda et les événements." icon={CalendarDays} /> })),
  },
  '/emplois': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Emplois" description="Gérez les offres d'emploi." icon={BriefcaseBusiness} /> })),
  },
  '/alertes': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Alertes" description="Gérez les alertes système." icon={Bell} /> })),
  },
  '/credit-livre': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Crédit livre" description="Administrez le crédit livre." icon={BookOpen} /> })),
  },
  '/newsletter': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Désabonnement newsletter" description="Gérez les désabonnements à la newsletter." icon={MailMinus} /> })),
  },
  '/ecran-service': {
    component: lazy(() => Promise.resolve({ default: () => <PlaceholderPage title="Écran de service" description="Administrez l'écran de service." icon={Monitor} /> })),
  },
};

// Composant pour rendre le contenu basé sur le hash
function AdminContent() {
  const [hashPath, setHashPath] = useState(() => {
    const hash = window.location.hash.replace('#/admin', '') || '/';
    return hash.startsWith('/') ? hash : '/' + hash;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/admin', '') || '/';
      setHashPath(hash.startsWith('/') ? hash : '/' + hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // [PERF] Lookup O(1) au lieu de 20+ comparaisons if/else
  const RouteComponent = useMemo(() => {
    const route = ADMIN_ROUTES[hashPath];
    return route?.component ?? AdminDashboard;
  }, [hashPath]);

  return (
    <Suspense fallback={loadingScreen}>
      <RouteComponent />
    </Suspense>
  );
}

function AdminApp() {
  useEffect(() => {
    document.title = 'Administration - Glénat';
  }, []);

  return (
    <AdminLayout>
      <AdminContent />
    </AdminLayout>
  );
}

export default AdminApp;
