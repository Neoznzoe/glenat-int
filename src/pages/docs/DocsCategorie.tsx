import { useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { SecureLink } from '@/components/routing/SecureLink';
import { useDocCategories } from '@/hooks/useDocs';
import { DocFolderIcon } from '@/components/docs/DocFileIcon';
import { DocSearchBar } from '@/components/docs/DocSearchBar';
import { Loader2 } from 'lucide-react';

export function DocsCategorie() {
  const [searchParams] = useSearchParams();
  const rub1Id = parseInt(searchParams.get('rub1') ?? '0', 10);

  const { data: categories, isLoading, error } = useDocCategories();

  const category = categories?.find((c) => c.id === rub1Id);
  const subcategories = category
    ? [...category.subcategories].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    : [];

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
              <SecureLink to="/glenat-doc">Glénat'Doc</SecureLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category?.title ?? 'Chargement...'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-[2.5rem] font-bold">{category?.title ?? ''}</h1>
        <DocSearchBar rub1Id={rub1Id} />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement...
        </div>
      )}

      {error && (
        <div className="text-destructive text-sm">
          Erreur lors du chargement.
        </div>
      )}

      {!isLoading && !error && (
        <Card className="rounded-xl border shadow overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-4 py-3 px-4 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <div className="w-8 shrink-0" />
              <div className="flex-1 min-w-0">Nom</div>
              <div className="shrink-0 w-80">Description</div>
            </div>

            {subcategories.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Aucune sous-catégorie.
              </div>
            )}

            {subcategories.map((sub) => (
              <SecureLink
                key={sub.id}
                to={`/glenat-doc/documents?rub1=${rub1Id}&rub2=${sub.id}`}
                className="flex items-center gap-4 py-3 px-4 border-b last:border-b-0 hover:bg-muted/30"
              >
                <div className="w-8 shrink-0 flex items-center justify-center">
                  <DocFolderIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm hover:underline">{sub.title}</span>
                </div>
                <div className="shrink-0 w-80 text-sm text-muted-foreground truncate">
                  {sub.description}
                </div>
              </SecureLink>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DocsCategorie;
