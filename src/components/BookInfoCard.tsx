import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import type { CatalogueBook } from '@/lib/catalogue';

interface BookInfoCardProps {
  book: CatalogueBook;
  priceTTC: string | null;
  priceHT: string | null;
  onAddToCart: () => void;
}

export function BookInfoCard({ book, priceTTC, priceHT, onAddToCart }: BookInfoCardProps) {
  const details = book.details;
  const availabilityNote = details?.availabilityNote;
  const availabilityDate = details?.availabilityDate;

  return (
    <Card className="rounded-2xl border shadow-sm">
      <div className="relative w-full bg-white">
        <img src={book.cover} alt={book.title} className="w-full h-auto" />
      </div>
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            {details?.availabilityStatus ?? 'Disponibilit\u00e9 inconnue'}
          </div>
          {availabilityNote && (
            <p className="text-xs text-muted-foreground">{availabilityNote}</p>
          )}
          {availabilityDate && (
            <p className="text-xs text-muted-foreground">
              Disponible le {availabilityDate}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Prix TTC</p>
              <p className="text-3xl font-semibold">
                {priceTTC ? `${priceTTC} \u20ac` : '\u2014'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Prix HT</p>
              <p className="text-base font-semibold">
                {priceHT ? `${priceHT} \u20ac` : '\u2014'}
              </p>
            </div>
          </div>
          <Button size="lg" className="w-full" onClick={onAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ajouter au panier
          </Button>
        </div>
        <Separator />
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-4">
            <span>EAN</span>
            <span className="font-medium text-foreground">{book.ean}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Date de parution</span>
            <span className="font-medium text-foreground">{book.publicationDate}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Stock disponible</span>
            <span className="font-medium text-foreground">{book.stock} ex</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
