import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export interface EditionCardProps {
  title: string;
  color: string; // CSS variable name, e.g., '--glenat-bd'
}

export function EditionCard({ title, color }: EditionCardProps) {
  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center gap-2 px-4 py-2 text-foreground"
        style={{ backgroundColor: `var(${color})` }}
      >
        <BookOpen className="h-4 w-4" />
        <span className="font-semibold">{title}</span>
      </div>
      <CardContent className="p-4">
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
