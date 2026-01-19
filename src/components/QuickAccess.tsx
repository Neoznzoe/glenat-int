import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/SidebarContext';
import { SecureLink } from '@/components/routing/SecureLink';

export interface QuickAccessItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

export interface QuickAccessProps {
  items: QuickAccessItem[];
  active?: string;
  /** Optional filter function to check if a route is accessible */
  canAccess?: (href: string) => boolean;
}

export function QuickAccess({ items, active, canAccess }: QuickAccessProps) {
  const isSidebarExpanded = useSidebar();

  // Filter items based on permissions if canAccess is provided
  const filteredItems = canAccess
    ? items.filter((item) => !item.href || canAccess(item.href))
    : items;

  return (
    <div
      className={cn(
        'w-full transition-[width] md:shrink-0',
        isSidebarExpanded ? 'md:w-48' : 'md:w-64',
      )}
    >
      <h3 className="mb-4 font-semibold text-lg">Accès rapide</h3>
      <ul className="space-y-2">
        {filteredItems.map((item) => (
          <li key={item.label}>
            <SecureLink to={item.href ?? '#'} onClick={item.onClick} className="block">
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
            </SecureLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuickAccess;
