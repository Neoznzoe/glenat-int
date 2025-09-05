import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import Emploi from './pages/Emploi';
import Services from './pages/services/Services';
import Production from './pages/services/Production';
import Catalogue from './pages/catalogue/Editions';
import CatalogueAll from './pages/catalogue/CatalogueAll';
import Kiosque from './pages/catalogue/Kiosque';
import Offices from './pages/catalogue/Offices';
import Nouveautes from './pages/catalogue/Nouveautes';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/emploi" element={<Emploi />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/production" element={<Production />} />
      <Route path="/catalogue" element={<Catalogue />} />
      <Route path="/catalogue/all" element={<CatalogueAll />} />
      <Route path="/catalogue/kiosque" element={<Kiosque />} />
      <Route path="/catalogue/offices" element={<Offices />} />
      <Route path="/catalogue/nouveautes" element={<Nouveautes />} />
    </Routes>
  );
}

export default AppRoutes;
