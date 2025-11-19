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
  fetchCatalogueUpcomingBooksFromSeries,
  fetchCataloguePastBooksFromSeries,
  fetchCatalogueSameCollectionBooks,
  fetchCatalogueAuthors,
  fetchCatalogueBooksByAuthors,
  type CatalogueBook,
  type CatalogueAuthor,
} from '@/lib/catalogue';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
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
  const [authors, setAuthors] = useState<CatalogueAuthor[]>([]);
  const [upcomingBooks, setUpcomingBooks] = useState<CatalogueBook[]>([]);
  const [pastBooks, setPastBooks] = useState<CatalogueBook[]>([]);
  const [sameCollectionBooks, setSameCollectionBooks] = useState<CatalogueBook[]>([]);
  const [sameAuthorBooks, setSameAuthorBooks] = useState<CatalogueBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(false);
  const [isLoadingSameCollection, setIsLoadingSameCollection] = useState(false);
  const [isLoadingSameAuthor, setIsLoadingSameAuthor] = useState(false);
  const [pastBooksIndex, setPastBooksIndex] = useState(0);
  const [upcomingBooksIndex, setUpcomingBooksIndex] = useState(0);
  const [sameCollectionBooksIndex, setSameCollectionBooksIndex] = useState(0);
  const [sameAuthorBooksIndex, setSameAuthorBooksIndex] = useState(0);
  const [pastBooksTransition, setPastBooksTransition] = useState(true);
  const [upcomingBooksTransition, setUpcomingBooksTransition] = useState(true);
  const [sameCollectionBooksTransition, setSameCollectionBooksTransition] = useState(true);
  const [sameAuthorBooksTransition, setSameAuthorBooksTransition] = useState(true);
  const [activeTab, setActiveTab] = useState('deja-paru');

  // Log pour déboguer le changement d'onglet
  useEffect(() => {
    console.log('[BookDetails] Onglet actif changé:', activeTab);
    console.log('[BookDetails] upcomingBooks.length:', upcomingBooks.length);
    console.log('[BookDetails] sameCollectionBooks.length:', sameCollectionBooks.length);
  }, [activeTab, upcomingBooks.length, sameCollectionBooks.length]);

  // Réinitialisation de l'index pour l'effet infini (après la transition)
  useEffect(() => {
    if (pastBooks.length === 0) return;

    if (pastBooksIndex >= pastBooks.length * 2) {
      const timer = setTimeout(() => {
        setPastBooksTransition(false);
        setPastBooksIndex(pastBooks.length);
        requestAnimationFrame(() => {
          setPastBooksTransition(true);
        });
      }, 300); // Attendre la fin de la transition (duration-300)
      return () => clearTimeout(timer);
    } else if (pastBooksIndex < pastBooks.length) {
      const timer = setTimeout(() => {
        setPastBooksTransition(false);
        setPastBooksIndex(pastBooks.length * 2 - 1);
        requestAnimationFrame(() => {
          setPastBooksTransition(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pastBooksIndex, pastBooks.length]);

  useEffect(() => {
    if (upcomingBooks.length === 0) return;

    if (upcomingBooksIndex >= upcomingBooks.length * 2) {
      const timer = setTimeout(() => {
        setUpcomingBooksTransition(false);
        setUpcomingBooksIndex(upcomingBooks.length);
        requestAnimationFrame(() => {
          setUpcomingBooksTransition(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    } else if (upcomingBooksIndex < upcomingBooks.length) {
      const timer = setTimeout(() => {
        setUpcomingBooksTransition(false);
        setUpcomingBooksIndex(upcomingBooks.length * 2 - 1);
        requestAnimationFrame(() => {
          setUpcomingBooksTransition(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [upcomingBooksIndex, upcomingBooks.length]);

  useEffect(() => {
    if (sameCollectionBooks.length === 0) return;

    if (sameCollectionBooksIndex >= sameCollectionBooks.length * 2) {
      const timer = setTimeout(() => {
        setSameCollectionBooksTransition(false);
        setSameCollectionBooksIndex(sameCollectionBooks.length);
        requestAnimationFrame(() => {
          setSameCollectionBooksTransition(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    } else if (sameCollectionBooksIndex < sameCollectionBooks.length) {
      const timer = setTimeout(() => {
        setSameCollectionBooksTransition(false);
        setSameCollectionBooksIndex(sameCollectionBooks.length * 2 - 1);
        requestAnimationFrame(() => {
          setSameCollectionBooksTransition(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [sameCollectionBooksIndex, sameCollectionBooks.length]);

  // Réinitialisation de l'index pour les livres du même auteur
  useEffect(() => {
    if (sameAuthorBooks.length === 0) return;

    if (sameAuthorBooksIndex >= sameAuthorBooks.length * 2) {
      const timer = setTimeout(() => {
        setSameAuthorBooksTransition(false);
        setSameAuthorBooksIndex(sameAuthorBooks.length);
        requestAnimationFrame(() => {
          setSameAuthorBooksTransition(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    } else if (sameAuthorBooksIndex < sameAuthorBooks.length) {
      const timer = setTimeout(() => {
        setSameAuthorBooksTransition(false);
        setSameAuthorBooksIndex(sameAuthorBooks.length * 2 - 1);
        requestAnimationFrame(() => {
          setSameAuthorBooksTransition(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [sameAuthorBooksIndex, sameAuthorBooks.length]);

  // Charger uniquement le livre et les livres déjà parus au démarrage
  useEffect(() => {
    let cancelled = false;

    async function loadBook(currentEan: string) {
      setIsLoading(true);

      try {
        const [bookResult, pastResult, authorsResult] = await Promise.allSettled([
          fetchCatalogueBook(currentEan),
          fetchCataloguePastBooksFromSeries(currentEan),
          fetchCatalogueAuthors(currentEan),
        ]);

        if (cancelled) {
          return;
        }

        const bookData = bookResult.status === 'fulfilled' ? bookResult.value : null;
        const pastData = pastResult.status === 'fulfilled' ? pastResult.value : [];
        const authorsData = authorsResult.status === 'fulfilled' ? authorsResult.value : [];

        setBook(bookData);
        setPastBooks(bookData ? pastData : []);
        setAuthors(bookData ? authorsData : []);
        // Initialiser au milieu de la liste dupliquée pour l'effet infini
        if (pastData.length > 0) setPastBooksIndex(pastData.length);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (!ean) {
      setBook(null);
      setAuthors([]);
      setUpcomingBooks([]);
      setPastBooks([]);
      setSameCollectionBooks([]);
      setSameAuthorBooks([]);
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

  // Charger les livres à paraître à la demande
  useEffect(() => {
    // Vérifier si on doit charger
    if (!ean) {
      console.log('[BookDetails] Pas d\'EAN, skip chargement à paraître');
      return;
    }

    if (activeTab !== 'a-paraitre') {
      console.log('[BookDetails] Onglet actif:', activeTab, '- skip chargement à paraître');
      return;
    }

    if (upcomingBooks.length > 0) {
      console.log('[BookDetails] Livres à paraître déjà chargés:', upcomingBooks.length);
      return;
    }

    if (isLoadingUpcoming) {
      console.log('[BookDetails] Chargement déjà en cours');
      return;
    }

    let cancelled = false;
    const currentEan = ean; // Capture pour TypeScript

    async function loadUpcomingBooks() {
      setIsLoadingUpcoming(true);
      console.log('[BookDetails] Démarrage du chargement des livres à paraître pour', currentEan);
      try {
        const data = await fetchCatalogueUpcomingBooksFromSeries(currentEan);
        console.log('[BookDetails] Livres à paraître récupérés:', data.length);
        if (!cancelled) {
          setUpcomingBooks(data);
          if (data.length > 0) setUpcomingBooksIndex(data.length);
        }
      } catch (error) {
        console.error('[BookDetails] Erreur lors du chargement des livres à paraître', error);
      } finally {
        if (!cancelled) {
          setIsLoadingUpcoming(false);
        }
      }
    }

    void loadUpcomingBooks();

    return () => {
      cancelled = true;
    };
  }, [ean, activeTab]);

  // Charger les livres de la même collection à la demande
  useEffect(() => {
    // Vérifier si on doit charger
    if (!ean) {
      console.log('[BookDetails] Pas d\'EAN, skip chargement même collection');
      return;
    }

    if (activeTab !== 'meme-collection') {
      console.log('[BookDetails] Onglet actif:', activeTab, '- skip chargement même collection');
      return;
    }

    if (sameCollectionBooks.length > 0) {
      console.log('[BookDetails] Livres de la même collection déjà chargés:', sameCollectionBooks.length);
      return;
    }

    if (isLoadingSameCollection) {
      console.log('[BookDetails] Chargement déjà en cours');
      return;
    }

    let cancelled = false;
    const currentEan = ean; // Capture pour TypeScript

    async function loadSameCollectionBooks() {
      setIsLoadingSameCollection(true);
      console.log('[BookDetails] Démarrage du chargement des livres de la même collection pour', currentEan);
      try {
        const data = await fetchCatalogueSameCollectionBooks(currentEan);
        console.log('[BookDetails] Livres de la même collection récupérés:', data.length);
        if (!cancelled) {
          setSameCollectionBooks(data);
          if (data.length > 0) setSameCollectionBooksIndex(data.length);
        }
      } catch (error) {
        console.error('[BookDetails] Erreur lors du chargement des livres de la même collection', error);
      } finally {
        if (!cancelled) {
          setIsLoadingSameCollection(false);
        }
      }
    }

    void loadSameCollectionBooks();

    return () => {
      cancelled = true;
    };
  }, [ean, activeTab]);

  // Charger les livres du même auteur à la demande
  useEffect(() => {
    if (!ean) {
      console.log('[BookDetails] Pas d\'EAN, skip chargement même auteur');
      return;
    }

    if (activeTab !== 'meme-auteur') {
      console.log('[BookDetails] Onglet actif:', activeTab, '- skip chargement même auteur');
      return;
    }

    if (sameAuthorBooks.length > 0) {
      console.log('[BookDetails] Livres du même auteur déjà chargés:', sameAuthorBooks.length);
      return;
    }

    if (isLoadingSameAuthor) {
      console.log('[BookDetails] Chargement déjà en cours');
      return;
    }

    if (authors.length === 0) {
      console.log('[BookDetails] Aucun auteur disponible, skip chargement');
      return;
    }

    let cancelled = false;
    const currentEan = ean; // Capture pour TypeScript

    async function loadSameAuthorBooks() {
      setIsLoadingSameAuthor(true);
      console.log('[BookDetails] Démarrage du chargement des livres du même auteur pour', currentEan, '- Auteurs:', authors.length);
      try {
        const data = await fetchCatalogueBooksByAuthors(currentEan, authors);
        console.log('[BookDetails] Livres du même auteur récupérés:', data.length);
        if (!cancelled) {
          setSameAuthorBooks(data);
          if (data.length > 0) setSameAuthorBooksIndex(data.length);
        }
      } catch (error) {
        console.error('[BookDetails] Erreur lors du chargement des livres du même auteur', error);
      } finally {
        if (!cancelled) {
          setIsLoadingSameAuthor(false);
        }
      }
    }

    void loadSameAuthorBooks();

    return () => {
      cancelled = true;
    };
  }, [ean, activeTab, authors]);

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
    const subtitle = details?.subtitle;
    const badges = details?.badges ?? [];
    const metadataEntries = details?.metadata ?? [];
    const specifications = details?.specifications ?? [];
    const infoEntries = [...metadataEntries, ...specifications];
    const stats = details?.stats ?? [];
    const contributors = details?.contributors ?? [];
    const categories = details?.categories ?? [];
    const recommendedAge = details?.recommendedAge;
    const officeCode = details?.officeCode;
    const priceTTC = formatPrice(details?.priceTTC ?? book.priceHT);
    const priceHT = formatPrice(book.priceHT);
    const summaryText = details?.summary;
    const authorBio = details?.authorBio;
    const availabilityNote = details?.availabilityNote;
    const availabilityDate = details?.availabilityDate;

    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
          <Card className="rounded-2xl border shadow-sm">
            <div className="relative w-full bg-white">
              <img src={book.cover} alt={book.title} className="w-full h-auto" />
            </div>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  {details?.availabilityStatus ?? 'Disponibilité inconnue'}
                </div>
                {availabilityNote && (
                  <p className="text-xs text-muted-foreground">{availabilityNote}</p>
                )}
                {availabilityDate && (
                  <p className="text-xs text-muted-foreground">
                    Disponible le {availabilityDate}
                  </p>
                )}
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
                  <div className="flex items-center gap-6">
                    <h1 className="text-3xl font-semibold uppercase leading-tight">
                      {book.title}
                    </h1>
                    {book.details?.universLogo && (
                      <div
                        className="flex items-center justify-center p-2"
                        style={{ backgroundColor: `var(${book.color})` }}
                      >
                        <img src={book.details.universLogo} alt="Univers" className="h-6 w-auto" />
                      </div>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-base font-medium text-muted-foreground italic">
                      {subtitle}
                    </p>
                  )}
                  {authors.length > 0 ? (
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
                      {authors.map((author, index) => {
                        const displayName = author.fullName || `${author.firstName || ''} ${author.lastName || ''}`.trim();
                        return (
                          <span key={`${author.idAuthor}-${index}`} className="text-foreground">
                            <span className="font-semibold">{displayName}</span>
                            {author.fonction && (
                              <>
                                {' '}
                                <span className="font-normal text-muted-foreground">({author.fonction})</span>
                              </>
                            )}
                            {index < authors.length - 1 && <span className="ml-2"></span>}
                          </span>
                        );
                      })}
                    </div>
                  ) : contributors.length > 0 ? (
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
                      {contributors.map((contributor, index) => (
                        <span key={`${contributor.name}-${contributor.role}`} className="text-foreground">
                          <span className="font-semibold">{contributor.name}</span>
                          {' '}
                          <span className="font-normal text-muted-foreground">({contributor.role})</span>
                          {index < contributors.length - 1 && <span className="ml-2"></span>}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{book.authors}</p>
                  )}
                  {(recommendedAge || badges.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {recommendedAge && (
                        <span className="inline-flex items-center rounded-md bg-[#EBEBEB] dark:bg-[#171716] px-4 py-1.5 text-xs font-semibold text-foreground">
                          {recommendedAge}
                        </span>
                      )}
                      {badges.map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center rounded-md bg-[#EBEBEB] dark:bg-[#171716] px-4 py-1.5 text-xs font-semibold text-foreground"
                        >
                          {badge}
                        </span>
                      ))}
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
                        className="inline-flex items-center rounded-md bg-[#EBEBEB] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground"
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
            {stats.length > 0 && (
              <Card className="rounded-2xl border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                      <div key={`${stat.label}-${stat.value}`} className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        {stat.helper && (
                          <p className="text-xs text-muted-foreground">{stat.helper}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
                    {details?.texts && details.texts.length > 0 ? (
                      <div className="space-y-6">
                        {/* 0000003 - Titre formaté comme "Points forts" */}
                        {details.texts.find(t => t.idTypeTexte === '0000003') && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">
                              {details.texts.find(t => t.idTypeTexte === '0000003')?.texte}
                            </h3>
                          </div>
                        )}

                        {/* 0000001 - Quatrième de couverture */}
                        {details.texts.find(t => t.idTypeTexte === '0000001') && (
                          <div className="space-y-4">
                            {details.texts
                              .find(t => t.idTypeTexte === '0000001')
                              ?.texte.split('\n\n')
                              .map((paragraph, index) => (
                                <p key={`0000001-${index}`} className="whitespace-pre-line">
                                  {paragraph}
                                </p>
                              ))}
                          </div>
                        )}

                        {/* 0000004 - Points forts (avec titre conditionnel) */}
                        {details.texts.find(t => t.idTypeTexte === '0000004') && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Points forts</h3>
                            {details.texts
                              .find(t => t.idTypeTexte === '0000004')
                              ?.texte.split('\n\n')
                              .map((paragraph, index) => (
                                <p key={`0000004-${index}`} className="whitespace-pre-line">
                                  {paragraph}
                                </p>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : summaryText ? (
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
                    {details?.authors && details.authors.length > 0 ? (
                      <div className="space-y-8">
                        {details.authors.map((author, index) => {
                          const authorName = author.fullName || `${author.firstName || ''} ${author.lastName || ''}`.trim();
                          const initials = authorName
                            .split(' ')
                            .map(word => word.charAt(0))
                            .filter(Boolean)
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();

                          return (
                            <div key={author.idAuthor || index} className="space-y-4">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                <div className="flex-shrink-0">
                                  {author.photo && author.photo !== '0' ? (
                                    <img
                                      src={author.photo}
                                      alt={authorName}
                                      className="h-16 w-16 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-300 dark:bg-[#171716] text-white">
                                      <span className="text-xl font-bold">{initials || 'A'}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <h3 className="text-xl font-semibold">
                                    {authorName}
                                  </h3>
                                  {author.bio && (
                                    <div className="space-y-4">
                                      {author.bio.split('\n\n').map((paragraph, pIndex) => (
                                        <p key={pIndex} className="whitespace-pre-line">
                                          {paragraph}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {index < (details.authors?.length ?? 0) - 1 && (
                                <div className="my-6 border-t border-border" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : authorBio ? (
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
                    className="rounded-xl bg-background p-0 overflow-hidden"
                  >
                    {ean ? (
                      <div className="w-full relative">
                        <style>
                          {`
                            .liseuse-wrapper {
                              position: relative;
                            }

                            .liseuse-wrapper iframe {
                              border: none;
                              box-shadow: none;
                            }

                            /* Masquer la barre de contrôle en bas */
                            .liseuse-wrapper::after {
                              content: '';
                              position: absolute;
                              bottom: 0;
                              left: 0;
                              right: 0;
                              height: 80px;
                              background: var(--background);
                              z-index: 10;
                              pointer-events: none;
                            }

                            /* Masquer la barre orange en haut si elle existe */
                            .liseuse-wrapper::before {
                              content: '';
                              position: absolute;
                              top: 0;
                              left: 0;
                              right: 0;
                              height: 60px;
                              background: var(--background);
                              z-index: 1;
                              pointer-events: none;
                            }
                          `}
                        </style>
                        <div className="liseuse-wrapper w-full bg-background">
                          <iframe
                            src={`https://bdmanga.liseuse-hachette.fr/glenat/${ean}/index.html`}
                            className="w-full border-0 bg-background"
                            style={{ minHeight: '700px', height: '80vh', display: 'block' }}
                            title={`Liseuse - ${book?.title || 'Livre'}`}
                            allowFullScreen
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-base leading-relaxed text-foreground p-6">Aucune donnée disponible</p>
                    )}
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
          <Tabs defaultValue="deja-paru" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList className="flex-wrap justify-start gap-2 rounded-none border-b bg-transparent dark:bg-transparent p-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:gap-4">
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
                value="meme-auteur"
                className="-mb-px rounded-none border-b-2 border-transparent px-0 pb-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Même auteur
              </TabsTrigger>
            </TabsList>
            <TabsContent value="deja-paru" className="space-y-4">
              {pastBooks.length > 0 ? (
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                    onClick={() => setPastBooksIndex(pastBooksIndex - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="overflow-hidden">
                    <div
                      className={`flex gap-4 ${pastBooksTransition ? 'transition-transform duration-300 ease-in-out' : ''}`}
                      style={{
                        transform: `translateX(calc(-${pastBooksIndex} * (20% + 1rem)))`,
                      }}
                    >
                      {[...pastBooks, ...pastBooks, ...pastBooks].map((item, index) => (
                        <Card
                          key={`${item.ean}-${index}`}
                          className="flex-shrink-0 w-[20%] overflow-hidden rounded-2xl border shadow-sm"
                        >
                          <SecureLink
                            to={`/catalogue/book?ean=${encodeURIComponent(item.ean)}`}
                            className="block"
                          >
                            <div
                              className="relative flex h-48 items-center justify-center"
                              style={{ backgroundColor: `var(${item.color})` }}
                            >
                              <img
                                src={item.cover}
                                alt={item.title}
                                className="h-full w-auto object-cover"
                              />
                            </div>
                            <div className="space-y-1 p-4">
                              <p className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground line-clamp-1">
                                {item.authors}
                              </p>
                            </div>
                          </SecureLink>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                    onClick={() => setPastBooksIndex(pastBooksIndex + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="rounded-xl bg-muted/40 p-6 text-sm leading-normal text-muted-foreground">
                  Aucune recommandation disponible pour le moment.
                </p>
              )}
            </TabsContent>
            <TabsContent value="a-paraitre" className="space-y-4">
              {isLoadingUpcoming ? (
                <div className="flex h-48 items-center justify-center rounded-xl bg-muted/40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : upcomingBooks.length > 0 ? (
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                    onClick={() => setUpcomingBooksIndex(upcomingBooksIndex - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="overflow-hidden">
                    <div
                      className={`flex gap-4 ${upcomingBooksTransition ? 'transition-transform duration-300 ease-in-out' : ''}`}
                      style={{
                        transform: `translateX(calc(-${upcomingBooksIndex} * (20% + 1rem)))`,
                      }}
                    >
                      {[...upcomingBooks, ...upcomingBooks, ...upcomingBooks].map((item, index) => (
                        <Card
                          key={`${item.ean}-${index}`}
                          className="flex-shrink-0 w-[20%] overflow-hidden rounded-2xl border shadow-sm"
                        >
                          <SecureLink
                            to={`/catalogue/book?ean=${encodeURIComponent(item.ean)}`}
                            className="block"
                          >
                            <div
                              className="relative flex h-48 items-center justify-center"
                              style={{ backgroundColor: `var(${item.color})` }}
                            >
                              <img
                                src={item.cover}
                                alt={item.title}
                                className="h-full w-auto object-cover"
                              />
                            </div>
                            <div className="space-y-1 p-4">
                              <p className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground line-clamp-1">
                                {item.authors}
                              </p>
                            </div>
                          </SecureLink>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                    onClick={() => setUpcomingBooksIndex(upcomingBooksIndex + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="rounded-xl bg-muted/40 p-6 text-sm leading-normal text-muted-foreground">
                  Aucune recommandation disponible pour le moment.
                </p>
              )}
            </TabsContent>
            <TabsContent value="meme-collection" className="space-y-4">
              {isLoadingSameCollection ? (
                <div className="flex h-48 items-center justify-center rounded-xl bg-muted/40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sameCollectionBooks.length > 0 ? (
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                    onClick={() => setSameCollectionBooksIndex(sameCollectionBooksIndex - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="overflow-hidden">
                    <div
                      className={`flex gap-4 ${sameCollectionBooksTransition ? 'transition-transform duration-300 ease-in-out' : ''}`}
                      style={{
                        transform: `translateX(calc(-${sameCollectionBooksIndex} * (20% + 1rem)))`,
                      }}
                    >
                      {[...sameCollectionBooks, ...sameCollectionBooks, ...sameCollectionBooks].map((item, index) => (
                        <Card
                          key={`${item.ean}-${index}`}
                          className="flex-shrink-0 w-[20%] overflow-hidden rounded-2xl border shadow-sm"
                        >
                          <SecureLink
                            to={`/catalogue/book?ean=${encodeURIComponent(item.ean)}`}
                            className="block"
                          >
                            <div
                              className="relative flex h-48 items-center justify-center"
                              style={{ backgroundColor: `var(${item.color})` }}
                            >
                              <img
                                src={item.cover}
                                alt={item.title}
                                className="h-full w-auto object-cover"
                              />
                            </div>
                            <div className="space-y-1 p-4">
                              <p className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground line-clamp-1">
                                {item.authors}
                              </p>
                            </div>
                          </SecureLink>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                    onClick={() => setSameCollectionBooksIndex(sameCollectionBooksIndex + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="rounded-xl bg-muted/40 p-6 text-sm leading-normal text-muted-foreground">
                  Aucune recommandation disponible pour le moment.
                </p>
              )}
            </TabsContent>
            <TabsContent value="meme-theme" className="rounded-xl bg-muted/40 p-6 text-sm leading-normal text-muted-foreground">
              <p>Aucune recommandation disponible pour le moment.</p>
            </TabsContent>
            <TabsContent value="meme-auteur" className="space-y-4">
              {isLoadingSameAuthor ? (
                <div className="flex h-48 items-center justify-center rounded-xl bg-muted/40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sameAuthorBooks.length > 0 ? (
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                    onClick={() => setSameAuthorBooksIndex(sameAuthorBooksIndex - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="overflow-hidden">
                    <div
                      className={`flex gap-4 ${sameAuthorBooksTransition ? 'transition-transform duration-300 ease-in-out' : ''}`}
                      style={{
                        transform: `translateX(calc(-${sameAuthorBooksIndex} * (20% + 1rem)))`,
                      }}
                    >
                      {[...sameAuthorBooks, ...sameAuthorBooks, ...sameAuthorBooks].map((item, index) => (
                        <Card
                          key={`${item.ean}-${index}`}
                          className="flex-shrink-0 w-[20%] overflow-hidden rounded-2xl border shadow-sm"
                        >
                          <SecureLink
                            to={`/catalogue/book?ean=${encodeURIComponent(item.ean)}`}
                            className="block"
                          >
                            <div
                              className="relative flex h-48 items-center justify-center"
                              style={{ backgroundColor: `var(${item.color})` }}
                            >
                              <img
                                src={item.cover}
                                alt={item.title}
                                className="h-full w-auto object-cover"
                              />
                            </div>
                            <div className="space-y-1 p-4">
                              <p className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
                                {item.title}
                              </p>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground line-clamp-1">
                                {item.authors}
                              </p>
                            </div>
                          </SecureLink>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                    onClick={() => setSameAuthorBooksIndex(sameAuthorBooksIndex + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="rounded-xl bg-muted/40 p-6 text-sm leading-normal text-muted-foreground">
                  Aucune recommandation disponible pour le moment.
                </p>
              )}
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
