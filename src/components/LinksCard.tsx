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
      <CardHeader className="flex items-center justify-between bg-[#ff3b30] px-6 py-4 text-white">
        <CardTitle className="text-lg">{title}</CardTitle>
        {moreHref && (
          <a href={moreHref} className="text-sm hover:underline">
            Voir plus
          </a>
        )}
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
      </CardContent>
    </Card>
  );
}

export default LinksCard;
