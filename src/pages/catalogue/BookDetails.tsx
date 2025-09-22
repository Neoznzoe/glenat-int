import { useEffect, useMemo, useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SecureLink } from '@/components/routing/SecureLink';
import { useAppDispatch } from '@/hooks/redux';
import { addItem } from '@/store/cartSlice';
import {
  fetchCatalogueBook,
  fetchCatalogueRelatedBooks,
  type CatalogueBook,
} from '@/lib/catalogue';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  FileText,
  Loader2,
  Printer,
  Share2,
  ShoppingCart,
} from 'lucide-react';

const formatPrice = (price?: string | null) => {
  if (!price) {
    return null;
  }

  return price.replace('.', ',');
};

export function BookDetails() {
  const location = useDecryptedLocation();
  const ean = useMemo(() => {
    const search = location.search || '';
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    return params.get('ean');
  }, [location.search]);
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

  const handlePrintSheet = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadSheet = () => {
    toast.info('Téléchargement de la fiche disponible prochainement');
  };

  const handleShareSheet = () => {
    toast.info('Partage de la fiche disponible prochainement');
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
    const metadataEntries = details?.metadata ?? [];
    const specifications = details?.specifications ?? [];
    const infoEntries = [...metadataEntries, ...specifications];
    const contributors = details?.contributors ?? [];
    const categories = details?.categories ?? [];
    const recommendedAge = details?.recommendedAge;
    const officeCode = details?.officeCode;
    const priceTTC = formatPrice(details?.priceTTC ?? book.priceHT);
    const priceHT = formatPrice(book.priceHT);
    const summaryText = details?.summary;
    const authorBio = details?.authorBio;

    return (
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
          <Card className="rounded-2xl border shadow-sm">
            <div className="relative w-full bg-white">
              <img src={book.cover} alt={book.title} className="w-full h-auto" />
            </div>
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                {details?.availabilityStatus ?? 'Disponibilité inconnue'}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix TTC</p>
                    <p className="text-3xl font-semibold">
                      {priceTTC ? `${priceTTC} €` : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Prix HT</p>
                    <p className="text-base font-semibold">
                      {priceHT ? `${priceHT} €` : '—'}
                    </p>
                  </div>
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
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold uppercase leading-tight">
                    {book.title}
                  </h1>
                  {contributors.length > 0 ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {contributors.map((contributor) => (
                        <span
                          key={`${contributor.name}-${contributor.role}`}
                          className="inline-flex items-center gap-2"
                        >
                          <span className="font-semibold text-foreground">{contributor.name}</span>
                          <span className="font-medium text-foreground">({contributor.role})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{book.authors}</p>
                  )}
                  {recommendedAge && (
                    <div>
                      <span className="inline-flex items-center rounded-md bg-slate-200 px-4 py-1.5 text-xs font-semibold text-foreground">
                        {recommendedAge}
                      </span>
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="inline-flex items-center gap-2 self-start">
                      <Printer className="h-4 w-4" />
                      Impression
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handlePrintSheet();
                      }}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimer la fiche
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handleDownloadSheet();
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Télécharger en PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handleShareSheet();
                      }}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Partager la fiche
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm font-medium text-foreground">
                  Parution : {book.publicationDate}
                  {officeCode ? ` / Office ${officeCode}` : ''}
                </p>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center rounded-md bg-slate-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {infoEntries.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {infoEntries.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {item.label}
                      </p>
                      <p className="text-base font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <Tabs defaultValue="resume" className="w-full">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList>
                      <TabsTrigger value="resume">Résumé</TabsTrigger>
                      <TabsTrigger value="auteur">Auteur</TabsTrigger>
                      <TabsTrigger value="lire">Lire</TabsTrigger>
                      <TabsTrigger value="internet">Internet</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent
                    value="resume"
                    className="rounded-xl bg-muted/40 p-6 text-base leading-relaxed text-foreground"
                  >
                    {summaryText ? (
                      <div className="space-y-4">
                        {summaryText.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="whitespace-pre-line">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p>Aucune donnée disponible</p>
                    )}
                  </TabsContent>
                  <TabsContent
                    value="auteur"
                    className="rounded-xl bg-muted/40 p-6 text-base leading-relaxed text-foreground"
                  >
                    {authorBio ? (
                      <div className="space-y-4">
                        {authorBio.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="whitespace-pre-line">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p>Aucune donnée disponible</p>
                    )}
                  </TabsContent>
                  <TabsContent
                    value="lire"
                    className="rounded-xl bg-muted/40 p-6 text-base leading-relaxed text-foreground"
                  >
                    <p>Aucune donnée disponible</p>
                  </TabsContent>
                  <TabsContent
                    value="internet"
                    className="rounded-xl bg-muted/40 p-6 text-base leading-relaxed text-foreground"
                  >
                    <p>Aucune donnée disponible</p>
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
          <Tabs defaultValue="deja-paru" className="space-y-4">
            <TabsList className="flex-wrap justify-start gap-2 rounded-none border-b bg-transparent p-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:gap-4">
              <TabsTrigger
                value="deja-paru"
                className="-mb-px rounded-none border-b-2 border-transparent px-0 pb-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Déjà paru
              </TabsTrigger>
              <TabsTrigger
                value="a-paraitre"
                className="-mb-px rounded-none border-b-2 border-transparent px-0 pb-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                À paraître
              </TabsTrigger>
              <TabsTrigger
                value="meme-collection"
                className="-mb-px rounded-none border-b-2 border-transparent px-0 pb-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Même collection
              </TabsTrigger>
              <TabsTrigger
                value="meme-theme"
                className="-mb-px rounded-none border-b-2 border-transparent px-0 pb-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Même thème
              </TabsTrigger>
              <TabsTrigger
                value="meme-serie"
                className="-mb-px rounded-none border-b-2 border-transparent px-0 pb-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Même série
              </TabsTrigger>
              <TabsTrigger
                value="meme-auteur"
                className="-mb-px rounded-none border-b-2 border-transparent px-0 pb-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Même auteur
              </TabsTrigger>
            </TabsList>
            <TabsContent value="deja-paru" className="space-y-4">
              {relatedBooks.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {relatedBooks.map((item) => (
                    <Card key={item.ean} className="overflow-hidden rounded-2xl border shadow-sm">
                      <SecureLink
                        to={`/catalogue/book?ean=${encodeURIComponent(item.ean)}`}
                        className="group block"
                      >
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
            </TabsContent>
            <TabsContent value="a-paraitre" className="rounded-xl bg-muted/40 p-6 text-sm text-muted-foreground">
              <p>Aucune recommandation disponible pour le moment.</p>
            </TabsContent>
            <TabsContent
              value="meme-collection"
              className="rounded-xl bg-muted/40 p-6 text-sm text-muted-foreground"
            >
              <p>Aucune recommandation disponible pour le moment.</p>
            </TabsContent>
            <TabsContent value="meme-theme" className="rounded-xl bg-muted/40 p-6 text-sm text-muted-foreground">
              <p>Aucune recommandation disponible pour le moment.</p>
            </TabsContent>
            <TabsContent value="meme-serie" className="rounded-xl bg-muted/40 p-6 text-sm text-muted-foreground">
              <p>Aucune recommandation disponible pour le moment.</p>
            </TabsContent>
            <TabsContent value="meme-auteur" className="rounded-xl bg-muted/40 p-6 text-sm text-muted-foreground">
              <p>Aucune recommandation disponible pour le moment.</p>
            </TabsContent>
          </Tabs>
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
