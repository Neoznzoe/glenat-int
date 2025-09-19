import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import CatalogueLayout from './CatalogueLayout';
import { SecureLink } from '@/components/routing/SecureLink';

type CouvertureStatus =
  | { status: 'loading'; ean: string }
  | { status: 'success'; ean: string; imageBase64: string; message?: string }
  | { status: 'error'; ean: string; message: string };

type CouvertureApiResponse = {
  success?: boolean;
  message?: string;
  result?: {
    ean?: string;
    imageBase64?: string;
  };
};

const couvertureEans: string[] = [
  '9782344062814',
  '9782344065822',
  '9782344068380',
  '9782344062661',
  '9782344069080',
  '9782344051733',
  '9782344060797',
  '9782344068489',
  '9782344065327',
];

function CouvertureCard({ state }: { state: CouvertureStatus }) {
  return (
    <div className="flex h-full flex-col items-center rounded-xl border border-dashed border-border/60 bg-card/40 p-4 text-center">
      <span className="text-sm font-semibold text-muted-foreground">EAN {state.ean}</span>
      <div className="mt-3 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-background">
        {state.status === 'success' ? (
          <img src={state.imageBase64} alt={`Couverture ${state.ean}`} className="h-full w-full object-contain" />
        ) : state.status === 'error' ? (
          <span className="px-3 text-sm font-medium text-destructive">{state.message}</span>
        ) : (
          <Skeleton className="h-full w-full" />
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {state.status === 'success'
          ? state.message ?? 'Couverture récupérée avec succès.'
          : state.status === 'error'
            ? state.message
            : 'Chargement...'}
      </p>
    </div>
  );
}

export function CouvertureAParaitre() {
  const [states, setStates] = useState<CouvertureStatus[]>(() =>
    couvertureEans.map((ean) => ({ ean, status: 'loading' as const }))
  );

  useEffect(() => {
    const controller = new AbortController();
    setStates(couvertureEans.map((ean) => ({ ean, status: 'loading' as const })));

    const endpointBase = import.meta.env.DEV
      ? '/extranet/couverture'
      : 'https://api-recette.groupe-glenat.com/Api/v1.0/Extranet/couverture';

    const fetchCoverages = async () => {
      await Promise.all(
        couvertureEans.map(async (ean) => {
          try {
            const response = await fetch(`${endpointBase}?ean=${encodeURIComponent(ean)}`, {
              method: 'GET',
              headers: { Accept: 'application/json' },
              signal: controller.signal,
            });

            if (!response.ok) {
              throw new Error(`Erreur API (${response.status}) ${response.statusText}`);
            }

            const data = (await response.json()) as CouvertureApiResponse;
            const imageBase64 = data?.result?.imageBase64;
            const message = data?.message;

            if ((data?.success ?? false) && imageBase64) {
              if (controller.signal.aborted) return;
              console.log('Couverture reçue:', ean, data);
              setStates((prev) =>
                prev.map((item) =>
                  item.ean === ean
                    ? { status: 'success', ean, imageBase64, message }
                    : item
                )
              );
            } else {
              throw new Error(message ?? "Réponse inattendue de l'API couverture");
            }
          } catch (error) {
            if (controller.signal.aborted) {
              return;
            }

            if (error instanceof DOMException && error.name === 'AbortError') {
              return;
            }

            if (error instanceof Error && error.name === 'AbortError') {
              return;
            }

            const message =
              error instanceof Error ? error.message : 'Erreur inconnue lors de la récupération';

            console.error(`Erreur lors de la récupération de la couverture ${ean}:`, error);
            setStates((prev) =>
              prev.map((item) =>
                item.ean === ean
                  ? {
                      status: 'error',
                      ean,
                      message,
                    }
                  : item
              )
            );
          }
        })
      );
    };

    void fetchCoverages();
    return () => controller.abort();
  }, []);

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
            <BreadcrumbPage>Couverture à paraître</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-[2.5rem]">Catalogue</CardTitle>
          </div>
          <Input type="search" placeholder="Rechercher..." className="sm:w-64" />
        </CardHeader>
        <div className="px-6">
          <Separator />
        </div>
        <CardContent className="p-6 space-y-6">
          <CatalogueLayout active="Couverture à paraître">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {states.map((state) => (
                  <CouvertureCard key={state.ean} state={state} />
                ))}
              </div>
            </div>
          </CatalogueLayout>
        </CardContent>
      </Card>
    </div>
  );
}

export default CouvertureAParaitre;
