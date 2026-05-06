import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import CatalogueLayout from './CatalogueLayout';
import { SecureLink } from '@/components/routing/SecureLink';
import { Download, FileSpreadsheet, HelpCircle } from 'lucide-react';

interface CatalogueFile {
  label: string;
  description: string;
  href: string;
}

const CATALOGUE_FILES: CatalogueFile[] = [
  {
    label: 'Fichier des articles',
    description: 'Liste complète des articles Navision',
    href: 'https://intranet.glenat.com/upload/vueNavisionArticlesComplets.xls',
  },
  {
    label: 'Fichier des argumentaires',
    description: 'Textes commerciaux des articles',
    href: 'https://intranet.glenat.com/upload/vueExportArticleTexte.xls',
  },
  {
    label: 'Fichier des bios',
    description: 'Biographies des auteurs',
    href: 'https://intranet.glenat.com/upload/vueExportAuteurTexte.xls',
  },
  {
    label: 'Fichier Auteurs/Séries',
    description: 'Correspondance auteurs et séries',
    href: 'https://intranet.glenat.com/upload/vueExportAuteurSerie.xls',
  },
];

export function Telecharger() {
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
            <BreadcrumbPage>Télécharger le catalogue</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
        </CardHeader>
        <div className="px-6">
          <Separator />
        </div>
        <CardContent className="p-6">
          <CatalogueLayout active="Télécharger le catalogue">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xl">Télécharger le catalogue</h3>
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Guide d'utilisation
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      className="max-w-sm bg-popover text-popover-foreground border shadow-lg p-4 text-xs leading-relaxed"
                    >
                      <p className="font-semibold uppercase tracking-wide text-[11px] mb-2">
                        Guide d'utilisation
                      </p>
                      <p className="mb-2">
                        <span className="font-semibold">Obtenir le fichier :</span> cliquer sur
                        « Fichier des articles » pour ouvrir le fichier ou faire « clic droit /
                        Enregistrer sous » pour le sauvegarder.
                      </p>
                      <p>
                        <span className="font-semibold">EAN :</span> pour afficher correctement
                        l'EAN dans Excel : sélectionner la colonne, menu Données / Convertir /
                        Suivant / Suivant / cocher « Texte » / Terminer.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {CATALOGUE_FILES.map((file) => (
                  <a
                    key={file.href}
                    href={file.href}
                    className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary hover:bg-accent"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{file.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {file.description}
                      </p>
                    </div>
                    <Download className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Telecharger;
