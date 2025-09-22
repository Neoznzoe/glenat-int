import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import CatalogueLayout from './CatalogueLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SecureLink } from '@/components/routing/SecureLink';
import { useAppDispatch } from '@/hooks/redux';
import { addItem } from '@/store/cartSlice';
import {
  fetchCatalogueBook,
  fetchCatalogueRelatedBooks,
  type CatalogueBook,
} from '@/lib/catalogue';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  CalendarDays,
  Info,
  Loader2,
  PackageCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react';

export function BookDetails() {
  const [searchParams] = useSearchParams();
  const ean = searchParams.get('ean');
  const dispatch = useAppDispatch();
  const [book, setBook] = useState<CatalogueBook | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<CatalogueBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBook(currentEan: string) {
      setIsLoading(true);

      try {
        const [bookData, relatedData] = await Promise.all([
          fetchCatalogueBook(currentEan),
          fetchCatalogueRelatedBooks(currentEan),
        ]);

        if (cancelled) {
          return;
        }

        setBook(bookData);
        setRelatedBooks(bookData ? relatedData : []);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (!ean) {
      setBook(null);
      setRelatedBooks([]);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    void loadBook(ean);

    return () => {
      cancelled = true;
    };
  }, [ean]);

  const handleAddToCart = () => {
    if (!book) {
      return;
    }

    dispatch(
      addItem({
        ean: book.ean,
        title: book.title,
        cover: book.cover,
        authors: book.authors,
        priceHT: parseFloat(book.priceHT),
      }),
    );
    toast.success('Ajouté au panier', { description: book.title });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-[500px] items-center justify-center rounded-2xl border bg-card shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="sr-only">Chargement de la fiche...</span>
        </div>
      );
    }

    if (!book) {
      return (
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-12 text-center space-y-4">
            <h2 className="text-2xl font-semibold">Livre introuvable</h2>
            <p className="text-muted-foreground">
              Nous n’avons pas pu afficher la fiche demandée. Vérifiez l’EAN ou
              retournez au catalogue.
            </p>
            <Button asChild>
              <SecureLink to="/catalogue/all">Retourner au catalogue</SecureLink>
            </Button>
          </CardContent>
        </Card>
      );
    }

    const details = book.details;
    const metadata = details?.metadata ?? [];
    const specifications = details?.specifications ?? [];
    const stats = details?.stats ?? [];
    const badges = details?.badges ?? [];

    return (
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
          <Card className="overflow-hidden rounded-2xl border shadow-sm">
            <div
              className="relative flex items-center justify-center bg-[var(--glenat-manga)] p-4"
              style={{ backgroundColor: `var(${book.color})` }}
            >
              {book.ribbonText && (
                <div className="pointer-events-none absolute top-6 -right-10 rotate-45 z-20">
                  <span className="block w-[140px] text-center bg-primary text-primary-foreground uppercase text-[11px] leading-4 font-semibold tracking-wide py-1 shadow-md">
                    {book.ribbonText}
                  </span>
                </div>
              )}
              <img
                src={book.cover}
                alt={book.title}
                className="h-[420px] w-auto rounded-lg object-cover shadow-2xl"
              />
            </div>
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                {details?.availabilityStatus ?? 'Disponibilité inconnue'}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix HT</p>
                    <p className="text-3xl font-semibold">{book.priceHT} €</p>
                  </div>
                  {details?.priceTTC && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Prix TTC</p>
                      <p className="text-xl font-semibold">{details.priceTTC} €</p>
                    </div>
                  )}
                </div>
                <Button size="lg" className="w-full" onClick={handleAddToCart}>
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
                  <span className="font-medium text-foreground">
                    {book.publicationDate}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Stock disponible</span>
                  <span className="font-medium text-foreground">{book.stock} ex</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>{details?.availabilityNote ?? 'Aucune information logistique pour le moment'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {book.publisher}
                </p>
                <h1 className="text-3xl font-semibold uppercase leading-tight">
                  {book.title}
                </h1>
                <p className="text-base text-muted-foreground">
                  {details?.subtitle ?? book.authors}
                </p>
                <p className="text-sm text-muted-foreground">{book.authors}</p>
              </div>
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <Badge key={badge} className="bg-primary/10 text-primary">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Parution : {book.publicationDate}
                </span>
                {details?.availabilityDate && (
                  <span className="inline-flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-primary" />
                    Disponibilité : {details.availabilityDate}
                  </span>
                )}
                {book.creationDate && (
                  <span className="inline-flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Fiche créée le {book.creationDate}
                  </span>
                )}
              </div>
              {metadata.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {metadata.map((item) => (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="rounded-xl border border-dashed border-border/60 bg-muted/40 px-4 py-3"
                    >
                      <p className="text-xs uppercase text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {specifications.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {specifications.map((item) => (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="rounded-xl bg-muted/30 px-4 py-3"
                    >
                      <p className="text-xs uppercase text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {stats.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <Card
                    key={`${stat.label}-${stat.value}`}
                    className="rounded-2xl border bg-gradient-to-br from-muted/70 via-background to-background p-5 shadow-sm"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {stat.value}
                    </p>
                    {stat.helper && (
                      <p className="mt-1 text-xs text-muted-foreground">{stat.helper}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <Tabs defaultValue="resume" className="w-full">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList>
                      <TabsTrigger value="resume">Résumé</TabsTrigger>
                      <TabsTrigger value="auteur">Auteur</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="resume" className="rounded-xl bg-muted/40 p-6 text-sm text-muted-foreground">
                    Aucune donnée disponible
                  </TabsContent>
                  <TabsContent value="auteur" className="rounded-xl bg-muted/40 p-6 text-sm text-muted-foreground">
                    Aucune donnée disponible
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold uppercase">Vous aimerez aussi</h2>
            <SecureLink
              to="/catalogue/all"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Voir tout
              <ArrowUpRight className="h-4 w-4" />
            </SecureLink>
          </div>
          {relatedBooks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {relatedBooks.map((item) => (
                <Card key={item.ean} className="overflow-hidden rounded-2xl border shadow-sm">
                  <SecureLink to={`/catalogue/book?ean=${encodeURIComponent(item.ean)}`} className="group block">
                    <div
                      className="relative flex h-48 items-center justify-center"
                      style={{ backgroundColor: `var(${item.color})` }}
                    >
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="h-full w-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1 p-4">
                      <p className="text-sm font-semibold leading-tight text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {item.authors}
                      </p>
                    </div>
                  </SecureLink>
                </Card>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-muted/40 p-6 text-sm text-muted-foreground">
              Aucune recommandation disponible pour le moment.
            </p>
          )}
        </div>
      </div>
    );
  };

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
            <BreadcrumbPage>{book?.title ?? 'Fiche livre'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CatalogueLayout active="Tout le catalogue">{renderContent()}</CatalogueLayout>
    </div>
  );
}

export default BookDetails;
