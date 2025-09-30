import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CatalogueLayout from './CatalogueLayout';
import { SecureLink } from '@/components/routing/SecureLink';

export function Editions() {
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
            <BreadcrumbPage>Éditions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <CatalogueLayout>
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed bg-muted/40 text-center text-muted-foreground">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Univers éditoriaux bientôt disponibles</p>
                <p>
                  Les données réelles des différentes éditions seront intégrées prochainement. Restez
                  connectés !
                </p>
              </div>
            </div>
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default Editions;
