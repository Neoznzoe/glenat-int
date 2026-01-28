import { useEffect, useMemo, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import CatalogueLayout from './CatalogueLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SecureLink } from '@/components/routing/SecureLink';
import { useAppDispatch } from '@/hooks/redux';
import { addItem } from '@/store/cartSlice';
import { fetchCatalogueBook, fetchCatalogueUpcomingBooksFromSeries, fetchCataloguePastBooksFromSeries, fetchCatalogueSameCollectionBooks, fetchCatalogueAuthors, fetchCatalogueBooksByAuthors, type CatalogueBook, type CatalogueAuthor } from '@/lib/catalogue';
import { useDecryptedLocation } from '@/lib/secureRouting';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { BookInfoCard } from '@/components/BookInfoCard';
import { BookDetailPanel } from '@/components/BookDetailPanel';
import { BookRecommendations } from '@/components/BookRecommendations';

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
  const [activeTab, setActiveTab] = useState('deja-paru');

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
      return () => { cancelled = true; };
    }

    void loadBook(ean);

    return () => { cancelled = true; };
  }, [ean]);

  // Charger les livres à paraître à la demande
  useEffect(() => {
    if (!ean || activeTab !== 'a-paraitre' || upcomingBooks.length > 0 || isLoadingUpcoming) return;

    let cancelled = false;
    const currentEan = ean;

    async function loadUpcomingBooks() {
      setIsLoadingUpcoming(true);
      try {
        const data = await fetchCatalogueUpcomingBooksFromSeries(currentEan);
        if (!cancelled) {
          setUpcomingBooks(data);
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
    return () => { cancelled = true; };
  }, [ean, activeTab]);

  // Charger les livres de la même collection à la demande
  useEffect(() => {
    if (!ean || activeTab !== 'meme-collection' || sameCollectionBooks.length > 0 || isLoadingSameCollection) return;

    let cancelled = false;
    const currentEan = ean;

    async function loadSameCollectionBooks() {
      setIsLoadingSameCollection(true);
      try {
        const data = await fetchCatalogueSameCollectionBooks(currentEan);
        if (!cancelled) {
          setSameCollectionBooks(data);
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
    return () => { cancelled = true; };
  }, [ean, activeTab]);

  // Charger les livres du même auteur à la demande
  useEffect(() => {
    if (!ean || activeTab !== 'meme-auteur' || sameAuthorBooks.length > 0 || isLoadingSameAuthor || authors.length === 0) return;

    let cancelled = false;
    const currentEan = ean;

    async function loadSameAuthorBooks() {
      setIsLoadingSameAuthor(true);
      try {
        const data = await fetchCatalogueBooksByAuthors(currentEan, authors);
        if (!cancelled) {
          setSameAuthorBooks(data);
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
    return () => { cancelled = true; };
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
              Nous n'avons pas pu afficher la fiche demandée. Vérifiez l'EAN ou
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
    const priceTTC = formatPrice(details?.priceTTC ?? book.priceHT);
    const priceHT = formatPrice(book.priceHT);

    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
          <BookInfoCard book={book} priceTTC={priceTTC} priceHT={priceHT} onAddToCart={handleAddToCart} />
          <BookDetailPanel book={book} authors={authors} ean={ean} />
        </div>
        <BookRecommendations
          pastBooks={pastBooks}
          upcomingBooks={upcomingBooks}
          sameCollectionBooks={sameCollectionBooks}
          sameAuthorBooks={sameAuthorBooks}
          isLoadingUpcoming={isLoadingUpcoming}
          isLoadingSameCollection={isLoadingSameCollection}
          isLoadingSameAuthor={isLoadingSameAuthor}
          onTabChange={setActiveTab}
        />
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
