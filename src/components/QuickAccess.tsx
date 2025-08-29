import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface QuickAccessItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

export interface QuickAccessProps {
  items: QuickAccessItem[];
}

export function QuickAccess({ items }: QuickAccessProps) {
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
              <Card className="flex items-center gap-2 p-3 hover:bg-muted bg-background">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="whitespace-nowrap text-sm">{item.label}</span>
              </Card>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuickAccess;
