import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { SquareArrowOutUpRight, CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LinkItem {
  label: string;
  type?: 'link' | 'header' | 'text';
  href?: string;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
  badgePosition?: 'left' | 'right';
  separator?: boolean;
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
      <CardHeader className="bg-[#ff3b30] text-white p-4 flex flex-row items-center justify-between space-y-0">
        <h3 className="text-lg font-semibold leading-none">{title}</h3>
        <CircleHelp className="h-4 w-4" />
      </CardHeader>
      <CardContent className="p-0 flex flex-col flex-1">
        <ul className="flex-1">
          {displayed.map((link, idx) => (
            <li
              key={link.label}
              className={`mx-4 ${
                (link.separator ?? idx !== 0) ? 'border-t border-muted' : ''
              }`}
            >
              {link.type === 'link' || (link.href && !link.type) ? (
                <a
                  href={link.href}
                  className={`flex items-center justify-between py-2 transition-colors ${
                    link.highlight
                      ? 'text-[#ff3b30] font-semibold'
                      : 'hover:text-[#ff3b30]'
                  }`}
                >
                  <span
                    className={`text-base flex items-center ${
                      link.label.includes('/') ? 'text-gray-700' : ''
                    }`}
                  >
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
                  <SquareArrowOutUpRight className="h-3 w-3 text-muted-foreground" />
                </a>
              ) : (
                <span
                  className={`flex items-center py-2 text-base ${
                    link.type === 'header' ? 'font-semibold' : ''
                  } ${link.label.includes('/') ? 'text-gray-700' : ''}`}
                >
                  {link.label}
                </span>
              )}
            </li>
          ))}
        </ul>
        {canToggle && (
          <div className="flex justify-end p-4 mt-auto">
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
