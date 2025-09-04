import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export interface EditionCardProps {
  title: string;
  color: string;
  logo?: string;
}

export function EditionCard({ title, color, logo }: EditionCardProps) {
  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center gap-2 p-3 text-foreground"
        style={{ backgroundColor: `var(${color})` }}
      >
        {logo ? (
          <img src={logo} alt={title} className="h-7 w-7 object-contain" />
        ) : (
          <BookOpen className="h-4 w-4" />
        )}
        <span className="font-semibold text-lg" style={{ color: 'var(--black)' }}>
          {title}
        </span>
      </div>
      <CardContent className="p-4 bg-background">
        <ul className="text-sm space-y-1">
          <li>
            <a href="#" className="hover:underline">
              Voir l'univers
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Parcourir le catalogue
            </a>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

export default EditionCard;
