import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, Printer, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CatalogueBook, CatalogueAuthor } from '@/lib/catalogue';

interface BookDetailPanelProps {
  book: CatalogueBook;
  authors: CatalogueAuthor[];
  ean: string | null;
}

export function BookDetailPanel({ book, authors, ean }: BookDetailPanelProps) {
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
  const summaryText = details?.summary;
  const authorBio = details?.authorBio;

  const handlePrintSheet = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadSheet = () => {
    toast.info('T\u00e9l\u00e9chargement de la fiche disponible prochainement');
  };

  const handleShareSheet = () => {
    toast.info('Partage de la fiche disponible prochainement');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-semibold uppercase leading-tight">{book.title}</h1>
              {book.details?.universLogo && (
                <div className="flex items-center justify-center p-2" style={{ backgroundColor: `var(${book.color})` }}>
                  <img src={book.details.universLogo} alt="Univers" className="h-6 w-auto" />
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-base font-medium text-muted-foreground italic">{subtitle}</p>
            )}
            {authors.length > 0 ? (
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
                {authors.map((author, index) => {
                  const displayName = author.fullName || `${author.firstName || ''} ${author.lastName || ''}`.trim();
                  return (
                    <span key={`${author.idAuthor}-${index}`} className="text-foreground">
                      <span className="font-semibold">{displayName}</span>
                      {author.fonction && (
                        <> <span className="font-normal text-muted-foreground">({author.fonction})</span></>
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
                    <span className="font-semibold">{contributor.name}</span>{' '}
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
                  <span className="inline-flex items-center rounded-md bg-[#EBEBEB] dark:bg-[#171716] px-4 py-1.5 text-xs font-semibold text-foreground">{recommendedAge}</span>
                )}
                {badges.map((badge) => (
                  <span key={badge} className="inline-flex items-center rounded-md bg-[#EBEBEB] dark:bg-[#171716] px-4 py-1.5 text-xs font-semibold text-foreground">{badge}</span>
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
              <DropdownMenuItem onSelect={(event) => { event.preventDefault(); handlePrintSheet(); }}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimer la fiche
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(event) => { event.preventDefault(); handleDownloadSheet(); }}>
                <FileText className="mr-2 h-4 w-4" />
                Télécharger en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(event) => { event.preventDefault(); handleShareSheet(); }}>
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
                <span key={category} className="inline-flex items-center rounded-md bg-[#EBEBEB] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground">{category}</span>
              ))}
            </div>
          )}
        </div>
        {infoEntries.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {infoEntries.map((item) => (
              <div key={`${item.label}-${item.value}`} className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  {stat.helper && <p className="text-xs text-muted-foreground">{stat.helper}</p>}
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
            <TabsContent value="resume" className="rounded-xl bg-muted/40 p-6 text-base leading-relaxed text-foreground">
              {details?.texts && details.texts.length > 0 ? (
                <div className="space-y-6">
                  {details.texts.find(t => t.idTypeTexte === '0000003') && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        {details.texts.find(t => t.idTypeTexte === '0000003')?.texte}
                      </h3>
                    </div>
                  )}
                  {details.texts.find(t => t.idTypeTexte === '0000001') && (
                    <div className="space-y-4">
                      {details.texts.find(t => t.idTypeTexte === '0000001')?.texte.split('\n\n').map((paragraph, index) => (
                        <p key={`0000001-${index}`} className="whitespace-pre-line">{paragraph}</p>
                      ))}
                    </div>
                  )}
                  {details.texts.find(t => t.idTypeTexte === '0000004') && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Points forts</h3>
                      {details.texts.find(t => t.idTypeTexte === '0000004')?.texte.split('\n\n').map((paragraph, index) => (
                        <p key={`0000004-${index}`} className="whitespace-pre-line">{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : summaryText ? (
                <div className="space-y-4">
                  {summaryText.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line">{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p>Aucune donnée disponible</p>
              )}
            </TabsContent>
            <TabsContent value="auteur" className="rounded-xl bg-muted/40 p-6 text-base leading-relaxed text-foreground">
              {details?.authors && details.authors.length > 0 ? (
                <div className="space-y-8">
                  {details.authors.map((author, index) => {
                    const authorName = author.fullName || `${author.firstName || ''} ${author.lastName || ''}`.trim();
                    const initials = authorName.split(' ').map(word => word.charAt(0)).filter(Boolean).slice(0, 2).join('').toUpperCase();
                    return (
                      <div key={author.idAuthor || index} className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                          <div className="flex-shrink-0">
                            {author.photo && author.photo !== '0' ? (
                              <img src={author.photo} alt={authorName} className="h-16 w-16 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-300 dark:bg-[#171716] text-white">
                                <span className="text-xl font-bold">{initials || 'A'}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-semibold">{authorName}</h3>
                            {author.bio && (
                              <div className="space-y-4">
                                {author.bio.split('\n\n').map((paragraph, pIndex) => (
                                  <p key={pIndex} className="whitespace-pre-line">{paragraph}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {index < (details.authors?.length ?? 0) - 1 && <div className="my-6 border-t border-border" />}
                      </div>
                    );
                  })}
                </div>
              ) : authorBio ? (
                <div className="space-y-4">
                  {authorBio.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line">{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p>Aucune donnée disponible</p>
              )}
            </TabsContent>
            <TabsContent value="lire" className="rounded-xl bg-background p-0 overflow-hidden">
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
                <p className="text-base leading-relaxed text-foreground p-6">Aucune donn&eacute;e disponible</p>
              )}
            </TabsContent>
            <TabsContent value="internet" className="rounded-xl bg-muted/40 p-6 text-base leading-relaxed text-foreground">
              <p>Aucune donn&eacute;e disponible</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
