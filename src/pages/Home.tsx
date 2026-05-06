import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { InfiniteCarousel } from '@/components/InfiniteCarousel';
import { EventsCalendar } from '@/components/EventsCalendar';
import { ActualitesCard } from '@/components/ActualitesCard';
import { PresenceList } from '@/components/PresenceList';
import { LinksCard } from '@/components/LinksCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useModulePermissionsContext } from '@/context/ModulePermissionsContext';
import { fetchCatalogueOffices, type CatalogueOfficeGroup } from '@/lib/catalogue';
import { fetchTodayAbsences, type AbsentPerson, fetchTodayRemoteWorking, type RemoteWorkingPerson } from '@/lib/absencesApi';
import { HomeSkeleton } from '@/components/HomeSkeleton';
import { sharePointLinks, usefulLinks, companyLifeLinks } from '@/data/homeData';
import { useExpandableList } from '@/hooks/useExpandableList';
import { useTravelingToday, usePlannedTravel, useVisitingToday } from '@/hooks/usePresence';
import type { PresencePerson } from '@/lib/presenceApi';

const noop = () => undefined;

function HomeContent() {
  const { user } = useAuth();
  const { canAccessBloc, canAccessElement } = useModulePermissionsContext();
  const userName = user?.givenName || user?.displayName || 'utilisateur';

  const [nextOffices, setNextOffices] = useState<CatalogueOfficeGroup[]>([]);
  const [isLoadingOffice, setIsLoadingOffice] = useState(true);
  const [absentsToday, setAbsentsToday] = useState<AbsentPerson[]>([]);
  const [teleworkToday, setTeleworkToday] = useState<RemoteWorkingPerson[]>([]);

  // ─── Présence : données réelles depuis l'API ─────────────
  const { data: travelingTodayData = [] } = useTravelingToday();
  const { data: plannedTravelData = [] } = usePlannedTravel();
  const { data: visitingTodayData = [] } = useVisitingToday();

  const formatPresenceDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const mapPresenceToRow = (p: PresencePerson) => ({
    name: p.name,
    email: [p.department, p.company].filter(Boolean).join(' \u2014 '),
  });

  const mapPresenceToRowWithDate = (p: PresencePerson) => ({
    name: p.name,
    email: [p.department, p.company].filter(Boolean).join(' \u2014 '),
    date: formatPresenceDate(p.startDate),
  });

  const visitingToday = useMemo(
    () => visitingTodayData.map(mapPresenceToRowWithDate),
    [visitingTodayData],
  );
  const travelingToday = useMemo(
    () => travelingTodayData.map(mapPresenceToRow),
    [travelingTodayData],
  );
  const plannedTravel = useMemo(
    () => plannedTravelData.map(mapPresenceToRowWithDate),
    [plannedTravelData],
  );

  // [PERF] async-parallel: Paralléliser les 3 fetches au lieu de les exécuter séquentiellement
  useEffect(() => {
    let isActive = true;

    const handleProgress = (groups: CatalogueOfficeGroup[]) => {
      if (isActive && groups.length > 0) {
        setNextOffices(groups.slice(0, 3));
      }
    };

    // Démarrer tous les fetches en parallèle avec Promise.all
    const officePromise = fetchCatalogueOffices({ hydrateCovers: false, onCoverProgress: handleProgress })
      .then(offices => {
        if (isActive) setNextOffices(offices.slice(0, 3));
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

  const covers = nextOffices.flatMap(office =>
    office.books.map(book => ({
      src: book.cover,
      href: `/catalogue/book?ean=${book.ean}`,
    })),
  );

  // [PERF] rerender-functional-setstate: Utiliser un hook pour gérer les états expand avec des callbacks stables
  const expandKeys = ['visiting', 'traveling', 'planned', 'absents', 'telework'] as const;
  const { isExpanded, expand, collapse } = useExpandableList(expandKeys);

  const rightCardRef = useRef<HTMLDivElement>(null);
  const absentRef = useRef<HTMLDivElement>(null);
  const teleworkRef = useRef<HTMLDivElement>(null);

  const [absentMetrics, setAbsentMetrics] = useState<{ rowHeight: number; baseHeight: number }>();
  const [teleworkMetrics, setTeleworkMetrics] = useState<{ rowHeight: number; baseHeight: number }>();
  const [absentLimit, setAbsentLimit] = useState(100);
  const [teleworkLimit, setTeleworkLimit] = useState(100);

  const visitingDisplayed = isExpanded('visiting') ? visitingToday : visitingToday.slice(0, 2);
  const travelingDisplayed = isExpanded('traveling') ? travelingToday : travelingToday.slice(0, 2);
  const plannedTravelDisplayed = isExpanded('planned') ? plannedTravel : plannedTravel.slice(0, 2);

  const visitingRows = visitingDisplayed;

  // Filter links based on individual element permissions
  const filteredCompanyLifeLinks = useMemo(
    () => companyLifeLinks.filter(link => !link.elementCode || canAccessElement(link.elementCode)),
    [canAccessElement]
  );
  const filteredUsefulLinks = useMemo(
    () => usefulLinks.filter(link => !link.elementCode || canAccessElement(link.elementCode)),
    [canAccessElement]
  );
  const filteredSharePointLinks = useMemo(
    () => sharePointLinks.filter(link => !link.elementCode || canAccessElement(link.elementCode)),
    [canAccessElement]
  );

  const linksDefaultLimit = 10;
  const usefulLinksLimit = linksDefaultLimit;
  const companyLifeLinksLimit = linksDefaultLimit;
  const sharePointLinksLimit = linksDefaultLimit;

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
        setLimit(Math.min(totalRows, Math.max(10, maxRows)));
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
  }, [isExpanded, absentMetrics, teleworkMetrics, absentsToday.length, teleworkToday.length]);

  const [absentSearch, setAbsentSearch] = useState('');
  const [teleworkSearch, setTeleworkSearch] = useState('');

  const absentsFiltered = useMemo(() => {
    if (!absentSearch.trim()) return absentsToday;
    const s = absentSearch.toLowerCase();
    return absentsToday.filter((a) => String(a.name).toLowerCase().includes(s) || String(a.email).toLowerCase().includes(s));
  }, [absentsToday, absentSearch]);

  const teleworkFiltered = useMemo(() => {
    if (!teleworkSearch.trim()) return teleworkToday;
    const s = teleworkSearch.toLowerCase();
    return teleworkToday.filter((t) => String(t.name).toLowerCase().includes(s) || String(t.email).toLowerCase().includes(s));
  }, [teleworkToday, teleworkSearch]);

  const absentsDisplayed = isExpanded('absents') ? absentsFiltered : absentsFiltered.slice(0, absentLimit);
  const teleworkDisplayed = isExpanded('telework') ? teleworkFiltered : teleworkFiltered.slice(0, teleworkLimit);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* En-tête */}
      {canAccessBloc('HOME_HERO_CARD') && (
        <div className="rounded-2xl border border-border bg-card text-card-foreground px-4 sm:px-6 py-5 sm:py-6">
          {canAccessBloc('HOME_INFINITE_CAROUSEL_SECTION_1') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
              {canAccessBloc('HOME_GREETING_COLUMN') && (
                <div className="lg:col-span-3 flex flex-col justify-between lg:min-h-[220px]">
                  {canAccessBloc('HOME_HEADING_BLOC') && (
                    <div>
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase()}
                      </h1>
                      <h2 className="mt-2 text-base sm:text-lg lg:text-xl text-muted-foreground capitalize">
                        {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: '2-digit' })}
                      </h2>
                    </div>
                  )}
                  {canAccessBloc('HOME_GREETING') && (
                    <div className="mt-4 lg:mt-6 space-y-1">
                      {canAccessElement('HOME_GREETING_TEXT') && (
                        <p className="text-base lg:text-lg font-semibold">Bonjour {userName}</p>
                      )}
                      {canAccessElement('HOME_TEXT_BONNE_JOURNEE') && (
                        <p className="text-base lg:text-lg font-semibold text-primary">Bonne journée !</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {canAccessBloc('HOME_INFINITE_CAROUSEL_SECTION_2') && (
                <div className="lg:col-span-9">
                  {canAccessBloc('HOME_OFFICE_INFO') && (
                    <div className="flex items-baseline justify-between mb-3">
                      {isLoadingOffice ? (
                        <Skeleton className="h-4 w-60" />
                      ) : nextOffices.length > 0 ? (
                        <h2 className="text-2xl font-semibold leading-none tracking-wide">
                          Prochaines offices
                        </h2>
                      ) : (
                        <span className="text-sm lg:text-base text-muted-foreground">Aucune office prévue</span>
                      )}
                    </div>
                  )}
                  {canAccessBloc('HOME_INFINITE_CAROUSEL') && (
                    <>
                      {isLoadingOffice ? (
                        <Skeleton className="h-48 w-full rounded-xl" />
                      ) : covers.length > 0 ? (
                        <InfiniteCarousel covers={covers} pixelsPerSecond={20} />
                      ) : (
                        <div className="h-48 w-full rounded-xl bg-muted flex items-center justify-center">
                          <p className="text-muted-foreground">Aucune couverture disponible</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section Actualités et calendrier */}
      {canAccessBloc('HOME_ACTUALITES_SECTION') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {canAccessBloc('HOME_ACTUALITES_CARD') && <ActualitesCard />}
          {canAccessBloc('HOME_CARD') && (
            <Card>
              <CardContent className="pt-4">
                <EventsCalendar />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Présence */}
      {canAccessBloc('HOME_PRESENCE_SECTION') && (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div ref={absentRef}>
          <PresenceList title="Absent aujourd'hui"
            columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }, { key: 'retour', label: 'Retour prévu' }]}
            rows={absentsDisplayed} count={absentsFiltered.length} searchable sortable showMore={!isExpanded('absents') && absentsFiltered.length > absentLimit} showLess={isExpanded('absents') && absentsFiltered.length > absentLimit} onSearch={setAbsentSearch} onSort={noop} onShowMore={() => expand('absents')} onShowLess={() => collapse('absents')} emptyMessage={absentSearch ? 'aucun résultat' : 'aucun absent aujourd\'hui'} />
        </div>
        <div ref={teleworkRef}>
          <PresenceList title="Télétravail aujourd'hui"
            columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }]}
            rows={teleworkDisplayed} count={teleworkFiltered.length} searchable sortable showMore={!isExpanded('telework') && teleworkFiltered.length > teleworkLimit} showLess={isExpanded('telework') && teleworkFiltered.length > teleworkLimit} onSearch={setTeleworkSearch} onSort={noop} onShowMore={() => expand('telework')} onShowLess={() => collapse('telework')} emptyMessage={teleworkSearch ? 'aucun résultat' : 'aucun télétravail aujourd\'hui'}/>
        </div>
        <Card ref={rightCardRef} className="self-start">
          <CardContent className="pt-6 space-y-6">
            <PresenceList variant="embedded" title="En visite chez nous"
              columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }, { key: 'date', label: 'Date' }]}
              rows={visitingRows} count={visitingToday.length}
              showMore={!isExpanded('visiting') && visitingToday.length > 2} showLess={isExpanded('visiting') && visitingToday.length > 2} onShowMore={() => expand('visiting')} onShowLess={() => collapse('visiting')} emptyMessage="aucune visite chez nous" />
            <PresenceList variant="embedded" title="En déplacement aujourd'hui"
              columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }]}
              rows={travelingDisplayed} count={travelingToday.length} searchable sortable sortKeys={['name']} showMore={!isExpanded('traveling') && travelingToday.length > 2} showLess={isExpanded('traveling') && travelingToday.length > 2} onSort={noop} onShowMore={() => expand('traveling')} onShowLess={() => collapse('traveling')} emptyMessage="aucun déplacement aujourd'hui"
            />
            <PresenceList variant="embedded" title="Déplacement prévu"
              columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' }, { key: 'date', label: 'Date' }]}
              rows={plannedTravelDisplayed} count={plannedTravel.length} searchable sortable sortKeys={['date', 'name']} showMore={!isExpanded('planned') && plannedTravel.length > 2} showLess={isExpanded('planned') && plannedTravel.length > 2} onSort={noop} onShowMore={() => expand('planned')} onShowLess={() => collapse('planned')} emptyMessage="aucun déplacement prévu"/>
          </CardContent>
        </Card>
      </div>
      )}

      {/* 3 colonnes de liens */}
      {canAccessBloc('HOME_LINKS_SECTION') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {canAccessBloc('HOME_LIENS_UTILES_CARD') && (
            <LinksCard title="Sites utiles" links={filteredUsefulLinks} limit={usefulLinksLimit} />
          )}
          {canAccessBloc('HOME_VIE_ENTREPRISE_CARD') && (
            <LinksCard title="Vie de l'entreprise" links={filteredCompanyLifeLinks} limit={companyLifeLinksLimit} />
          )}
          {canAccessBloc('HOME_SHAREPOINT_CARD') && (
            <LinksCard title="Sites Share Point" links={filteredSharePointLinks} limit={sharePointLinksLimit} />
          )}
        </div>
      )}
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
