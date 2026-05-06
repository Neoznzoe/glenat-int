import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import CatalogueLayout from './CatalogueLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { SecureLink } from '@/components/routing/SecureLink';
import {
  fetchCatalogueAuthorById,
  fetchCatalogueAuthorTexts,
  fetchCatalogueBooksByAuthorId,
  fetchCatalogueCover,
  type CatalogueAuthorDetailInfo,
  type CatalogueAuthorListItem,
  type CatalogueAuthorText,
  type CatalogueBook,
} from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

interface AuteurDetailLocationState {
  author?: CatalogueAuthorListItem;
}

const getDisplayName = (firstName: string, lastName: string, fullName?: string): string => {
  if (fullName && fullName.trim()) return fullName.trim();
  return `${firstName} ${lastName}`.trim();
};

const abbreviateAuthors = (authors: string | undefined): string => {
  if (!authors) return '';
  return authors
    .split(/[,;&]|\s·\s/)
    .map((a) => a.trim())
    .filter(Boolean)
    .map((a) => {
      const parts = a.split(/\s+/);
      if (parts.length <= 1) return a;
      const firstInitial = parts[0].charAt(0).toUpperCase();
      const rest = parts.slice(1).join(' ');
      return `${firstInitial}. ${rest}`;
    })
    .slice(0, 3)
    .join(' / ');
};

export function AuteurDetail() {
  useScrollRestoration();
  const navigate = useNavigate();
  const { idAuthor = '' } = useParams<{ idAuthor: string }>();
  const location = useLocation();
  const navState = location.state as AuteurDetailLocationState | null;

  const [author, setAuthor] = useState<CatalogueAuthorDetailInfo | null>(() => {
    if (navState?.author) {
      return {
        idAuthor: navState.author.idAuthor,
        firstName: navState.author.firstName,
        lastName: navState.author.lastName,
        fullName: navState.author.fullName,
        photo: navState.author.photo,
        fonction: navState.author.fonctions?.[0],
      };
    }
    return null;
  });

  const initialFonctions = useMemo(
    () => navState?.author?.fonctions ?? (author?.fonction ? [author.fonction] : []),
    [navState?.author?.fonctions, author?.fonction],
  );

  const [fonctions, setFonctions] = useState<string[]>(initialFonctions);
  const [texts, setTexts] = useState<CatalogueAuthorText[]>([]);
  const [books, setBooks] = useState<CatalogueBook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch author info if not provided via navigation state
  useEffect(() => {
    if (author || !idAuthor) return;
    const abort = new AbortController();
    fetchCatalogueAuthorById(idAuthor, abort.signal)
      .then((info) => {
        if (info) {
          setAuthor(info);
          if (info.fonction && fonctions.length === 0) {
            setFonctions([info.fonction]);
          }
        } else {
          setError('Auteur introuvable.');
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      });
    return () => abort.abort();
  }, [idAuthor, author, fonctions.length]);

  // Fetch texts (biography)
  useEffect(() => {
    if (!idAuthor) return;
    const abort = new AbortController();
    fetchCatalogueAuthorTexts(idAuthor, abort.signal)
      .then(setTexts)
      .catch(() => {
        /* optional */
      });
    return () => abort.abort();
  }, [idAuthor]);

  // Fetch books (bibliography)
  useEffect(() => {
    if (!idAuthor) return;
    const abort = new AbortController();
    setLoadingBooks(true);
    setBooksError(null);
    fetchCatalogueBooksByAuthorId(idAuthor, abort.signal)
      .then(async (list) => {
        setBooks(list);
        setLoadingBooks(false);
        // Hydrate covers in background
        for (const book of list) {
          if (abort.signal.aborted) return;
          if (!book.ean) continue;
          const cover = await fetchCatalogueCover(book.ean).catch(() => null);
          if (cover && !abort.signal.aborted) {
            setBooks((prev) =>
              prev.map((b) => (b.ean === book.ean ? { ...b, cover } : b)),
            );
          }
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setBooksError(err instanceof Error ? err.message : 'Erreur lors du chargement des ouvrages');
        setLoadingBooks(false);
      });
    return () => abort.abort();
  }, [idAuthor]);

  const displayName = author ? getDisplayName(author.firstName, author.lastName, author.fullName) : '';
  const primaryFonction = fonctions[0];
  const biography = texts[0]?.texte;

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <BreadcrumbLink asChild>
              <SecureLink to="/catalogue/auteurs">Auteurs</SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{displayName || 'Fiche auteur'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle className="text-[2rem]">Fiche auteur</CardTitle>
        </CardHeader>
        <div className="px-6">
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout active="Les auteurs">
            <div className="space-y-6">
              {/* Identité + Biographie — fused in one card */}
              <Card className="overflow-hidden">
                <div className="bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
                  Identité
                </div>
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:divide-x">
                    {/* Identity */}
                    <div className="p-4">
                      {!author ? (
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4">
                          {author.photo ? (
                            <img
                              src={author.photo}
                              alt={displayName}
                              className="h-24 w-24 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-lg leading-tight">{displayName}</h2>
                            {primaryFonction && (
                              <p className="text-sm text-primary font-medium mt-0.5">
                                {primaryFonction}
                              </p>
                            )}
                            {fonctions.length > 1 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {fonctions.map((f) => (
                                  <Badge key={f} variant="secondary" className="text-xs">
                                    {f}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Biography */}
                    <div className="p-4">
                      {biography ? (
                        <div
                          className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-b:font-semibold"
                          dangerouslySetInnerHTML={{ __html: biography }}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Aucune biographie disponible.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bibliography */}
              <Card className="overflow-hidden">
                <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Bibliographie {books.length > 0 && `· ${books.length} ouvrage${books.length > 1 ? 's' : ''}`}
                  </span>
                </div>
                <CardContent className="p-0">
                  {loadingBooks && (
                    <div className="divide-y">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3">
                          <Skeleton className="h-14 w-10 rounded shrink-0" />
                          <Skeleton className="h-5 flex-1" />
                        </div>
                      ))}
                    </div>
                  )}
                  {!loadingBooks && booksError && (
                    <p className="text-sm text-destructive italic py-8 text-center">
                      {booksError}
                    </p>
                  )}
                  {!loadingBooks && !booksError && books.length === 0 && (
                    <p className="text-sm text-muted-foreground italic py-8 text-center">
                      Aucun ouvrage trouvé pour cet auteur.
                    </p>
                  )}
                  {books.length > 0 && (
                    <ul className="divide-y">
                      {books.map((book) => {
                        const shortAuthors = abbreviateAuthors(book.authors);
                        return (
                          <li key={book.ean}>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/catalogue/book?ean=${encodeURIComponent(book.ean)}`)
                              }
                              className="w-full grid grid-cols-[auto_minmax(0,2fr)_minmax(0,1fr)_auto_auto] items-center gap-4 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                            >
                              {book.cover ? (
                                <img
                                  src={book.cover}
                                  alt={book.title}
                                  className="h-14 w-10 rounded object-cover shrink-0"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-14 w-10 rounded bg-muted shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-sm truncate">
                                  {book.title}
                                </div>
                                {shortAuthors && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {shortAuthors}
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground truncate hidden md:block">
                                {book.publisher}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                                {book.publicationDate}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuteurDetail;
