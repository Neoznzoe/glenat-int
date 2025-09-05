import QuickAccess, { QuickAccessItem } from '@/components/QuickAccess';
import {
  BookOpen,
  Building,
  CalendarDays,
  Download,
  Image,
  Info,
  PackageX,
  Sparkles,
  TrendingUp,
  UserPen,
} from 'lucide-react';
import { ReactNode } from 'react';

const quickLinks: QuickAccessItem[] = [
  { label: 'Prochaines offices', icon: CalendarDays, href: '/catalogue/offices' },
  { label: 'Dernières nouveautés', icon: Sparkles, href: '/catalogue/nouveautes' },
  { label: 'Éditions', icon: Building, href: '/catalogue' },
  { label: 'Les auteurs', icon: UserPen },
  { label: 'Tout le catalogue', icon: BookOpen, href: '/catalogue/all' },

  { label: 'Télécharger le catalogue', icon: Download },
  // { label: 'Kiosque', icon: Store, href: '/catalogue/kiosque' },
  { label: 'Top des commandes', icon: TrendingUp },//???//
  { label: 'Couverture à paraître', icon: Image },
  { label: 'Information à renseigner', icon: Info },
  { label: 'Plus de stock', icon: PackageX },//??//
];

interface CatalogueLayoutProps {
  children: ReactNode;
  active: string;
}

export function CatalogueLayout({ children, active }: CatalogueLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <QuickAccess items={quickLinks} active={active} />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default CatalogueLayout;
