import { ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LinkItem {
  label: string;
  href: string;
  isNew?: boolean;
}

interface LinksCardProps {
  title: string;
  links: LinkItem[];
  moreHref?: string;
}

export function LinksCard({ title, links, moreHref }: LinksCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-[#ff3b30] px-6 py-4 text-white">
        <CardTitle className="text-2xl text-left">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="flex items-center justify-between px-6 py-3 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <span>{link.label}</span>
                <div className="flex items-center space-x-2">
                  {link.isNew && (
                    <Badge className="bg-[#34c759] text-white">New</Badge>
                  )}
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </a>
            </li>
          ))}
        </ul>
        {moreHref && (
          <div className="flex justify-end px-6 py-3">
            <a href={moreHref} className="text-sm text-[#ff3b30] hover:underline">
              Voir plus
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LinksCard;
