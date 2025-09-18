import { type RouteDefinition, SecureRoutes } from '@/lib/secureRouting';
import { Home } from './pages/Home';
import Emploi from './pages/Emploi';
import Services from './pages/services/Services';
import Production from './pages/services/Production';
import Catalogue from './pages/catalogue/Editions';
import CatalogueAll from './pages/catalogue/CatalogueAll';
import Kiosque from './pages/catalogue/Kiosque';
import Offices from './pages/catalogue/Offices';
import Nouveautes from './pages/catalogue/Nouveautes';
import Administration from './pages/administration/Administration';

export const ROUTES_CONFIG: RouteDefinition[] = [
  { path: '/', element: <Home /> },
  { path: '/emploi', element: <Emploi /> },
  { path: '/services', element: <Services /> },
  { path: '/services/production', element: <Production /> },
  { path: '/catalogue', element: <Catalogue /> },
  { path: '/catalogue/all', element: <CatalogueAll /> },
  { path: '/catalogue/kiosque', element: <Kiosque /> },
  { path: '/catalogue/offices', element: <Offices /> },
  { path: '/catalogue/nouveautes', element: <Nouveautes /> },
  { path: '/administration', element: <Administration /> },
];

export function AppRoutes() {
  return <SecureRoutes routes={ROUTES_CONFIG} />;
}

export default AppRoutes;
