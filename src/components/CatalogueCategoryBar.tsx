import { Button } from '@/components/ui/button';

export const CATALOGUE_CATEGORIES = [
  'Toutes',
  'BD',
  'Manga',
  'Jeunesse',
  'Découverte',
  'Livres',
  'Voyage',
  'Montagne',
] as const;

export type CatalogueCategory = typeof CATALOGUE_CATEGORIES[number];

/**
 * Match a publisher name against a category. Uses the same rules as the backend
 * (BooksListHandler::CAT_MAP) so filtering is consistent everywhere.
 */
export function publisherMatchesCategory(publisher: string | undefined, category: CatalogueCategory): boolean {
  if (category === 'Toutes') return true;
  const pub = (publisher ?? '').toLowerCase();
  switch (category) {
    case 'BD':         return pub.includes('bd');
    case 'Manga':      return pub.includes('manga');
    case 'Jeunesse':   return pub.includes('jeunesse');
    case 'Livres':     return pub.includes('livre');
    case 'Découverte': return pub.includes('découverte');
    case 'Voyage':
    case 'Montagne':   return pub.includes('rando');
    default:           return true;
  }
}

interface CatalogueCategoryBarProps {
  activeCategory: CatalogueCategory;
  onCategoryClick: (category: CatalogueCategory) => void;
}

export function CatalogueCategoryBar({
  activeCategory,
  onCategoryClick,
}: CatalogueCategoryBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
      {CATALOGUE_CATEGORIES.map(cat => (
        <Button
          key={cat}
          variant={activeCategory === cat ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryClick(cat)}
          className="whitespace-nowrap"
        >
          {cat}
        </Button>
      ))}
    </div>
  );
}

export default CatalogueCategoryBar;
