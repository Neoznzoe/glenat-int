import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch } from '@/hooks/redux';
import { addItem } from '@/store/cartSlice';
import { toast } from 'sonner';

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
  infoLabel?: string;
  infoValue?: string | number;
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
  infoLabel,
  infoValue,
}: BookCardProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(
      addItem({
        ean,
        title,
        cover,
        authors,
        priceHT: parseFloat(priceHT),
      }),
    );
    toast.success('Ajouté au panier', { description: title });
  };
  return (
    <Card className="flex flex-col overflow-hidden min-w-[230px]">
      <div
        className="relative flex items-center justify-center p-2"
        style={{ backgroundColor: `var(${color})` }}
      >
        {ribbonText && (
          <div className="pointer-events-none absolute top-4 -right-8 rotate-45 z-20">
            <span className="block w-[120px] text-center bg-primary text-primary-foreground uppercase text-[10px] leading-4 font-semibold tracking-wide py-1 shadow-md">
              {ribbonText}
            </span>
          </div>
        )}
        <img
          src={cover}
          alt={title}
          className="h-48 w-auto shadow-md rounded object-cover"
        />
      </div>
      <div className="flex flex-col p-4 text-sm flex-1 bg-background">
        <div className="space-y-1">
          <h4 className="font-semibold text-base truncate" title={title}>
            {title}
          </h4>
          <p>{ean}</p>
          <p>{authors}</p>
          <p>
            {publisher} | {publicationDate}
          </p>
          {infoLabel && infoValue !== undefined && (
            <p>
              {infoLabel} : {infoValue}
            </p>
          )}
          <p>
            Tarif HT : {priceHT} € | Stock : {stock} ex
          </p>
        </div>
        <Separator className="my-2" />
        <div className="flex flex-col mt-auto">
          <Button variant="link" className="justify-start px-0 h-auto">
            Lire dans le kiosque{views !== undefined ? ` (${views} vues)` : ''}
          </Button>
          <Button
            size="sm"
            className="w-fit leading-none"
            onClick={handleAddToCart}
          >
            Ajouter à mon panier
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default BookCard;
