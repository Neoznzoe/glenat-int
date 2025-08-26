import React, { useMemo } from 'react';

type Cover = {
  src: string;
  href: string;
};

type InfiniteCarouselProps = {
  covers: Cover[];
  /** Durée d'un cycle complet en secondes */
  speedSeconds?: number;
};

export function InfiniteCarousel({
  covers,
  speedSeconds = 60,
}: InfiniteCarouselProps) {
  // Duplique la liste pour l’effet boucle
  const track = useMemo(() => [...covers, ...covers], [covers]);

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] p-3"
      style={
        {
          '--baseSpeed': `${speedSeconds}s`,
        } as React.CSSProperties
      }
    >
      <div className="relative">
        <div className="marquee-track flex items-center gap-4 will-change-transform">
          {track.map((c, i) => (
            <a
              key={i}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block shrink-0 hover:opacity-90 transition-opacity"
            >
              <img
                src={c.src}
                className="h-40 w-auto rounded-md object-cover shadow"
                draggable={false}
              />
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation-name: marqueeScroll;
          animation-duration: var(--baseSpeed, 60s);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        /* Suppression du changement de vitesse au survol pour éviter les sauts */
      `}</style>
    </div>
  );
}
