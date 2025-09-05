import QuickAccess, { QuickAccessItem } from '@/components/QuickAccess';
import {
  BookOpen,
  Building,
  CalendarDays,
  Download,
  Image,
  Info,
  Mail,
  PackageX,
  Sparkles,
  Store,
  TrendingUp,
  UserPen,
} from 'lucide-react';
import { ReactNode } from 'react';

const quickLinks: QuickAccessItem[] = [
  { label: 'Éditions', icon: Building, href: '/catalogue' },
  { label: 'Tout le catalogue', icon: BookOpen, href: '/catalogue/all' },
  { label: 'Kiosque', icon: Store, href: '/catalogue/kiosque' },
  { label: 'Les auteurs', icon: UserPen },
  { label: 'Prochaines offices', icon: CalendarDays, href: '/catalogue/offices' },
  { label: 'Dernières nouveautés', icon: Sparkles, href: '/catalogue/nouveautes' },
  { label: 'Top des commandes', icon: TrendingUp },
  { label: 'Newsletter journaliste', icon: Mail },
  { label: 'Couverture à paraître', icon: Image },
  { label: 'Télécharger le catalogue', icon: Download },
  { label: 'Information à renseigner', icon: Info },
  { label: 'Plus de stock', icon: PackageX },
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
