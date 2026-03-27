import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { SecureLink } from '@/components/routing/SecureLink';

type Cover = {
  src: string;
  href: string;
};

type InfiniteCarouselProps = {
  covers: Cover[];
  /** Pixels par seconde de défilement */
  pixelsPerSecond?: number;
};

export function InfiniteCarousel({
  covers,
  pixelsPerSecond = 50,
}: InfiniteCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [setWidthPx, setSetWidthPx] = useState(0);
  const [ready, setReady] = useState(false);

  // On triple les covers pour avoir 3 sets identiques
  // L'animation translate de 0 à -1set, et comme le set 2 est identique au set 1,
  // le reset est invisible
  const track = useMemo(() => {
    if (covers.length === 0) return [];
    return [...covers, ...covers, ...covers];
  }, [covers]);

  // Mesurer la largeur exacte d'un set (1/3 de la piste totale)
  const measure = useCallback(() => {
    if (!trackRef.current || covers.length === 0) return;
    const totalWidth = trackRef.current.scrollWidth;
    const oneSet = totalWidth / 3;
    if (oneSet > 0) {
      setSetWidthPx(oneSet);
      setReady(true);
    }
  }, [covers.length]);

  useEffect(() => {
    measure();
    // Re-mesurer au resize
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Re-mesurer quand les images se chargent (la largeur peut changer)
  useEffect(() => {
    if (!trackRef.current) return;
    const imgs = trackRef.current.querySelectorAll('img');
    let loaded = 0;
    const total = imgs.length;
    if (total === 0) return;

    const onLoad = () => {
      loaded++;
      if (loaded >= total) measure();
    };
    imgs.forEach((img) => {
      if (img.complete) {
        loaded++;
      } else {
        img.addEventListener('load', onLoad, { once: true });
      }
    });
    if (loaded >= total) measure();
  }, [track.length, measure]);

  if (covers.length === 0) return null;

  const duration = setWidthPx > 0 ? setWidthPx / pixelsPerSecond : 30;

  return (
    <div className="group rounded-xl border border-border bg-card p-3">
      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="marquee-track flex items-center gap-4 will-change-transform"
          style={{
            animationDuration: ready ? `${duration}s` : '0s',
            animationPlayState: 'running',
          }}
        >
          {track.map((c, i) => (
            <SecureLink
              key={i}
              to={c.href}
              className="block shrink-0 hover:opacity-90 transition-opacity"
            >
              <img
                src={c.src}
                className="h-40 w-28 rounded-md object-cover shadow"
                draggable={false}
              />
            </SecureLink>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marqueeSlide {
          from { transform: translateX(0); }
          to   { transform: translateX(-${setWidthPx}px); }
        }
        .marquee-track {
          animation-name: marqueeSlide;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .group:hover .marquee-track {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
