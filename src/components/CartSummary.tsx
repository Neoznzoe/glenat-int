import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { removeItem, updateQuantity } from '@/store/cartSlice';

export default function CartSummary() {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const total = items.reduce(
    (sum, item) => sum + parseFloat(item.priceHT) * item.quantity,
    0,
  );

  return (
    <div className="p-4 text-sm w-80">
      <ScrollArea className="max-h-96 pr-4">
        {items.map((item) => (
          <div
            key={item.ean}
            className="flex gap-2 pb-4 border-b last:border-none relative"
          >
            <img
              src={item.cover}
              alt={item.title}
              className="w-16 h-24 object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <p className="font-medium truncate" title={item.title}>
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground truncate" title={item.authors}>
                {item.authors}
              </p>
              <p className="text-xs">{parseFloat(item.priceHT).toFixed(2)} €</p>
              <Select
                value={String(item.quantity)}
                onValueChange={(value) =>
                  dispatch(
                    updateQuantity({ ean: item.ean, quantity: Number(value) }),
                  )
                }
              >
                <SelectTrigger className="h-7 w-16 mt-1">
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
      <Separator className="my-2" />
      <div className="flex justify-between font-medium mb-2">
        <span>Total</span>
        <span>{total.toFixed(2)} €</span>
      </div>
      <Separator className="my-2" />
      <Button variant="link" className="w-full justify-center">
        Voir mon panier
      </Button>
    </div>
  );
}
