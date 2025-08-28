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
  seeMoreHref?: string;
}

export function LinksCard({ title, links, seeMoreHref }: LinksCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-[#ff3b30] text-white px-6 py-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col flex-1">
        <ul className="flex-1 divide-y">
          {links.map((link) => (
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
        {seeMoreHref && (
          <div className="flex justify-end p-4 mt-auto">
            <Button variant="default" size="sm" asChild>
              <a href={seeMoreHref}>Voir plus</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LinksCard;
