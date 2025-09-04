import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';

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
        isSidebarExpanded ? 'md:w-16' : 'md:w-64',
      )}
    >
      <h3
        className={cn(
          'mb-4 font-semibold text-lg',
          isSidebarExpanded && 'md:sr-only',
        )}
      >
        Accès rapide
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <a
              href={item.href ?? '#'}
              onClick={item.onClick}
              className="block"
            >
              <Card
                className={cn(
                  'group flex items-center gap-2 p-3 border transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  active === item.label
                    ? 'bg-muted border-primary text-primary hover:bg-muted hover:text-primary'
                    : 'bg-background border-transparent',
                  isSidebarExpanded && 'md:p-2 md:justify-center',
                )}
              >
                <item.icon className="h-4 w-4" />
                <span
                  className={cn(
                    'whitespace-nowrap text-sm',
                    active === item.label && 'font-semibold',
                    isSidebarExpanded && 'md:hidden',
                  )}
                >
                  {item.label}
                </span>
              </Card>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuickAccess;
