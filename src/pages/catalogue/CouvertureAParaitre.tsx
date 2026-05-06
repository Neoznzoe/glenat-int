import { Fragment, useEffect, useMemo, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Loader2, ImageOff, CheckCircle2, Sparkles } from 'lucide-react';
import CatalogueLayout from './CatalogueLayout';
import BookCard from '@/components/BookCard';
import { SecureLink } from '@/components/routing/SecureLink';
import {
  FALLBACK_CATALOGUE_COVER,
  fetchCatalogueCover,
  fetchCatalogueOffices,
  type CatalogueBook,
} from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

const parseDisplayDate = (value: string): Date | null => {
  const segments = value.split('/');
  if (segments.length !== 3) return null;
  const [d, m, y] = segments.map(Number);
  if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return null;
  const parsed = new Date(y, m - 1, d);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

interface MissingCoverBook extends CatalogueBook {
  groupDate: string;
  groupOrder: number;
}

export function CouvertureAParaitre() {
  useScrollRestoration();

  const [missingBooks, setMissingBooks] = useState<MissingCoverBook[]>([]);
  const [totalChecked, setTotalChecked] = useState(0);
  const [totalToCheck, setTotalToCheck] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchCatalogueOffices({ hydrateCovers: false })
      .then((groups) => {
        if (!isActive) return;

        const today = new Date();
        const startOfTomorrow = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
        ).getTime();

        const candidates: Array<{ book: CatalogueBook; date: string; order: number }> = [];
        groups.forEach((group, index) => {
          const parsed = parseDisplayDate(group.date);
          if (!parsed || parsed.getTime() < startOfTomorrow) return;
          group.books.forEach((book) => {
            candidates.push({ book, date: group.date, order: index });
          });
        });

        setTotalToCheck(candidates.length);
        setLoading(false);

        if (candidates.length === 0) return;

        candidates.forEach(({ book, date, order }) => {
          void fetchCatalogueCover(book.ean)
            .then((cover) => {
              if (!isActive) return;
              if (cover === FALLBACK_CATALOGUE_COVER) {
                setMissingBooks((prev) => [
                  ...prev,
                  { ...book, groupDate: date, groupOrder: order },
                ]);
              }
            })
            .catch(() => {})
            .finally(() => {
              if (isActive) setTotalChecked((n) => n + 1);
            });
        });
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const groupedMissing = useMemo(() => {
    const map = new Map<string, { date: string; order: number; books: CatalogueBook[] }>();
    for (const book of missingBooks) {
      const existing = map.get(book.groupDate);
      if (existing) {
        existing.books.push(book);
      } else {
        map.set(book.groupDate, {
          date: book.groupDate,
          order: book.groupOrder,
          books: [book],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const dateA = parseDisplayDate(a.date);
      const dateB = parseDisplayDate(b.date);
      if (!dateA || !dateB) return a.order - b.order;
      return dateA.getTime() - dateB.getTime();
    });
  }, [missingBooks]);

  const checkInProgress = !loading && totalToCheck > 0 && totalChecked < totalToCheck;
  const checkComplete = !loading && totalToCheck > 0 && totalChecked >= totalToCheck;
  const noFutureReleases = !loading && totalToCheck === 0;

  const renderSkeleton = () => (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <SecureLink to="/">Accueil</SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <SecureLink to="/catalogue">Catalogue</SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Couverture à paraître</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
        </CardHeader>
        <div className="px-6">
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout active="Couverture à paraître">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-xl">Couverture à paraître</h3>
              {checkComplete && (
                <p className="text-sm text-muted-foreground">
                  {missingBooks.length} livre{missingBooks.length > 1 ? 's' : ''} sans couverture
                </p>
              )}
            </div>

            {checkInProgress && (
              <div className="mb-6 rounded-xl border bg-muted/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      Analyse des couvertures en cours...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {totalChecked} / {totalToCheck} livres vérifiés
                      {missingBooks.length > 0 && (
                        <>
                          {' · '}
                          <span className="inline-flex items-center gap-1 font-medium text-primary">
                            <ImageOff className="h-3 w-3" />
                            {missingBooks.length} sans couverture
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                    {totalToCheck > 0 ? Math.round((totalChecked / totalToCheck) * 100) : 0}%
                  </span>
                </div>
                <Progress
                  value={totalToCheck > 0 ? (totalChecked / totalToCheck) * 100 : 0}
                  className="mt-3 h-1.5"
                />
              </div>
            )}

            {loading && renderSkeleton()}

            {error && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>{error}</p>
              </div>
            )}

            {noFutureReleases && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>Aucune parution prévue à partir de demain.</p>
              </div>
            )}

            {checkComplete && missingBooks.length === 0 && (
              <div className="flex min-h-[calc(100vh-20rem)] flex-col items-center justify-center px-6 py-12 rounded-2xl border border-dashed border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-transparent dark:border-emerald-900/40 dark:from-emerald-950/30">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <h4 className="mt-6 text-lg font-semibold text-foreground">
                  Tout est à jour !
                </h4>
                <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
                  Toutes les futures parutions disposent déjà de leur couverture.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {totalToCheck} livre{totalToCheck > 1 ? 's' : ''} vérifié{totalToCheck > 1 ? 's' : ''}
                </div>
              </div>
            )}

            {groupedMissing.length > 0 && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {groupedMissing.map((group) => (
                  <Fragment key={group.date}>
                    <Card className="col-span-full w-fit min-w-[280px] bg-background">
                      <CardHeader className="py-2">
                        <CardTitle className="text-lg">Office du {group.date}</CardTitle>
                      </CardHeader>
                    </Card>
                    {group.books.map((book) => (
                      <BookCard key={book.ean} {...book} />
                    ))}
                  </Fragment>
                ))}
              </div>
            )}
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default CouvertureAParaitre;
