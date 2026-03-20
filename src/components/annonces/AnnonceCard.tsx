import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, CalendarDays, Euro, Paperclip, ImageIcon } from 'lucide-react';
import type { Annonce } from '@/lib/annoncesApi';
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnnonceCardProps {
  annonce: Annonce;
}

const TYPE_COLORS: Record<string, string> = {
  'Offre': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Demande': 'bg-blue-100 text-blue-800 border-blue-200',
  'Actualité': 'bg-amber-100 text-amber-800 border-amber-200',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Véhicules': 'bg-slate-100 text-slate-700',
  'Immobilier': 'bg-orange-100 text-orange-700',
  'Multimédia': 'bg-purple-100 text-purple-700',
  'Maison': 'bg-pink-100 text-pink-700',
  'Loisir': 'bg-teal-100 text-teal-700',
  'Autre': 'bg-gray-100 text-gray-700',
};

function formatDateSafe(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (!isValid(date)) return null;
  return format(date, 'dd MMM yyyy', { locale: fr });
}

export function AnnonceCard({ annonce }: AnnonceCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const createdLabel = useMemo(() => formatDateSafe(annonce.createdAt), [annonce.createdAt]);

  const authorName = [annonce.author.firstName, annonce.author.lastName].filter(Boolean).join(' ');

  const typeClass = TYPE_COLORS[annonce.type] ?? 'bg-gray-100 text-gray-700';
  const categoryClass = CATEGORY_COLORS[annonce.category] ?? 'bg-gray-100 text-gray-700';

  const hasImages = annonce.images.length > 0;
  const coverUrl = hasImages ? annonce.images[0].large : null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
        {/* Image */}
        {coverUrl ? (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="h-44 w-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
          >
            <img
              src={coverUrl}
              alt={annonce.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </button>
        ) : (
          <div className="h-32 w-full bg-muted/40 flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 space-y-2.5 flex flex-col">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {annonce.type && (
              <Badge variant="outline" className={`text-[11px] px-1.5 py-0 ${typeClass}`}>
                {annonce.type}
              </Badge>
            )}
            {annonce.category && (
              <Badge variant="secondary" className={`text-[11px] px-1.5 py-0 ${categoryClass}`}>
                {annonce.category}
              </Badge>
            )}
            {annonce.price && (
              <Badge variant="outline" className="text-[11px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
                <Euro className="h-3 w-3 mr-0.5" />
                {annonce.price}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">{annonce.title}</h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-line flex-1">
            {annonce.description}
          </p>

          {/* Mini gallery */}
          {annonce.images.length > 1 && (
            <div className="flex gap-1.5">
              {annonce.images.map((img, i) => (
                <button
                  key={img.filename}
                  type="button"
                  onClick={() => openLightbox(i)}
                  className="h-10 w-10 rounded overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                >
                  <img
                    src={img.thumb}
                    alt={`Image ${i + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Attachments */}
          {annonce.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {annonce.attachments.map((att) => (
                <a
                  key={att.filename}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  <Paperclip className="h-3 w-3" />
                  Pièce jointe
                </a>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border/50 mt-auto">
            {authorName && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {authorName}
              </span>
            )}
            {createdLabel && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {createdLabel}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{annonce.title}</DialogTitle>
          </DialogHeader>
          {annonce.images[lightboxIndex] && (
            <div className="flex flex-col items-center gap-4">
              <img
                src={annonce.images[lightboxIndex].large}
                alt={annonce.title}
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
              {annonce.images.length > 1 && (
                <div className="flex gap-2">
                  {annonce.images.map((img, i) => (
                    <button
                      key={img.filename}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className={`h-16 w-16 rounded overflow-hidden border-2 transition-all cursor-pointer ${
                        i === lightboxIndex ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                      }`}
                    >
                      <img
                        src={img.thumb}
                        alt={`Image ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AnnonceCard;
