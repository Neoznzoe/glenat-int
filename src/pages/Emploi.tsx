import JobOffer from '@/components/JobOffer';
import { useJobOffers } from '@/hooks/useJobOffers';
import { Loader2 } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
export function Emploi() {
  const {
    data: jobOffers,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useJobOffers();

  const showLoading = isLoading || isFetching;
  const hasOffers = (jobOffers?.length ?? 0) > 0;
  const errorMessage =
    error instanceof Error
      ? error.message
      : "Une erreur inattendue est survenue lors du chargement des offres.";

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Emploi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {showLoading ? (
        <div className="flex min-h-[200px] w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Chargement des offres d'emploi…</span>
        </div>
      ) : isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive-foreground">
          <p className="font-semibold">Impossible de charger les offres d'emploi.</p>
          <p className="text-sm opacity-80">{errorMessage}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 inline-flex items-center rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
          >
            Réessayer
          </button>
        </div>
      ) : hasOffers ? (
        jobOffers!.map((offer) => <JobOffer key={offer.id} offer={offer} />)
      ) : (
        <p className="text-base text-muted-foreground">
          Aucune offre d'emploi n'est disponible pour le moment.
        </p>
      )}
    </div>
  );
}

export default Emploi;
