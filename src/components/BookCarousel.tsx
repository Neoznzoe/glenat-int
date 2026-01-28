import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SecureLink } from '@/components/routing/SecureLink';
import { useInfiniteCarouselIndex } from '@/hooks/useInfiniteCarouselIndex';
import type { CatalogueBook } from '@/lib/catalogue';

interface BookCarouselProps {
  books: CatalogueBook[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function BookCarousel({ books, isLoading, emptyMessage = 'Aucune recommandation disponible pour le moment.' }: BookCarouselProps) {
  const { index, transition, prev, next } = useInfiniteCarouselIndex(books.length);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <p className="rounded-xl bg-muted/40 p-6 text-sm leading-normal text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="relative group">
      <Button variant="outline" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow-lg" onClick={prev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="overflow-hidden">
        <div
          className={`flex gap-4 ${transition ? 'transition-transform duration-300 ease-in-out' : ''}`}
          style={{ transform: `translateX(calc(-${index} * (20% + 1rem)))` }}
        >
          {[...books, ...books, ...books].map((item, i) => (
            <Card key={`${item.ean}-${i}`} className="flex-shrink-0 w-[20%] overflow-hidden rounded-2xl border shadow-sm">
              <SecureLink to={`/catalogue/book?ean=${encodeURIComponent(item.ean)}`} className="block">
                <div className="relative flex h-48 items-center justify-center" style={{ backgroundColor: `var(${item.color})` }}>
                  <img src={item.cover} alt={item.title} className="h-full w-auto object-cover" />
                </div>
                <div className="space-y-1 p-4">
                  <p className="text-sm font-semibold leading-tight text-foreground line-clamp-2">{item.title}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground line-clamp-1">{item.authors}</p>
                </div>
              </SecureLink>
            </Card>
          ))}
        </div>
      </div>
      <Button variant="outline" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 z-10 shadow-lg" onClick={next}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
