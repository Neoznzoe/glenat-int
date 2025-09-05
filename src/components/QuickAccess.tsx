import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { Link } from 'react-router-dom';

export interface QuickAccessItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

export interface QuickAccessProps {
  items: QuickAccessItem[];
  active?: string;
}

export function QuickAccess({ items, active }: QuickAccessProps) {
  const isSidebarExpanded = useSidebar();
  return (
    <div
      className={cn(
        'w-full transition-[width] md:shrink-0',
        isSidebarExpanded ? 'md:w-48' : 'md:w-64',
      )}
    >
      <h3 className="mb-4 font-semibold text-lg">Accès rapide</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link to={item.href ?? '#'} onClick={item.onClick} className="block">
              <Card
                className={cn(
                  'group flex items-center gap-2 p-3 border transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  active === item.label
                    ? 'bg-muted border-primary text-primary hover:bg-muted hover:text-primary'
                    : 'bg-background border-transparent',
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span
                  className={cn(
                    'text-sm whitespace-nowrap',
                    active === item.label && 'font-semibold',
                  )}
                >
                  {item.label}
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuickAccess;
