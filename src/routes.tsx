import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { type RouteDefinition, SecureRoutes } from '@/lib/secureRouting';

import { Home } from './pages/Home';
import { AccessDenied } from './pages/AccessDenied';
const Emploi = lazy(() => import('./pages/Emploi'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Services = lazy(() => import('./pages/services/Services'));
const Production = lazy(() => import('./pages/services/Production'));
const Catalogue = lazy(() => import('./pages/catalogue/Editions'));
const CatalogueAll = lazy(() => import('./pages/catalogue/CatalogueAll'));
const Kiosque = lazy(() => import('./pages/catalogue/Kiosque'));
const Offices = lazy(() => import('./pages/catalogue/Offices'));
const Nouveautes = lazy(() => import('./pages/catalogue/Nouveautes'));
const CouvertureAParaitre = lazy(() => import('./pages/catalogue/CouvertureAParaitre'));
const BookDetails = lazy(() => import('./pages/catalogue/BookDetails'));

export const ROUTES_CONFIG: RouteDefinition[] = [
  { path: '/', element: <Home /> },
  { path: '/acces-refuse', element: <AccessDenied /> },
  { path: '/emploi', element: <Emploi /> },
  { path: '/agenda', element: <Calendar /> },
  { path: '/calendrier', element: <Navigate to="/agenda" replace /> },
  { path: '/calendar', element: <Navigate to="/agenda" replace /> },
  { path: '/services', element: <Services /> },
  { path: '/services/production', element: <Production /> },
  { path: '/catalogue', element: <Catalogue /> },
  { path: '/catalogue/all', element: <CatalogueAll /> },
  { path: '/catalogue/kiosque', element: <Kiosque /> },
  { path: '/catalogue/offices', element: <Offices /> },
  { path: '/catalogue/nouveautes', element: <Nouveautes /> },
  { path: '/catalogue/couverture-a-paraitre', element: <CouvertureAParaitre /> },
  { path: '/catalogue/book', element: <BookDetails /> },
];

export const LAZY_ROUTE_PRELOADERS: Array<() => Promise<unknown>> = [
  () => import('./pages/Emploi'),
  () => import('./pages/Calendar'),
  () => import('./pages/services/Services'),
  () => import('./pages/services/Production'),
  () => import('./pages/catalogue/Editions'),
  () => import('./pages/catalogue/CatalogueAll'),
  () => import('./pages/catalogue/Kiosque'),
  () => import('./pages/catalogue/Offices'),
  () => import('./pages/catalogue/Nouveautes'),
  () => import('./pages/catalogue/CouvertureAParaitre'),
  () => import('./pages/catalogue/BookDetails'),
];

export function AppRoutes() {
  return <SecureRoutes routes={ROUTES_CONFIG} />;
}

export default AppRoutes;
