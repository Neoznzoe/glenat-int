import { ArrowUpRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecureLink } from '@/components/routing/SecureLink';
import { BookCarousel } from '@/components/BookCarousel';
import type { CatalogueBook } from '@/lib/catalogue';

interface BookRecommendationsProps {
  pastBooks: CatalogueBook[];
  upcomingBooks: CatalogueBook[];
  sameCollectionBooks: CatalogueBook[];
  sameAuthorBooks: CatalogueBook[];
  isLoadingUpcoming: boolean;
  isLoadingSameCollection: boolean;
  isLoadingSameAuthor: boolean;
  onTabChange: (tab: string) => void;
}

const TAB_CLASS = '-mb-px rounded-none border-b-2 border-transparent px-0 pb-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none';

export function BookRecommendations({ pastBooks, upcomingBooks, sameCollectionBooks, sameAuthorBooks, isLoadingUpcoming, isLoadingSameCollection, isLoadingSameAuthor, onTabChange }: BookRecommendationsProps) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold uppercase">Vous aimerez aussi</h2>
        <SecureLink to="/catalogue/all" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Voir tout
          <ArrowUpRight className="h-4 w-4" />
        </SecureLink>
      </div>
      <Tabs defaultValue="deja-paru" className="space-y-4" onValueChange={onTabChange}>
        <TabsList className="flex-wrap justify-start gap-2 rounded-none border-b bg-transparent dark:bg-transparent p-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:gap-4">
          <TabsTrigger value="deja-paru" className={TAB_CLASS}>Déjà paru</TabsTrigger>
          <TabsTrigger value="a-paraitre" className={TAB_CLASS}>À paraître</TabsTrigger>
          <TabsTrigger value="meme-collection" className={TAB_CLASS}>Même collection</TabsTrigger>
          <TabsTrigger value="meme-theme" className={TAB_CLASS}>Même thème</TabsTrigger>
          <TabsTrigger value="meme-auteur" className={TAB_CLASS}>Même auteur</TabsTrigger>
        </TabsList>
        <TabsContent value="deja-paru" className="space-y-4">
          <BookCarousel books={pastBooks} />
        </TabsContent>
        <TabsContent value="a-paraitre" className="space-y-4">
          <BookCarousel books={upcomingBooks} isLoading={isLoadingUpcoming} />
        </TabsContent>
        <TabsContent value="meme-collection" className="space-y-4">
          <BookCarousel books={sameCollectionBooks} isLoading={isLoadingSameCollection} />
        </TabsContent>
        <TabsContent value="meme-theme" className="rounded-xl bg-muted/40 p-6 text-sm leading-normal text-muted-foreground">
          <p>Aucune recommandation disponible pour le moment.</p>
        </TabsContent>
        <TabsContent value="meme-auteur" className="space-y-4">
          <BookCarousel books={sameAuthorBooks} isLoading={isLoadingSameAuthor} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
