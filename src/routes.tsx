import { lazy } from 'react';
import { type RouteDefinition, SecureRoutes } from '@/lib/secureRouting';

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
  { path: '/', element: <Home />, guard: { permissions: 'home' } },
  { path: '/emploi', element: <Emploi />, guard: { permissions: 'emploi' } },
  { path: '/services', element: <Services />, guard: { permissions: 'services' } },
  {
    path: '/services/production',
    element: <Production />,
    guard: { permissions: 'services', modulePaths: '/services' },
  },
  {
    path: '/catalogue',
    element: <Catalogue />,
    guard: { permissions: 'catalogue', modulePaths: '/catalogue/offices' },
  },
  {
    path: '/catalogue/all',
    element: <CatalogueAll />,
    guard: { permissions: 'catalogue', modulePaths: '/catalogue/offices' },
  },
  {
    path: '/catalogue/kiosque',
    element: <Kiosque />,
    guard: { permissions: 'catalogue', modulePaths: '/catalogue/kiosque' },
  },
  {
    path: '/catalogue/offices',
    element: <Offices />,
    guard: { permissions: 'catalogue', modulePaths: '/catalogue/offices' },
  },
  {
    path: '/catalogue/nouveautes',
    element: <Nouveautes />,
    guard: { permissions: 'catalogue', modulePaths: '/catalogue/offices' },
  },
  {
    path: '/catalogue/couverture-a-paraitre',
    element: <CouvertureAParaitre />,
    guard: { permissions: 'catalogue', modulePaths: '/catalogue/offices' },
  },
  {
    path: '/catalogue/book',
    element: <BookDetails />,
    guard: { permissions: 'catalogue', modulePaths: '/catalogue/offices' },
  },
  { path: '/administration', element: <Administration />, guard: { permissions: 'administration' } },
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
