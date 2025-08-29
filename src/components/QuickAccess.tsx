import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface QuickAccessItem {
  label: string;
  icon: LucideIcon;
  href?: string;
}

export interface QuickAccessProps {
  items: QuickAccessItem[];
}

export function QuickAccess({ items }: QuickAccessProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Accès rapide</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.label}>
              <a
                href={item.href ?? '#'}
                className="flex items-center gap-2 p-2 rounded hover:bg-muted"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default QuickAccess;
