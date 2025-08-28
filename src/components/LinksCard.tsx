import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LinkItem {
  label: string;
  href: string;
  badge?: string;
}

export interface LinksCardProps {
  title: string;
  links: LinkItem[];
  limit?: number;
}

export function LinksCard({ title, links, limit = links.length }: LinksCardProps) {
  const [expanded, setExpanded] = useState(false);
  const displayed = expanded ? links : links.slice(0, limit);
  const canToggle = links.length > limit;

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-[#ff3b30] text-white px-6 py-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col flex-1">
        <ul className="flex-1 divide-y">
          {displayed.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="flex items-center justify-between px-6 py-2 hover:bg-muted transition-colors"
              >
                <span className="text-sm text-foreground flex items-center">
                  {link.label}
                  {link.badge && (
                    <span className="ml-2 text-xs font-medium bg-green-500 text-white px-1.5 py-0.5 rounded">
                      {link.badge}
                    </span>
                  )}
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
        {canToggle && (
          <div className="flex justify-end p-4 mt-auto">
            <Button variant="default" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Voir moins' : 'Voir plus'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LinksCard;
