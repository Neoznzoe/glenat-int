import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SecureLink } from '@/components/routing/SecureLink';
import { useDocCategories } from '@/hooks/useDocs';
import { DocSearchBar } from '@/components/docs/DocSearchBar';
import { Loader2, ChevronRight } from 'lucide-react';

const CATEGORY_COLORS = [
  'var(--glenat-bd)',
  'var(--glenat-manga)',
  'var(--glenat-jeunesse)',
  'var(--glenat-livre)',
];

export function DocsHome() {
  const { data: categories, isLoading, error } = useDocCategories();

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
            <BreadcrumbPage>Glénat'Doc</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-[2.5rem] font-bold">Documents</h1>
        <DocSearchBar />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement...
        </div>
      )}

      {error && (
        <div className="text-destructive text-sm">
          Erreur lors du chargement des catégories.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {(categories ?? []).map((category, index) => (
          <Card key={category.id} className="rounded-xl border shadow overflow-hidden">
            <CardHeader
              className="py-3 px-4"
              style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
            >
              <SecureLink to={`/glenat-doc/categorie?rub1=${category.id}`}>
                <CardTitle className="text-black text-lg font-normal hover:underline cursor-pointer">
                  {category.title}
                </CardTitle>
              </SecureLink>
            </CardHeader>
            <CardContent className="p-4">
              {category.subcategories.length > 0 ? (
                <ul className="space-y-1">
                  {[...category.subcategories].sort((a, b) => a.title.localeCompare(b.title, 'fr')).map((sub) => (
                    <li key={sub.id}>
                      <SecureLink
                        to={`/glenat-doc/documents?rub1=${category.id}&rub2=${sub.id}`}
                        className="flex items-start gap-1 text-sm text-muted-foreground hover:underline hover:text-foreground"
                      >
                        <ChevronRight className="h-3 w-3 shrink-0 mt-1" />
                        <span>
                          {sub.title}
                          {sub.description && (
                            <span className="block text-xs italic text-muted-foreground/70">
                              {sub.description}
                            </span>
                          )}
                        </span>
                      </SecureLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">Aucune sous-catégorie</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DocsHome;
