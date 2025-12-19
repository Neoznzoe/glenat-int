import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { InfiniteCarousel } from '@/components/InfiniteCarousel';
import { EventsCalendar } from '@/components/EventsCalendar';
import { ActualitesCard } from '@/components/ActualitesCard';
import { PresenceList } from '@/components/PresenceList';
import { LinksCard } from '@/components/LinksCard';
import type { LinkItem } from '@/components/LinksCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { fetchNextCatalogueOffice, type CatalogueOfficeGroup } from '@/lib/catalogue';
import { fetchTodayAbsences, type AbsentPerson, fetchTodayRemoteWorking, type RemoteWorkingPerson } from '@/lib/absencesApi';

const noop = () => undefined;

function HomeSkeletonPresenceTable({
  rows = 4,
  columns = 3,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            {Array.from({ length: columns }).map((__, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={`h-4 ${columnIndex === 0 ? 'flex-1' : 'w-24'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeSkeletonLinksCard() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HomeSkeletonHeader() {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="flex min-h-[220px] flex-col justify-between space-y-6 lg:col-span-4">
          <div className="space-y-4">
            <Skeleton className="h-12 w-52" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="space-y-4 lg:col-span-8">
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function HomeSkeletonActualites() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function HomeSkeletonPresenceSection() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card>
        <CardContent className="space-y-4 p-6">
          <HomeSkeletonPresenceTable rows={5} columns={3} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-6">
          <HomeSkeletonPresenceTable rows={4} columns={2} />
        </CardContent>
      </Card>
      <Card className="self-start">
        <CardContent className="space-y-6 p-6">
          <HomeSkeletonPresenceTable rows={3} columns={3} />
          <HomeSkeletonPresenceTable rows={3} columns={2} />
          <HomeSkeletonPresenceTable rows={3} columns={3} />
        </CardContent>
      </Card>
    </div>
  );
}

function HomeSkeletonLinksSection() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <HomeSkeletonLinksCard />
      <HomeSkeletonLinksCard />
      <HomeSkeletonLinksCard />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <HomeSkeletonHeader />
      <HomeSkeletonActualites />
      <HomeSkeletonPresenceSection />
      <HomeSkeletonLinksSection />
    </div>
  );
}

function HomeContent() {
  const { user } = useAuth();
  const userName = user?.givenName || user?.displayName || 'utilisateur';

  const [nextOffice, setNextOffice] = useState<CatalogueOfficeGroup | null>(null);
  const [isLoadingOffice, setIsLoadingOffice] = useState(true);
  const [absentsToday, setAbsentsToday] = useState<AbsentPerson[]>([]);
  const [teleworkToday, setTeleworkToday] = useState<RemoteWorkingPerson[]>([]);

  useEffect(() => {
    let isActive = true;

    const handleProgress = (groups: CatalogueOfficeGroup[]) => {
      if (isActive && groups.length > 0) {
        setNextOffice(groups[0] ?? null);
      }
    };

    fetchNextCatalogueOffice({ hydrateCovers: false, onCoverProgress: handleProgress })
      .then(office => {
        if (isActive) {
          setNextOffice(office);
        }
      })
      .catch(error => {
        console.error('Impossible de récupérer la prochaine office', error);
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingOffice(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    console.log('Home: Fetching absences...');
    fetchTodayAbsences()
      .then(absences => {
        console.log('Home: Absences received:', absences);
        if (isActive) {
          setAbsentsToday(absences);
          console.log('Home: State updated with absences:', absences.length);
        }
      })
      .catch(error => {
        console.error('Impossible de récupérer les absences', error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    console.log('Home: Fetching remote working...');
    fetchTodayRemoteWorking()
      .then(remoteWorking => {
        console.log('Home: Remote working received:', remoteWorking);
        if (isActive) {
          setTeleworkToday(remoteWorking);
          console.log('Home: State updated with remote working:', remoteWorking.length);
        }
      })
      .catch(error => {
        console.error('Impossible de récupérer le télétravail', error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const covers = nextOffice?.books.map(book => ({
    src: book.cover,
    href: `/catalogue/book?ean=${book.ean}`,
  })) ?? [];

  const visitingToday = [
    { name: 'Manon Roux', email: 'manon@example.com', date: '24/09/2024' },
    { name: 'Alexandre Garnier', email: 'alexandre@example.com', date: '25/09/2024' },
    { name: 'Chloé Marchand', email: 'chloe@example.com', date: '26/09/2024' },
    { name: 'Pierre Fontaine', email: 'pierre@example.com', date: '27/09/2024' },
    { name: 'Claire Perrot', email: 'claire@example.com', date: '28/09/2024' },
    { name: 'Lucas Pelletier', email: 'lucas@example.com', date: '29/09/2024' },
  ];

  const travelingToday = [
    { name: 'Marc Petit', email: 'marc@example.com' },
    { name: 'Sébastien Robert', email: 'sebastien@example.com' },
    { name: 'Caroline André', email: 'caroline@example.com' },
    { name: 'Philippe Blanc', email: 'philippe@example.com' },
    { name: 'Sandrine Roche', email: 'sandrine@example.com' },
  ];

  const plannedTravel = [
    { name: 'Anne Grand', email: 'anne@example.com', date: '25/09/2024' },
    { name: 'Louis Renard', email: 'louis@example.com', date: '26/09/2024' },
    { name: 'Mélanie Vincent', email: 'melanie@example.com', date: '27/09/2024' },
  ];

  const [showAllVisiting, setShowAllVisiting] = useState(false);
  const [showAllTraveling, setShowAllTraveling] = useState(false);
  const [showAllPlanned, setShowAllPlanned] = useState(false);
  const [showAllAbsents, setShowAllAbsents] = useState(false);
  const [showAllTelework, setShowAllTelework] = useState(false);

  const rightCardRef = useRef<HTMLDivElement>(null);
  const absentRef = useRef<HTMLDivElement>(null);
  const teleworkRef = useRef<HTMLDivElement>(null);

  const [absentMetrics, setAbsentMetrics] = useState<{ rowHeight: number; baseHeight: number }>();
  const [teleworkMetrics, setTeleworkMetrics] = useState<{ rowHeight: number; baseHeight: number }>();
  const [absentLimit, setAbsentLimit] = useState(100);
  const [teleworkLimit, setTeleworkLimit] = useState(100);

  const visitingDisplayed = showAllVisiting
    ? visitingToday
    : visitingToday.slice(0, 2);
  const travelingDisplayed = showAllTraveling
    ? travelingToday
    : travelingToday.slice(0, 2);
  const plannedTravelDisplayed = showAllPlanned
    ? plannedTravel
    : plannedTravel.slice(0, 2);

  type VisitingRow = { name: string; email: string; date: ReactNode };

  const visitingRows: VisitingRow[] = (() => {
    return visitingDisplayed.map(row => {
      const isManon = String(row.name).toLowerCase().includes('manon roux');
      return {
        ...row,
        date: isManon ? <Badge variant="default">Aujourd'hui</Badge> : row.date,
      };
    });
  })();

  const sharePointLinks: LinkItem[] = [
    { label: 'Accueil office 365', href: '#' },
    { label: 'ACHAT Equipe', href: '#' },
    { label: 'ADV Equipe', href: '#' },
    { label: 'CESSIONS-DE-DROITS Equipe', href: '#' },
    { label: 'COMITE-DIRECTION', href: '#' },
    { label: 'COMMERCIAL Titeuf', href: '#' },
    { label: 'COMMERCIALE Equipe', href: '#' },
    { label: 'COMPTABILITE Equipe', href: '#' },
    { label: 'CONTRÔLE-GESTION Equipe', href: '#' },
    { label: 'DIRECTION-GENERALE', href: '#' },
    { label: 'DROITS-AUTEUR Equipe', href: '#' },
    { label: 'EDITO-BD Equipe', href: '#' },
    { label: 'EDITO-JEUNESSE Equipe', href: '#' },
    { label: 'EDITO-LIVRES Equipe', href: '#' },
    { label: 'EDITO-LIVRES-SOUS-LICENCES Equipe', href: '#' },
    { label: 'EDITO-MANGA Equipe', href: '#' },
    { label: 'EDITO-MANGA Interne', href: '#' },
    { label: 'EDITO-MANGAS Partenaires', href: '#' },
    { label: 'EVENEMENTIEL Equipe', href: '#' },
    { label: 'FABRICANTS Equipe', href: '#' },
    { label: 'GALERIE Equipe', href: '#' },
    { label: 'INFORMATIQUE Equipe', href: '#' },
    { label: 'JEUX Equipe', href: '#' },
    { label: 'LECTURES Equipe', href: '#' },
    { label: 'LICENCES Equipe', href: '#' },
    { label: 'MARKETING Equipe', href: '#' },
    { label: 'MARKETING-DIGITAL Equipe', href: '#' },
    { label: 'MCDE Equipe', href: '#' },
    { label: 'PARTENARIATS Equipe', href: '#' },
    { label: 'PEDAGOGIE Equipe', href: '#' },
    { label: 'PROJET Chemin-Fer', href: '#' },
    { label: 'PROJET Compta', href: '#' },
    { label: 'PROJET Navision-DA', href: '#' },
    { label: 'PROJET Navision-ED', href: '#' },
    { label: 'PROJET Navision-EDI', href: '#' },
    { label: 'PROJET Navision-Fournisseurs', href: '#' },
    { label: 'PROJET Signature Mail', href: '#' },
    { label: 'PROJET TRAVAIL Colle', href: '#' },
    { label: 'RESSOURCES-HUMAINES Equipe', href: '#' },
    { label: 'RSE Equipe', href: '#' },
    { label: 'SUPPORT Bureautique', href: '#' },
    { label: 'Support IT', href: '#' },
    { label: 'Support RH', href: '#' },
    { label: 'SUPPORT TECHNIQUE', href: '#' },
    { label: 'SUPPORT Template', href: '#' },
    { label: 'Support Signalétique', href: '#' },
    { label: 'TECHNIQUE Equipe', href: '#' },
    { label: 'VENTES Equipe', href: '#' },
    { label: 'VENTES-DEVELOPPEMENT Equipe', href: '#' },
  ];

  const usefulLinks: LinkItem[] = [
    { label: 'CSE Glénat', href: '#' },
    { label: 'Assistance informatique', href: '#' },
    { label: 'Support informatique Android', href: '#' },
    { label: 'Notilus - Notes de frais', href: '#', badge: 'New' },
    { label: 'Plateforme de formation', href: '#' },
    { label: 'Pages jaunes', href: '#' },
    { label: 'SNCF', href: '#' },
    { label: 'Horaires TGV', href: '#' },
    { label: 'Base marques - Site INPI', href: '#' },
    { label: 'Site Electre', href: '#' },
    { label: 'Glénat', href: '#' },
    { label: 'Le couvent Sainte-Cécile', href: '#' },
  ];

  const companyLifeLinks: LinkItem[] = [
    {
      label: 'opérations informatiques en cours',
      href: '#',
      badge: '74',
      badgeColor: 'bg-primary',
      highlight: true,
      badgePosition: 'left',
    },
    { label: "Glénat'Matin", href: '#' },
    { label: 'Film institutionnel', href: '#' },
    { label: 'Sainte-Cécile', href: '#' },
    { label: 'La boite à idée', href: '#' },
    { label: 'Audience internet par mois', href: '#' },
    { label: 'Audience internet par jour', href: '#' },
    { label: 'Audience internet par historique', href: '#' },
    { label: 'Abonnement aux newsletter', href: '#' },
  ];

  const linkLimit = companyLifeLinks.length;

  useLayoutEffect(() => {
    const rightHeight = rightCardRef.current?.scrollHeight ?? 0;

    const computeLimit = (
      element: HTMLDivElement | null,
      metrics: { rowHeight: number; baseHeight: number } | undefined,
      totalRows: number,
      offset: number,
      setMetrics: (m: { rowHeight: number; baseHeight: number }) => void,
      setLimit: (rows: number) => void,
    ) => {
      if (!element || totalRows === 0) return;

      const apply = ({ rowHeight, baseHeight }: { rowHeight: number; baseHeight: number }) => {
        if (rowHeight === 0) return; // Ne pas calculer si on ne peut pas mesurer
        const maxRows = Math.floor((rightHeight - baseHeight) / rowHeight) + offset;
        setLimit(Math.min(totalRows, Math.max(1, maxRows))); // Au moins 1 ligne si totalRows > 0
      };

      if (!metrics) {
        const row = element.querySelector('tbody tr') as HTMLTableRowElement | null;
        const rowHeight = row?.offsetHeight ?? 0;
        if (rowHeight === 0) return; // Pas de ligne à mesurer, on attend
        const cardHeight = element.scrollHeight;
        const baseHeight = cardHeight - rowHeight * totalRows;
        const data = { rowHeight, baseHeight };
        setMetrics(data);
        apply(data);
      } else {
        apply(metrics);
      }
    };

    computeLimit(absentRef.current, absentMetrics, absentsToday.length, 0, setAbsentMetrics, setAbsentLimit);
    computeLimit(teleworkRef.current, teleworkMetrics, teleworkToday.length, -1, setTeleworkMetrics, setTeleworkLimit);
  }, [
    showAllVisiting,
    showAllTraveling,
    showAllPlanned,
    absentMetrics,
    teleworkMetrics,
    absentsToday.length,
    teleworkToday.length,
  ]);

  const absentsDisplayed = showAllAbsents
    ? absentsToday
    : absentsToday.slice(0, absentLimit);

  console.log('Home render:', {
    absentsToday: absentsToday.length,
    absentLimit,
    absentsDisplayed: absentsDisplayed.length,
    showAllAbsents
  });

  const teleworkDisplayed = showAllTelework
    ? teleworkToday
    : teleworkToday.slice(0, teleworkLimit);

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="rounded-2xl border border-border bg-card text-card-foreground px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Colonne gauche : Jour / Date / Message */}
          <div className="lg:col-span-4 flex flex-col justify-between min-h-[220px]">
            <div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase()}
              </h1>
              <h2 className="mt-2 text-lg lg:text-xl text-muted-foreground capitalize">
                {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: '2-digit' })}
              </h2>
            </div>
            <div className="mt-6 space-y-1">
              <p className="text-base lg:text-lg font-semibold">
                Bonjour {userName}
              </p>
              <p className="text-base lg:text-lg font-semibold text-primary">
                Bonne journée !
              </p>
            </div>
          </div>

          {/* Colonne droite : Prochaine office + Carrousel */}
          <div className="lg:col-span-8">
            <div className="flex items-baseline justify-between mb-3">
              {isLoadingOffice ? (
                <Skeleton className="h-4 w-60" />
              ) : nextOffice ? (
                <span className="text-sm lg:text-base text-muted-foreground">
                  Prochaine office {nextOffice.office} : {nextOffice.date}
                </span>
              ) : (
                <span className="text-sm lg:text-base text-muted-foreground">
                  Aucune office prévue
                </span>
              )}
            </div>
            {isLoadingOffice ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : covers.length > 0 ? (
              <InfiniteCarousel covers={covers} speedSeconds={30} />
            ) : (
              <div className="h-48 w-full rounded-xl bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Aucune couverture disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Actualités et calendrier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActualitesCard />
        <Card className="lg:col-span-1">
          <CardContent className="pt-4">
            <EventsCalendar />
          </CardContent>
        </Card>
      </div>

      {/* Présence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div ref={absentRef}>
          <PresenceList
            title="Absent aujourd'hui"
            columns={[
              { key: 'name', label: 'Nom' },
              { key: 'email', label: 'Email' },
              { key: 'retour', label: 'Retour prévu' },
            ]}
            rows={absentsDisplayed}
            count={absentsToday.length}
            searchable
            sortable
            showMore={!showAllAbsents && absentsToday.length > absentLimit}
            showLess={showAllAbsents && absentsToday.length > absentLimit}
            onSearch={noop}
            onSort={noop}
            onShowMore={() => setShowAllAbsents(true)}
            onShowLess={() => setShowAllAbsents(false)}
            emptyMessage="aucun absent aujourd'hui"
          />
        </div>
        <div ref={teleworkRef}>
          <PresenceList
            title="Télétravail aujourd'hui"
            columns={[
              { key: 'name', label: 'Nom' },
              { key: 'email', label: 'Email' },
            ]}
            rows={teleworkDisplayed}
            count={teleworkToday.length}
            searchable
            sortable
            showMore={!showAllTelework && teleworkToday.length > teleworkLimit}
            showLess={showAllTelework && teleworkToday.length > teleworkLimit}
            onSearch={noop}
            onSort={noop}
            onShowMore={() => setShowAllTelework(true)}
            onShowLess={() => setShowAllTelework(false)}
            emptyMessage="aucun télétravail aujourd'hui"
          />
        </div>
        <Card ref={rightCardRef} className="self-start">
          <CardContent className="pt-6 space-y-6">
            <PresenceList
              variant="embedded"
              title="En visite chez nous"
              columns={[
                { key: 'name', label: 'Nom' },
                { key: 'email', label: 'Email' },
                { key: 'date', label: 'Date' },
              ]}
              rows={visitingRows}
              count={visitingToday.length}
              rowClassName={(row) =>
                String(row.name).toLowerCase().includes('manon roux')
                  ? 'bg-primary/5'
                  : undefined
              }
              showMore={!showAllVisiting && visitingToday.length > 2}
              showLess={showAllVisiting && visitingToday.length > 2}
              onShowMore={() => setShowAllVisiting(true)}
              onShowLess={() => setShowAllVisiting(false)}
              emptyMessage="aucune visite chez nous"
            />
            <PresenceList
              variant="embedded"
              title="En déplacement aujourd'hui"
              columns={[
                { key: 'name', label: 'Nom' },
                { key: 'email', label: 'Email' },
              ]}
              rows={travelingDisplayed}
              count={travelingToday.length}
              searchable
              sortable
              sortKeys={['name']}
              showMore={!showAllTraveling && travelingToday.length > 2}
              showLess={showAllTraveling && travelingToday.length > 2}
              onSort={noop}
              onShowMore={() => setShowAllTraveling(true)}
              onShowLess={() => setShowAllTraveling(false)}
              emptyMessage="aucun déplacement aujourd'hui"
            />
            <PresenceList
              variant="embedded"
              title="Déplacement prévu"
              columns={[
                { key: 'name', label: 'Nom' },
                { key: 'email', label: 'Email' },
                { key: 'date', label: 'Date' },
              ]}
              rows={plannedTravelDisplayed}
              count={plannedTravel.length}
              searchable
              sortable
              sortKeys={['date', 'name']}
              showMore={!showAllPlanned && plannedTravel.length > 2}
              showLess={showAllPlanned && plannedTravel.length > 2}
              onSort={noop}
              onShowMore={() => setShowAllPlanned(true)}
              onShowLess={() => setShowAllPlanned(false)}
              emptyMessage="aucun déplacement prévu"
            />
          </CardContent>
        </Card>
      </div>

      {/* 3 colonnes de liens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LinksCard title="Sites utiles" links={usefulLinks} limit={linkLimit} />
        <LinksCard title="Vie de l'entreprise" links={companyLifeLinks} limit={linkLimit} />
        <LinksCard title="Sites Share Point" links={sharePointLinks} limit={linkLimit} />
      </div>
    </div>
  );
}

export function Home() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handle = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => {
      window.cancelAnimationFrame(handle);
    };
  }, []);

  if (!isReady) {
    return <HomeSkeleton />;
  }

  return <HomeContent />;
}
