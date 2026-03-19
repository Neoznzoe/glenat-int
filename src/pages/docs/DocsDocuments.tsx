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
import { useDocumentsBySubcategory } from '@/hooks/useDocs';
import { getDocFileUrl, parseDateField } from '@/lib/docsApi';
import { DocFileIcon } from '@/components/docs/DocFileIcon';
import { Loader2, Download } from 'lucide-react';

export function DocsDocuments() {
  const [searchParams] = useSearchParams();
  const rub1Id = parseInt(searchParams.get('rub1') ?? '0', 10);
  const rub2Id = parseInt(searchParams.get('rub2') ?? '0', 10);

  const { data, isLoading, error } = useDocumentsBySubcategory(rub1Id, rub2Id);

  const documents = data?.documents ?? [];
  const rub1Name = data?.rub1Name ?? '';
  const rub2Name = data?.rub2Name ?? '';

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
          {rub1Name && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <SecureLink to={`/glenat-doc/categorie?rub1=${rub1Id}`}>
                    {rub1Name}
                  </SecureLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {rub2Name && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{rub2Name}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-[2.5rem] font-bold">Documents</h1>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement...
        </div>
      )}

      {error && (
        <div className="text-destructive text-sm">
          Erreur lors du chargement des documents.
        </div>
      )}

      {!isLoading && !error && (
        <Card className="rounded-xl border shadow overflow-hidden">
          <CardContent className="p-0">
            {/* En-têtes */}
            <div className="grid grid-cols-[28px_1fr_112px_96px_96px_80px] gap-3 py-3 px-4 border-b bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide items-center">
              <div />
              <div className="truncate">Nom</div>
              <div>Auteur</div>
              <div>Date de création</div>
              <div>Date de modification</div>
              <div className="text-center">Télécharger</div>
            </div>

            {documents.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Aucun document dans cette catégorie.
              </div>
            )}

            {documents.map((doc) => {
              const fileUrl = getDocFileUrl(doc.file, doc.extension, rub1Name, rub2Name, doc.version);
              return (
                <div key={doc.id} className="grid grid-cols-[28px_1fr_112px_96px_96px_80px] gap-3 py-3 px-4 border-b last:border-b-0 hover:bg-muted/30 items-center">
                  <div className="flex items-center justify-center">
                    <DocFileIcon extension={doc.extension} size={20} />
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{doc.title}</div>
                    {doc.description && (
                      <div className="text-xs text-muted-foreground truncate">{doc.description}</div>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground truncate">
                    {doc.createdBy}
                  </div>

                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(parseDateField(doc.createdAt))}
                  </div>

                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(parseDateField(doc.updatedAt))}
                  </div>

                  <div className="text-center">
                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors text-primary"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    ) : doc.isText ? (
                      <span className="text-xs text-muted-foreground">Texte</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default DocsDocuments;
