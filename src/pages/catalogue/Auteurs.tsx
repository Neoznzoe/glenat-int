import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CatalogueLayout from './CatalogueLayout';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureLink } from '@/components/routing/SecureLink';
import {
  fetchCatalogueAuthorsList,
  fetchCatalogueAuthorBookCounts,
  type CatalogueAuthorListItem,
} from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ROLE_FILTERS: Array<{ label: string; color: string }> = [
  { label: 'Scénariste', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  { label: 'Dessinateur', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
  { label: 'Coloriste', color: 'bg-sky-100 text-sky-700 hover:bg-sky-200' },
  { label: 'Traducteur', color: 'bg-violet-100 text-violet-700 hover:bg-violet-200' },
];

const LETTER_BG: Record<string, string> = {
  A: 'bg-orange-400',
  B: 'bg-red-500',
  C: 'bg-amber-400',
  D: 'bg-emerald-500',
  E: 'bg-sky-500',
  F: 'bg-violet-500',
  G: 'bg-fuchsia-500',
  H: 'bg-rose-500',
  I: 'bg-orange-400',
  J: 'bg-red-500',
  K: 'bg-amber-400',
  L: 'bg-emerald-500',
  M: 'bg-sky-500',
  N: 'bg-violet-500',
  O: 'bg-fuchsia-500',
  P: 'bg-rose-500',
  Q: 'bg-orange-400',
  R: 'bg-red-500',
  S: 'bg-amber-400',
  T: 'bg-emerald-500',
  U: 'bg-sky-500',
  V: 'bg-violet-500',
  W: 'bg-fuchsia-500',
  X: 'bg-rose-500',
  Y: 'bg-orange-400',
  Z: 'bg-red-500',
};

const INITIAL_AUTHOR_COUNT = 40;
const AUTHORS_PER_TICK = 20;

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

const stripAccents = (value: string): string =>
  value.normalize('NFD').replace(COMBINING_DIACRITICS, '');

const getAuthorInitial = (author: CatalogueAuthorListItem): string => {
  const source = (author.lastName || author.firstName || '').trim();
  const char = stripAccents(source).charAt(0).toUpperCase();
  return /[A-Z]/.test(char) ? char : '#';
};

const getDisplayName = (author: CatalogueAuthorListItem): string => {
  if (author.fullName && author.fullName.trim()) return author.fullName.trim();
  return `${author.lastName} ${author.firstName}`.trim();
};

export function Auteurs() {
  useScrollRestoration();
  const navigate = useNavigate();

  const [authors, setAuthors] = useState<CatalogueAuthorListItem[]>([]);
  const [bookCounts, setBookCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_AUTHOR_COUNT);

  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const abortController = new AbortController();

    // Fetch authors and counts in parallel — show authors ASAP, counts fill in when ready
    fetchCatalogueAuthorsList(abortController.signal)
      .then((list) => {
        setAuthors(list);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        setLoading(false);
      });

    fetchCatalogueAuthorBookCounts(abortController.signal)
      .then((counts) => setBookCounts(counts))
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        // Counts are non-critical; log silently
      });

    return () => abortController.abort();
  }, []);

  const authorsWithCounts = useMemo(
    () =>
      authors.map((a) => {
        const key = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
        const count = bookCounts[key];
        return count !== undefined ? { ...a, bookCount: count } : a;
      }),
    [authors, bookCounts],
  );

  const filteredAuthors = useMemo(() => {
    const query = stripAccents(search.trim().toLowerCase());
    return authorsWithCounts.filter((a) => {
      if (selectedRoles.length > 0) {
        const hasRole = selectedRoles.some((r) =>
          a.fonctions.some((f) => f.toLowerCase() === r.toLowerCase()),
        );
        if (!hasRole) return false;
      }
      if (query) {
        const name = stripAccents(getDisplayName(a).toLowerCase());
        if (!name.includes(query)) return false;
      }
      return true;
    });
  }, [authorsWithCounts, search, selectedRoles]);

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogueAuthorListItem[]>();
    for (const author of filteredAuthors) {
      const letter = getAuthorInitial(author);
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(author);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredAuthors]);

  const availableLetters = useMemo(() => new Set(grouped.map(([letter]) => letter)), [grouped]);

  // Reset the reveal counter when the dataset changes (search / role filter)
  useEffect(() => {
    setVisibleCount(INITIAL_AUTHOR_COUNT);
  }, [search, selectedRoles, authors]);

  // Progressively reveal more authors, 20 at a time, on each animation frame
  useEffect(() => {
    if (visibleCount >= filteredAuthors.length) return;

    const handle = requestAnimationFrame(() => {
      setVisibleCount((prev) => Math.min(prev + AUTHORS_PER_TICK, filteredAuthors.length));
    });

    return () => cancelAnimationFrame(handle);
  }, [visibleCount, filteredAuthors.length]);

  // Slice the grouped structure up to `visibleCount` total authors
  const visibleGroups = useMemo(() => {
    const result: Array<[string, CatalogueAuthorListItem[]]> = [];
    let remaining = visibleCount;
    for (const [letter, letterAuthors] of grouped) {
      if (remaining <= 0) break;
      const slice = letterAuthors.slice(0, remaining);
      result.push([letter, slice]);
      remaining -= slice.length;
    }
    return result;
  }, [grouped, visibleCount]);

  useEffect(() => {
    if (visibleGroups.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const letter = visible[0].target.getAttribute('data-letter');
          if (letter) setActiveLetter(letter);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );

    sectionsRef.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleGroups]);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const scrollToLetter = (letter: string) => {
    // Ensure enough authors are mounted so the target letter's section exists
    const index = grouped.findIndex(([l]) => l === letter);
    if (index === -1) return;

    const countUpToTarget = grouped
      .slice(0, index + 1)
      .reduce((acc, [, list]) => acc + list.length, 0);

    if (countUpToTarget > visibleCount) {
      setVisibleCount(countUpToTarget);
      requestAnimationFrame(() => {
        const el = sectionsRef.current.get(letter);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveLetter(letter);
      });
      return;
    }

    const el = sectionsRef.current.get(letter);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveLetter(letter);
    }
  };

  const registerSection = (letter: string) => (el: HTMLElement | null) => {
    if (el) {
      sectionsRef.current.set(letter, el);
    } else {
      sectionsRef.current.delete(letter);
    }
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
            <BreadcrumbPage>Les auteurs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <CardTitle className="text-[2.5rem]">Auteurs</CardTitle>
            {!loading && !error && (
              <span className="text-muted-foreground text-sm">
                {filteredAuthors.length} résultat{filteredAuthors.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un auteur..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <div className="px-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {ROLE_FILTERS.map((role) => {
              const active = selectedRoles.includes(role.label);
              return (
                <Button
                  key={role.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRole(role.label)}
                  className={cn(
                    'rounded-full h-7 px-3 text-xs font-medium',
                    role.color,
                    active && 'ring-2 ring-offset-1 ring-current',
                  )}
                >
                  {role.label}
                </Button>
              );
            })}
          </div>
          <Separator />
        </div>

        <CardContent className="p-6">
          <CatalogueLayout active="Les auteurs">
            {loading && (
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 12 }, (_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded" />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="flex gap-6 items-start">
                {/* Alphabet sidebar — aligned at top of list */}
                <nav
                  aria-label="Alphabet"
                  className="hidden sm:flex flex-col gap-1 sticky top-4 text-xs font-semibold w-6 shrink-0 pt-0"
                >
                  {ALPHABET.map((letter) => {
                    const available = availableLetters.has(letter);
                    const active = activeLetter === letter;
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => available && scrollToLetter(letter)}
                        disabled={!available}
                        className={cn(
                          'text-center transition-colors',
                          active ? 'text-primary' : 'text-muted-foreground',
                          available
                            ? 'hover:text-foreground cursor-pointer'
                            : 'opacity-30 cursor-not-allowed',
                        )}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </nav>

                {/* Authors list */}
                <div className="flex-1 space-y-8 min-w-0">
                  {grouped.length === 0 && (
                    <div className="flex items-center justify-center py-32 rounded-lg border border-dashed">
                      <p className="text-muted-foreground">Aucun auteur trouvé</p>
                    </div>
                  )}

                  {visibleGroups.map(([letter, letterAuthors]) => (
                    <section
                      key={letter}
                      ref={registerSection(letter)}
                      data-letter={letter}
                      className="scroll-mt-20 [content-visibility:auto] [contain-intrinsic-size:1px_600px]"
                    >
                      <div
                        className={cn(
                          'flex items-center justify-between rounded-md px-4 py-2 text-white mb-4',
                          LETTER_BG[letter] ?? 'bg-slate-500',
                        )}
                      >
                        <span className="font-bold text-lg">{letter}</span>
                        <span className="text-xs opacity-90">
                          {letterAuthors.length} auteur{letterAuthors.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {letterAuthors.map((author) => {
                          const primaryFonction = author.fonctions[0];
                          return (
                            <button
                              key={author.idAuthor}
                              type="button"
                              onClick={() =>
                                navigate(`/catalogue/auteurs/${encodeURIComponent(author.idAuthor)}`, {
                                  state: { author },
                                })
                              }
                              className="text-left space-y-0.5 rounded p-1 -m-1 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                              <div className="font-semibold text-sm truncate">
                                {getDisplayName(author)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {primaryFonction && (
                                  <span className="text-primary font-medium">
                                    {primaryFonction}
                                  </span>
                                )}
                                {primaryFonction && ' · '}
                                {author.bookCount > 0
                                  ? `${author.bookCount} ouvrage${author.bookCount > 1 ? 's' : ''}`
                                  : '…'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}

                  {visibleCount < filteredAuthors.length && (
                    <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                      Chargement… {visibleCount} / {filteredAuthors.length}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Auteurs;
