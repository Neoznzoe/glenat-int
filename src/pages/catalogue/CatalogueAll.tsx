import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import CatalogueLayout from './CatalogueLayout';
import BookCard from '@/components/BookCard';
import { CataloguePagination } from '@/components/CataloguePagination';
import { CatalogueSearchInput } from '@/components/CatalogueSearchInput';
import { CatalogueCategoryBar, type CatalogueCategory } from '@/components/CatalogueCategoryBar';
import ListFilter from '@/components/ui/list-filter';
import TagInput from '@/components/ui/tag-input';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SecureLink } from '@/components/routing/SecureLink';
import {
  fetchCatalogueBooksWithPagination,
  fetchCataloguePublishers,
  type CatalogueBooksPage,
} from '@/lib/catalogue';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Loader2, ListFilter as ListFilterIcon, X } from 'lucide-react';

const FORMATS = ['Album', 'Poche', 'Intégrale'];
const COLLECTIONS = ['Coffrets', 'Éditions limitées', 'Collector'];
const AGE_TARGETS = ['Jeunesse 3+', 'Jeunesse 6+', 'Ado', 'Adulte'];
const THEMES = ['Aventure', 'Psychologie', 'Écologie', 'Histoire', 'Fantastique', 'Science-fiction', 'Romance', 'Mystère', 'Humour', 'Cuisine', 'Sport', 'Art', 'Politique', 'Technologie'];
const AVAILABILITY = ['En stock', 'À réimprimer', 'Épuisé'];

const getSessionSeed = (): string => {
  const SEED_KEY = 'catalogue_random_seed';
  let seed = sessionStorage.getItem(SEED_KEY);
  if (!seed) {
    seed = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(SEED_KEY, seed);
  }
  return seed;
};

export interface CatalogueAllLocationState {
  publisher?: string;
  category?: string;
}

export function CatalogueAll() {
  useScrollRestoration();
  const location = useLocation();
  const navState = location.state as CatalogueAllLocationState | null;

  const [currentPage, setCurrentPage] = useState(1);
  const [cataloguePage, setCataloguePage] = useState<CatalogueBooksPage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sessionSeed = getSessionSeed();

  // Category filter (top bar)
  const [activeCategory, setActiveCategory] = useState<CatalogueCategory>('Toutes');

  // Advanced filters
  const [publishers, setPublishers] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  // Load publishers from API
  useEffect(() => {
    void fetchCataloguePublishers().then(setPublishers);
  }, []);

  // Apply filters from navigation state (e.g. from /catalogue home or category bar)
  useEffect(() => {
    let consumed = false;
    if (navState?.publisher) {
      setSelectedPublishers([navState.publisher]);
      setCurrentPage(1);
      consumed = true;
    }
    if (navState?.category) {
      setActiveCategory(navState.category as CatalogueCategory);
      setCurrentPage(1);
      consumed = true;
    }
    if (consumed) {
      // Clear the state so it doesn't persist on subsequent visits
      window.history.replaceState({}, '');
    }
  }, [navState?.publisher, navState?.category]);

  // Load books — refetch when page or server-side filters change
  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    const loadBooks = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCatalogueBooksWithPagination(currentPage, 50, {
          seed: sessionSeed,
          signal: abortController.signal,
          filters: {
            publisher: selectedPublishers.length > 0 ? selectedPublishers : undefined,
            category: activeCategory !== 'Toutes' ? activeCategory : undefined,
          },
          onProgress: (updatedPage) => {
            if (isActive) setCataloguePage(updatedPage);
          },
        });
        if (isActive) {
          setCataloguePage(data);
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        if (isActive) setIsLoading(false);
      }
    };

    void loadBooks();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [currentPage, sessionSeed, activeCategory, selectedPublishers]);

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string, resetPage = false) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    if (resetPage) setCurrentPage(1);
  };

  // Count active advanced filters
  const advancedFilterCount =
    selectedPublishers.length + authors.length + selectedFormats.length +
    selectedCollections.length + selectedAges.length + selectedThemes.length +
    selectedAvailability.length + (isNew ? 1 : 0) + (comingSoon ? 1 : 0);

  const hasAnyFilter = activeCategory !== 'Toutes' || advancedFilterCount > 0;

  const handlePageChange = (page: number) => {
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'auto' });
    setCurrentPage(page);
  };

  const handleCategoryChange = (cat: CatalogueCategory) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setActiveCategory('Toutes');
    setSelectedPublishers([]);
    setAuthors([]);
    setSelectedFormats([]);
    setSelectedCollections([]);
    setSelectedAges([]);
    setSelectedThemes([]);
    setSelectedAvailability([]);
    setIsNew(false);
    setComingSoon(false);
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
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
              <BreadcrumbPage>Tout le catalogue</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
            <CatalogueSearchInput />
          </CardHeader>
          <div className="px-6 space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              <CatalogueCategoryBar
                activeCategory={activeCategory}
                onCategoryClick={handleCategoryChange}
              />

              {/* Filtres avancés */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ListFilterIcon className="mr-2 h-4 w-4" />
                    Filtres {advancedFilterCount > 0 && `(${advancedFilterCount})`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] max-h-[70vh] overflow-y-auto space-y-4 bg-background" align="end">
                  <div>
                    <h4 className="mb-2 font-medium">Auteur</h4>
                    <TagInput tags={authors} setTags={setAuthors} placeholder="Rechercher un auteur..." />
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Format</h4>
                    <ListFilter options={FORMATS} selected={selectedFormats} onToggle={val => toggle(setSelectedFormats, val)} />
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Maison d'éditions</h4>
                    <ListFilter options={publishers} selected={selectedPublishers} onToggle={val => toggle(setSelectedPublishers, val, true)} />
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Collections spéciales</h4>
                    <ListFilter options={COLLECTIONS} selected={selectedCollections} onToggle={val => toggle(setSelectedCollections, val)} />
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Âge cible</h4>
                    <ListFilter options={AGE_TARGETS} selected={selectedAges} onToggle={val => toggle(setSelectedAges, val)} />
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Thèmes</h4>
                    <ListFilter options={THEMES} selected={selectedThemes} onToggle={val => toggle(setSelectedThemes, val)} />
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Parution</h4>
                    <div className="flex gap-4 overflow-x-auto">
                      <label className="flex items-center space-x-2 whitespace-nowrap">
                        <Checkbox checked={isNew} onCheckedChange={checked => setIsNew(checked === true)} />
                        <span>Nouveauté</span>
                      </label>
                      <label className="flex items-center space-x-2 whitespace-nowrap">
                        <Checkbox checked={comingSoon} onCheckedChange={checked => setComingSoon(checked === true)} />
                        <span>À paraître</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Disponibilité</h4>
                    <ListFilter options={AVAILABILITY} selected={selectedAvailability} onToggle={val => toggle(setSelectedAvailability, val)} />
                  </div>
                </PopoverContent>
              </Popover>

              {hasAnyFilter && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                  <X className="mr-1 h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Active filter badges */}
            {advancedFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPublishers.map(p => (
                  <Button key={p} variant="secondary" size="sm" onClick={() => toggle(setSelectedPublishers, p)} className="h-7 gap-1">
                    {p} <X className="h-3 w-3" />
                  </Button>
                ))}
                {authors.map(a => (
                  <Button key={a} variant="secondary" size="sm" onClick={() => setAuthors(prev => prev.filter(v => v !== a))} className="h-7 gap-1">
                    {a} <X className="h-3 w-3" />
                  </Button>
                ))}
                {selectedFormats.map(f => (
                  <Button key={f} variant="secondary" size="sm" onClick={() => toggle(setSelectedFormats, f)} className="h-7 gap-1">
                    {f} <X className="h-3 w-3" />
                  </Button>
                ))}
                {selectedCollections.map(c => (
                  <Button key={c} variant="secondary" size="sm" onClick={() => toggle(setSelectedCollections, c)} className="h-7 gap-1">
                    {c} <X className="h-3 w-3" />
                  </Button>
                ))}
                {selectedAges.map(a => (
                  <Button key={a} variant="secondary" size="sm" onClick={() => toggle(setSelectedAges, a)} className="h-7 gap-1">
                    {a} <X className="h-3 w-3" />
                  </Button>
                ))}
                {selectedThemes.map(t => (
                  <Button key={t} variant="secondary" size="sm" onClick={() => toggle(setSelectedThemes, t)} className="h-7 gap-1">
                    {t} <X className="h-3 w-3" />
                  </Button>
                ))}
                {selectedAvailability.map(a => (
                  <Button key={a} variant="secondary" size="sm" onClick={() => toggle(setSelectedAvailability, a)} className="h-7 gap-1">
                    {a} <X className="h-3 w-3" />
                  </Button>
                ))}
                {isNew && (
                  <Button variant="secondary" size="sm" onClick={() => setIsNew(false)} className="h-7 gap-1">
                    Nouveauté <X className="h-3 w-3" />
                  </Button>
                )}
                {comingSoon && (
                  <Button variant="secondary" size="sm" onClick={() => setComingSoon(false)} className="h-7 gap-1">
                    À paraître <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            <Separator />
          </div>
          <CardContent className="p-6">
            <CatalogueLayout active="Tout le catalogue">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xl">Tout le catalogue</h3>
                  {cataloguePage && (
                    <p className="text-sm text-muted-foreground">
                      {cataloguePage.totalBooks} livre{cataloguePage.totalBooks > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="sr-only">Chargement du catalogue...</span>
                  </div>
                ) : cataloguePage && cataloguePage.books.length > 0 ? (
                  <>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                      {cataloguePage.books.map(book => (
                        <BookCard key={book.ean} {...book} />
                      ))}
                    </div>

                    {cataloguePage.totalPages > 1 && (
                      <CataloguePagination
                        currentPage={cataloguePage.currentPage}
                        totalPages={cataloguePage.totalPages}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center py-32 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">Aucun livre trouvé</p>
                  </div>
                )}
              </div>
            </CatalogueLayout>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CatalogueAll;
