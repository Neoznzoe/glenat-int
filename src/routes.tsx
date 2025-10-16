import { lazy } from 'react';
import { type RouteDefinition, SecureRoutes } from '@/lib/secureRouting';
import { ModuleAccessGuard } from '@/components/routing/ModuleAccessGuard';

import { Home } from './pages/Home';
const Emploi = lazy(() => import('./pages/Emploi'));
const Services = lazy(() => import('./pages/services/Services'));
const Production = lazy(() => import('./pages/services/Production'));
const Catalogue = lazy(() => import('./pages/catalogue/Editions'));
const CatalogueAll = lazy(() => import('./pages/catalogue/CatalogueAll'));
const Kiosque = lazy(() => import('./pages/catalogue/Kiosque'));
const Offices = lazy(() => import('./pages/catalogue/Offices'));
const Nouveautes = lazy(() => import('./pages/catalogue/Nouveautes'));
const CouvertureAParaitre = lazy(() => import('./pages/catalogue/CouvertureAParaitre'));
const BookDetails = lazy(() => import('./pages/catalogue/BookDetails'));
const Administration = lazy(() => import('./pages/administration/Administration'));

export const ROUTES_CONFIG: RouteDefinition[] = [
  { path: '/', element: <Home /> },
  {
    path: '/emploi',
    element: (
      <ModuleAccessGuard permission="emploi">
        <Emploi />
      </ModuleAccessGuard>
    ),
  },
  {
    path: '/services',
    element: (
      <ModuleAccessGuard permission="services">
        <Services />
      </ModuleAccessGuard>
    ),
  },
  {
    path: '/services/production',
    element: (
      <ModuleAccessGuard permission="services">
        <Production />
      </ModuleAccessGuard>
    ),
  },
  {
    path: '/catalogue',
    element: (
      <ModuleAccessGuard permission="catalogue">
        <Catalogue />
      </ModuleAccessGuard>
    ),
  },
  {
    path: '/catalogue/all',
    element: (
      <ModuleAccessGuard permission="catalogue">
        <CatalogueAll />
      </ModuleAccessGuard>
    ),
  },
  {
    path: '/catalogue/kiosque',
    element: (
      <ModuleAccessGuard permission="kiosque">
        <Kiosque />
      </ModuleAccessGuard>
    ),
  },
  {
    path: '/catalogue/offices',
    element: (
      <ModuleAccessGuard permission="catalogue">
        <Offices />
      </ModuleAccessGuard>
    ),
  },
  {
    path: '/catalogue/nouveautes',
    element: (
      <ModuleAccessGuard permission="catalogue">
        <Nouveautes />
      </ModuleAccessGuard>
    ),
  },
  {
    path: '/catalogue/couverture-a-paraitre',
    element: (
      <ModuleAccessGuard permission="catalogue">
        <CouvertureAParaitre />
      </ModuleAccessGuard>
    ),
  },
  {
    path: '/catalogue/book',
    element: (
      <ModuleAccessGuard permission="catalogue">
        <BookDetails />
      </ModuleAccessGuard>
    ),
  },
  {
    path: '/administration',
    element: (
      <ModuleAccessGuard permission="administration">
        <Administration />
      </ModuleAccessGuard>
    ),
  },
];

export const LAZY_ROUTE_PRELOADERS: Array<() => Promise<unknown>> = [
  () => import('./pages/Emploi'),
  () => import('./pages/services/Services'),
  () => import('./pages/services/Production'),
  () => import('./pages/catalogue/Editions'),
  () => import('./pages/catalogue/CatalogueAll'),
  () => import('./pages/catalogue/Kiosque'),
  () => import('./pages/catalogue/Offices'),
  () => import('./pages/catalogue/Nouveautes'),
  () => import('./pages/catalogue/CouvertureAParaitre'),
  () => import('./pages/catalogue/BookDetails'),
  () => import('./pages/administration/Administration'),
];

export function AppRoutes() {
  return <SecureRoutes routes={ROUTES_CONFIG} />;
}

export default AppRoutes;
