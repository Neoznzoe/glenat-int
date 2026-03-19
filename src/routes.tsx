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
const QuiFaitQuoiHome = lazy(() => import('./pages/qui-fait-quoi/QuiFaitQuoiHome'));
const Groupes = lazy(() => import('./pages/qui-fait-quoi/Groupes'));
const Company = lazy(() => import('./pages/qui-fait-quoi/Company'));
const Departement = lazy(() => import('./pages/qui-fait-quoi/Departement'));
const EmployeeFiche = lazy(() => import('./pages/qui-fait-quoi/EmployeeFiche'));
const DocsHome = lazy(() => import('./pages/docs/DocsHome'));
const DocsDocuments = lazy(() => import('./pages/docs/DocsDocuments'));
const DocsCategorie = lazy(() => import('./pages/docs/DocsCategorie'));

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
  { path: '/qui-fait-quoi', element: <QuiFaitQuoiHome /> },
  { path: '/qui-fait-quoi/groupes', element: <Groupes /> },
  { path: '/qui-fait-quoi/company', element: <Company /> },
  { path: '/qui-fait-quoi/departement', element: <Departement /> },
  { path: '/qui-fait-quoi/employe', element: <EmployeeFiche /> },
  { path: '/glenat-doc', element: <DocsHome /> },
  { path: '/glenat-doc/categorie', element: <DocsCategorie /> },
  { path: '/glenat-doc/documents', element: <DocsDocuments /> },
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
  () => import('./pages/qui-fait-quoi/QuiFaitQuoiHome'),
  () => import('./pages/qui-fait-quoi/Groupes'),
  () => import('./pages/qui-fait-quoi/Company'),
  () => import('./pages/qui-fait-quoi/Departement'),
  () => import('./pages/qui-fait-quoi/EmployeeFiche'),
  () => import('./pages/docs/DocsHome'),
  () => import('./pages/docs/DocsCategorie'),
  () => import('./pages/docs/DocsDocuments'),
];

export function AppRoutes() {
  return <SecureRoutes routes={ROUTES_CONFIG} />;
}

export default AppRoutes;
