import { ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LinkItem {
  label: string;
  href: string;
  isNew?: boolean;
}

interface LinksCardProps {
  title: string;
  links: LinkItem[];
  showMore?: boolean;
  showLess?: boolean;
  onShowMore?: () => void;
  onShowLess?: () => void;
}

export function LinksCard({
  title,
  links,
  showMore,
  showLess,
  onShowMore,
  onShowLess,
}: LinksCardProps) {
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="bg-[#ff3b30] px-6 py-4 text-white">
        <CardTitle className="text-2xl text-left">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-full">
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
        {(showMore || showLess) && (
          <div className="flex justify-end mt-auto pt-4 px-6 pb-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => (showMore ? onShowMore?.() : onShowLess?.())}
            >
              {showMore ? 'Voir plus' : 'Voir moins'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LinksCard;
