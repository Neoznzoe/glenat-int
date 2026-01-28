import { useState, useEffect } from 'react';

export function useInfiniteCarouselIndex(itemCount: number) {
  const [index, setIndex] = useState(itemCount);
  const [transition, setTransition] = useState(true);

  useEffect(() => {
    if (itemCount > 0) {
      setIndex(itemCount);
    }
  }, [itemCount]);

  useEffect(() => {
    if (itemCount === 0) return;

    if (index >= itemCount * 2) {
      const timer = setTimeout(() => {
        setTransition(false);
        setIndex(itemCount);
        requestAnimationFrame(() => {
          setTransition(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    } else if (index < itemCount) {
      const timer = setTimeout(() => {
        setTransition(false);
        setIndex(itemCount * 2 - 1);
        requestAnimationFrame(() => {
          setTransition(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [index, itemCount]);

  const prev = () => setIndex((i) => i - 1);
  const next = () => setIndex((i) => i + 1);

  return { index, setIndex, transition, prev, next };
}
