import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { removeItem, updateQuantity } from '@/store/cartSlice';

interface Props {
  onSelectOpenChange?: (open: boolean) => void;
}

export default function CartSummary({ onSelectOpenChange }: Props) {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  if (items.length === 0) {
    return (
      <div className="p-4 text-sm w-[28rem]">
        <h3 className="text-base font-medium mb-4">Votre panier</h3>
        <p className="text-muted-foreground mb-4">
          Vous n'avez encore aucun produit dans votre panier.
        </p>
        <Separator />
      </div>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + item.priceHT * item.quantity,
    0,
  );

  return (
    <div className="p-4 text-sm w-[28rem]">
      <h3 className="text-base font-medium mb-4">Votre panier</h3>
      <ScrollArea className="max-h-[32rem] overflow-y-auto pr-4">
        {items.map((item) => (
          <div
            key={item.ean}
            className="flex gap-2 py-4 border-b last:border-none relative"
          >
            <img
              src={item.cover}
              alt={item.title}
              className="w-16 h-24 object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex justify-between gap-2">
                <div className="min-w-0 max-w-[70%]">
                  <p
                    className="font-medium leading-snug overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                    title={item.title}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-xs text-muted-foreground truncate"
                    title={item.authors}
                  >
                    {item.authors}
                  </p>
                </div>
                <p className="text-sm font-medium whitespace-nowrap ml-2">
                  {(item.priceHT * item.quantity).toFixed(2)} €
                </p>
              </div>
              <Select
                value={String(item.quantity)}
                onOpenChange={onSelectOpenChange}
                onValueChange={(value) =>
                  dispatch(
                    updateQuantity({ ean: item.ean, quantity: Number(value) }),
                  )
                }
              >
                <SelectTrigger className="h-7 w-16 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-0 right-0"
              onClick={() => dispatch(removeItem(item.ean))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </ScrollArea>
      <Separator className="my-4" />
      <div className="flex justify-between font-medium mb-4">
        <span>Total</span>
        <span>{total.toFixed(2)} €</span>
      </div>
      <Separator className="my-4" />
      <Button variant="destructive" className="w-full justify-center">
        Voir mon panier
      </Button>
    </div>
  );
}
