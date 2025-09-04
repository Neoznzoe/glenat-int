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

const getQuickLinks = (
  onViewEditions?: () => void,
  onViewAll?: () => void,
  onViewKiosque?: () => void,
  onViewOffices?: () => void,
  onViewNouveautes?: () => void,
): QuickAccessItem[] => [
  { label: 'Éditions', icon: Building, onClick: onViewEditions },
  { label: 'Tout le catalogue', icon: BookOpen, onClick: onViewAll },
  { label: 'Kiosque', icon: Store, onClick: onViewKiosque },
  { label: 'Les auteurs', icon: UserPen },
  { label: 'Prochaines offices', icon: CalendarDays, onClick: onViewOffices },
  { label: 'Dernières nouveautés', icon: Sparkles, onClick: onViewNouveautes },
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
  onViewEditions?: () => void;
  onViewAll?: () => void;
  onViewKiosque?: () => void;
  onViewOffices?: () => void;
  onViewNouveautes?: () => void;
}

export function CatalogueLayout({
  children,
  active,
  onViewEditions,
  onViewAll,
  onViewKiosque,
  onViewOffices,
  onViewNouveautes,
}: CatalogueLayoutProps) {
  const quickLinks = getQuickLinks(
    onViewEditions,
    onViewAll,
    onViewKiosque,
    onViewOffices,
    onViewNouveautes,
  );
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <QuickAccess items={quickLinks} active={active} />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default CatalogueLayout;
