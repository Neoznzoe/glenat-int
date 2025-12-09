import { Suspense, useEffect, useState } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { lazy } from 'react';
import * as LucideIcons from 'lucide-react';
import { PlaceholderPage } from './pages/administration/PlaceholderPage';

const AdminDashboard = lazy(() => import('./pages/administration/Dashboard'));
const Administration = lazy(() => import('./pages/administration/Administration'));

const loadingScreen = (
  <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
    <span
      aria-hidden="true"
      className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"
    />
    <span className="sr-only">Chargement…</span>
  </div>
);

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

  // Rendre le composant approprié basé sur le hashPath
  if (hashPath === '/' || hashPath === '') {
    return <Suspense fallback={loadingScreen}><AdminDashboard /></Suspense>;
  }

  if (hashPath === '/users') {
    return <Suspense fallback={loadingScreen}><Administration /></Suspense>;
  }

  if (hashPath === '/groups') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Gestion des Groupes d'Utilisateurs"
        description="Gérez les groupes d'utilisateurs et leurs droits."
        icon={LucideIcons.UsersRound}
      />
    </Suspense>;
  }

  if (hashPath === '/zones') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Gestion des Zones"
        description="Gérez les différentes zones et leurs paramètres."
        icon={LucideIcons.Globe}
      />
    </Suspense>;
  }

  if (hashPath === '/modules') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Gestion des Modules"
        description="Gérez les modules et leurs configurations."
        icon={LucideIcons.Puzzle}
      />
    </Suspense>;
  }

  if (hashPath === '/pages') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Gestion des Pages"
        description="Gérez les pages et leur contenu."
        icon={LucideIcons.FileText}
      />
    </Suspense>;
  }

  if (hashPath === '/projects') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Gestion de la table Projet"
        description="Gérez les informations et les paramètres des projets dans la base de données."
        icon={LucideIcons.FolderKanban}
      />
    </Suspense>;
  }

  if (hashPath === '/phpulse') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="PHPulse"
        description="Vous pouvez facilement administrer les différentes fonctionnalités de PHPulse."
        icon={LucideIcons.Zap}
      />
    </Suspense>;
  }

  if (hashPath === '/qui-fait-quoi') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Qui fait quoi ?"
        description="Administrez la section Qui fait quoi."
        icon={LucideIcons.Users}
      />
    </Suspense>;
  }

  if (hashPath === '/glenatee') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Glénat'ée"
        description="Administrez la section Glénat'ée."
        icon={LucideIcons.Palette}
      />
    </Suspense>;
  }

  if (hashPath === '/glenatdoc') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Glénat'Doc"
        description="Administrez la section Glénat'Doc."
        icon={LucideIcons.Newspaper}
      />
    </Suspense>;
  }

  if (hashPath === '/parking') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Plans de parking"
        description="Gérez les plans de parking."
        icon={LucideIcons.ParkingCircle}
      />
    </Suspense>;
  }

  if (hashPath === '/temps') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Gestion des temps"
        description="Administrez la gestion des temps."
        icon={LucideIcons.Clock}
      />
    </Suspense>;
  }

  if (hashPath === '/agenda') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Agenda"
        description="Administrez l'agenda et les événements."
        icon={LucideIcons.CalendarDays}
      />
    </Suspense>;
  }

  if (hashPath === '/emplois') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Emplois"
        description="Gérez les offres d'emploi."
        icon={LucideIcons.BriefcaseBusiness}
      />
    </Suspense>;
  }

  if (hashPath === '/alertes') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Alertes"
        description="Gérez les alertes système."
        icon={LucideIcons.Bell}
      />
    </Suspense>;
  }

  if (hashPath === '/credit-livre') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Crédit livre"
        description="Administrez le crédit livre."
        icon={LucideIcons.BookOpen}
      />
    </Suspense>;
  }

  if (hashPath === '/newsletter') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Désabonnement newsletter"
        description="Gérez les désabonnements à la newsletter."
        icon={LucideIcons.MailMinus}
      />
    </Suspense>;
  }

  if (hashPath === '/ecran-service') {
    return <Suspense fallback={loadingScreen}>
      <PlaceholderPage
        title="Écran de service"
        description="Administrez l'écran de service."
        icon={LucideIcons.Monitor}
      />
    </Suspense>;
  }

  // Page par défaut
  return <Suspense fallback={loadingScreen}><AdminDashboard /></Suspense>;
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
