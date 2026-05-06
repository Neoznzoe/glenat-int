import QuickAccess, { QuickAccessItem } from '@/components/QuickAccess';
import { BookOpen, Building, CalendarDays, Download, Image, Info, PackageX, Sparkles, TrendingUp, UserPen } from 'lucide-react';
import { ReactNode } from 'react';
import { useModulePermissionsContext } from '@/context/ModulePermissionsContext';

const quickLinks: QuickAccessItem[] = [
  { label: 'Prochaines offices', icon: CalendarDays, href: '/catalogue/offices' },
  { label: 'Dernières nouveautés', icon: Sparkles, href: '/catalogue/nouveautes' },
  { label: 'Éditions', icon: Building, href: '/catalogue', permissionPath: '/catalogue/accueil' },
  { label: 'Les auteurs', icon: UserPen, href: '/catalogue/auteurs' },
  { label: 'Tout le catalogue', icon: BookOpen, href: '/catalogue/all' },

  { label: 'Télécharger le catalogue', icon: Download, href: '/catalogue/telecharger' },
  // { label: 'Kiosque', icon: Store, href: '/catalogue/kiosque' },
  { label: 'Top des commandes', icon: TrendingUp, href: '/catalogue/top-commandes' },
  { label: 'Couverture à paraître', icon: Image, href: '/catalogue/couverture-a-paraitre' },
  { label: 'Information à renseigner', icon: Info, permissionPath: '/catalogue/informations' },
  { label: 'Plus de stock', icon: PackageX, href: '/catalogue/plus-de-stock' },
];

interface CatalogueLayoutProps {
  children: ReactNode;
  active: string;
}

export function CatalogueLayout({ children, active }: CatalogueLayoutProps) {
  const { canAccessRoute } = useModulePermissionsContext();

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {(() => {
        const items = quickLinks.map((item) =>
          item.href === '/catalogue' ? { ...item, label: 'Accueil' } : item
        );
        return <QuickAccess items={items} active={active} canAccess={canAccessRoute} />;
      })()}
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default CatalogueLayout;
