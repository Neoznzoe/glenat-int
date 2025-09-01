import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  return (
    <div>
      <h3 className="mb-4 font-semibold text-xl">Accès rapide</h3>
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
                  'flex items-center gap-2 p-3 hover:bg-muted border transition-colors',
                  active === item.label
                    ? 'bg-muted border-primary text-primary'
                    : 'bg-background border-transparent',
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4',
                    active === item.label
                      ? 'text-primary'
                      : 'text-muted-foreground',
                  )}
                />
                <span
                  className={cn(
                    'whitespace-nowrap text-sm',
                    active === item.label && 'font-semibold text-primary',
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
