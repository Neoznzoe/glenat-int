import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface BookCardProps {
  cover: string;
  title: string;
  ean: string;
  authors: string;
  publisher: string;
  publicationDate: string;
  priceHT: string;
  stock: number;
  views?: number;
  color: string;
  ribbonText?: string;
}

export function BookCard({
  cover,
  title,
  ean,
  authors,
  publisher,
  publicationDate,
  priceHT,
  stock,
  views,
  color,
  ribbonText,
}: BookCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden min-w-[230px]">
      <div
        className="relative flex items-end justify-center p-2"
        style={{ backgroundColor: `var(${color})` }}
      >
        {ribbonText && (
          <span
            className="absolute top-2 right-[-56px] rotate-45 bg-red-500 text-white text-sm px-12 py-2 shadow font-semibold"
          >
            {ribbonText}
          </span>
        )}
        <img
          src={cover}
          alt={title}
          className="h-48 w-auto shadow-md"
        />
      </div>
      <div className="flex flex-col justify-between p-4 text-sm flex-1">
        <div className="space-y-1">
          <h4 className="font-semibold text-base">{title}</h4>
          <p>{ean}</p>
          <p>{authors}</p>
          <p>
            {publisher} | {publicationDate}
          </p>
          <p>
            Tarif HT : {priceHT} € | Stock : {stock} ex
          </p>
        </div>
        <Separator className="my-2" />
        <div className="flex flex-col gap-2">
          <Button variant="link" className="justify-start px-0 h-auto">
            Lire dans le kiosque{views !== undefined ? ` (${views} vues)` : ''}
          </Button>
          <Button size="sm" className="w-fit">
            Ajouter à mon panier
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default BookCard;

