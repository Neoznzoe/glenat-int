import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ExternalLink, CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LinkItem {
  label: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
  badgePosition?: 'left' | 'right';
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

  useEffect(() => {
    if (expanded) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [expanded]);

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-[#ff3b30] text-white p-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold leading-none">{title}</h3>
        <CircleHelp className="h-4 w-4" />
      </CardHeader>
      <CardContent className="p-0 flex flex-col flex-1">
        <ul className="flex-1 divide-y">
          {displayed.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`flex items-center justify-between p-3 transition-colors ${
                  link.highlight
                    ? 'bg-[#ff3b30]/10 text-[#ff3b30] font-semibold'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <span className="text-sm flex items-center">
                  {link.badge && link.badgePosition === 'left' && (
                    <span
                      className={`mr-1.5 text-sm font-semibold text-white px-2 py-0.5 rounded ${
                        link.badgeColor ?? 'bg-green-500'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                  {link.label}
                  {link.badge && link.badgePosition !== 'left' && (
                    <span
                      className={`ml-1.5 text-sm font-semibold text-white px-2 py-0.5 rounded ${
                        link.badgeColor ?? 'bg-green-500'
                      }`}
                    >
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
          <div className="flex justify-end p-3 mt-auto">
            <Button variant="default" size="sm" onClick={handleToggle}>
              {expanded ? 'Voir moins' : 'Voir plus'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LinksCard;
