import QuickAccess, { QuickAccessItem } from '@/components/QuickAccess';
import { BookOpen, Building, CalendarDays, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

const quickLinks: QuickAccessItem[] = [
  { label: 'Prochaines offices', icon: CalendarDays, href: '/catalogue/offices' },
  { label: 'Dernières nouveautés', icon: Sparkles },
  { label: 'Éditions', icon: Building },
  { label: 'Tout le catalogue', icon: BookOpen },
];

interface CatalogueLayoutProps {
  children: ReactNode;
  active?: string;
}

export function CatalogueLayout({ children, active }: CatalogueLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {(() => {
        const items = quickLinks.map((item) =>
          item.href === '/catalogue' ? { ...item, label: 'Accueil' } : item
        );
        return <QuickAccess items={items} active={active} />;
      })()}
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default CatalogueLayout;
