import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { InfiniteCarousel } from '@/components/InfiniteCarousel';
import { EventsCalendar } from '@/components/EventsCalendar';
import { ActualitesCard } from '@/components/ActualitesCard';
import { PresenceList } from '@/components/PresenceList';
import { LinksCard } from '@/components/LinksCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { fetchNextCatalogueOffice, type CatalogueOfficeGroup } from '@/lib/catalogue';
import { fetchTodayAbsences, type AbsentPerson, fetchTodayRemoteWorking, type RemoteWorkingPerson } from '@/lib/absencesApi';
import { HomeSkeleton } from '@/components/HomeSkeleton';
import { visitingToday, travelingToday, plannedTravel, sharePointLinks, usefulLinks, companyLifeLinks } from '@/data/homeData';

const noop = () => undefined;

function HomeContent() {
  const { user } = useAuth();
  const userName = user?.givenName || user?.displayName || 'utilisateur';

  const [nextOffice, setNextOffice] = useState<CatalogueOfficeGroup | null>(null);
  const [isLoadingOffice, setIsLoadingOffice] = useState(true);
  const [absentsToday, setAbsentsToday] = useState<AbsentPerson[]>([]);
  const [teleworkToday, setTeleworkToday] = useState<RemoteWorkingPerson[]>([]);

  // [PERF] async-parallel: Paralléliser les 3 fetches au lieu de les exécuter séquentiellement
  useEffect(() => {
    let isActive = true;

    const handleProgress = (groups: CatalogueOfficeGroup[]) => {
      if (isActive && groups.length > 0) {
        setNextOffice(groups[0] ?? null);
      }
    };

    // Démarrer tous les fetches en parallèle avec Promise.all
    const officePromise = fetchNextCatalogueOffice({ hydrateCovers: false, onCoverProgress: handleProgress })
      .then(office => {
        if (isActive) setNextOffice(office);
      })
      .catch(() => {
        // Silently ignore office fetch errors
      })
      .finally(() => {
        if (isActive) setIsLoadingOffice(false);
      });

    const absencesPromise = fetchTodayAbsences()
      .then(absences => {
        if (isActive) setAbsentsToday(absences);
      })
      .catch(() => {
        // Silently ignore absences fetch errors
      });

    const remoteWorkingPromise = fetchTodayRemoteWorking()
      .then(remoteWorking => {
        if (isActive) setTeleworkToday(remoteWorking);
      })
      .catch(() => {
        // Silently ignore remote working fetch errors
      });

    // Exécuter en parallèle - pas besoin d'attendre le résultat groupé
    void Promise.all([officePromise, absencesPromise, remoteWorkingPromise]);

    return () => { isActive = false; };
  }, []);

  const covers = nextOffice?.books.map(book => ({
    src: book.cover,
    href: `/catalogue/book?ean=${book.ean}`,
  })) ?? [];

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

  const visitingDisplayed = showAllVisiting ? visitingToday : visitingToday.slice(0, 2);
  const travelingDisplayed = showAllTraveling ? travelingToday : travelingToday.slice(0, 2);
  const plannedTravelDisplayed = showAllPlanned ? plannedTravel : plannedTravel.slice(0, 2);

  type VisitingRow = { name: string; email: string; date: ReactNode };

  // [PERF] rerender-memo: Mémoriser le calcul de visitingRows pour éviter le recalcul à chaque render
  const visitingRows: VisitingRow[] = useMemo(() => {
    return visitingDisplayed.map(row => {
      const isManon = String(row.name).toLowerCase().includes('manon roux');
      return {
        ...row,
        date: isManon ? <Badge variant="default">Aujourd'hui</Badge> : row.date,
      };
    });
  }, [visitingDisplayed]);

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
        if (rowHeight === 0) return;
        const maxRows = Math.floor((rightHeight - baseHeight) / rowHeight) + offset;
        setLimit(Math.min(totalRows, Math.max(1, maxRows)));
      };

      if (!metrics) {
        const row = element.querySelector('tbody tr') as HTMLTableRowElement | null;
        const rowHeight = row?.offsetHeight ?? 0;
        if (rowHeight === 0) return;
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
  }, [showAllVisiting, showAllTraveling, showAllPlanned, absentMetrics, teleworkMetrics, absentsToday.length, teleworkToday.length]);

  const absentsDisplayed = showAllAbsents ? absentsToday : absentsToday.slice(0, absentLimit);
  const teleworkDisplayed = showAllTelework ? teleworkToday : teleworkToday.slice(0, teleworkLimit);

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="rounded-2xl border border-border bg-card text-card-foreground px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
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
              <p className="text-base lg:text-lg font-semibold">Bonjour {userName}</p>
              <p className="text-base lg:text-lg font-semibold text-primary">Bonne journée !</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex items-baseline justify-between mb-3">
              {isLoadingOffice ? (
                <Skeleton className="h-4 w-60" />
              ) : nextOffice ? (
                <span className="text-sm lg:text-base text-muted-foreground">
                  Prochaine office {nextOffice.office} : {nextOffice.date}
                </span>
              ) : (
                <span className="text-sm lg:text-base text-muted-foreground">Aucune office prévue</span>
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
          <PresenceList title="Absent aujourd'hui"
            columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }, { key: 'retour', label: 'Retour prévu' }]}
            rows={absentsDisplayed} count={absentsToday.length} searchable sortable showMore={!showAllAbsents && absentsToday.length > absentLimit} showLess={showAllAbsents && absentsToday.length > absentLimit} onSearch={noop} onSort={noop} onShowMore={() => setShowAllAbsents(true)} onShowLess={() => setShowAllAbsents(false)} emptyMessage="aucun absent aujourd'hui" />
        </div>
        <div ref={teleworkRef}>
          <PresenceList title="Télétravail aujourd'hui"
            columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }]}
            rows={teleworkDisplayed} count={teleworkToday.length} searchable sortable showMore={!showAllTelework && teleworkToday.length > teleworkLimit} showLess={showAllTelework && teleworkToday.length > teleworkLimit} onSearch={noop} onSort={noop} onShowMore={() => setShowAllTelework(true)} onShowLess={() => setShowAllTelework(false)} emptyMessage="aucun télétravail aujourd'hui"/>
        </div>
        <Card ref={rightCardRef} className="self-start">
          <CardContent className="pt-6 space-y-6">
            <PresenceList variant="embedded" title="En visite chez nous"
              columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }, { key: 'date', label: 'Date' }]}
              rows={visitingRows} count={visitingToday.length} rowClassName={(row) => String(row.name).toLowerCase().includes('manon roux') ? 'bg-primary/5' : undefined}
              showMore={!showAllVisiting && visitingToday.length > 2} showLess={showAllVisiting && visitingToday.length > 2} onShowMore={() => setShowAllVisiting(true)} onShowLess={() => setShowAllVisiting(false)} emptyMessage="aucune visite chez nous" />
            <PresenceList variant="embedded" title="En déplacement aujourd'hui"
              columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }]}
              rows={travelingDisplayed} count={travelingToday.length} searchable sortable sortKeys={['name']} showMore={!showAllTraveling && travelingToday.length > 2} showLess={showAllTraveling && travelingToday.length > 2} onSort={noop} onShowMore={() => setShowAllTraveling(true)} onShowLess={() => setShowAllTraveling(false)} emptyMessage="aucun déplacement aujourd'hui"
            />
            <PresenceList variant="embedded" title="Déplacement prévu"
              columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }, { key: 'date', label: 'Date' }]}
              rows={plannedTravelDisplayed} count={plannedTravel.length} searchable sortable sortKeys={['date', 'name']} showMore={!showAllPlanned && plannedTravel.length > 2} showLess={showAllPlanned && plannedTravel.length > 2} onSort={noop} onShowMore={() => setShowAllPlanned(true)} onShowLess={() => setShowAllPlanned(false)} emptyMessage="aucun déplacement prévu"/>
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
