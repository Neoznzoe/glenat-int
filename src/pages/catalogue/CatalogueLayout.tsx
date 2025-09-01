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

const getQuickLinks = (onViewAll?: () => void): QuickAccessItem[] => [
  { label: 'Éditions', icon: Building },
  { label: 'Tout le catalogue', icon: BookOpen, onClick: onViewAll },
  { label: 'Kiosque', icon: Store },
  { label: 'Les auteurs', icon: UserPen },
  { label: 'Prochaines sorties', icon: CalendarDays },
  { label: 'Dernières nouveautés', icon: Sparkles },
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
  onViewAll?: () => void;
}

export function CatalogueLayout({ children, active, onViewAll }: CatalogueLayoutProps) {
  const quickLinks = getQuickLinks(onViewAll);
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <QuickAccess items={quickLinks} active={active} />
      <div className="md:col-span-4">{children}</div>
    </div>
  );
}

export default CatalogueLayout;
