import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { InfiniteCarousel } from '@/components/InfiniteCarousel';
import { EventsCalendar } from '@/components/EventsCalendar';
import { ActualitesCard } from '@/components/ActualitesCard';
import { PresenceList } from '@/components/PresenceList';
import { LinksCard } from '@/components/LinksCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchHomeCarouselCovers,
  fetchHomeLinkCollections,
  fetchHomeNews,
  fetchHomePresence,
  type HomeCarouselCover,
  type HomeLinkCollection,
  type HomeNewsData,
  type HomePresenceData,
} from '@/api/home';

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

interface HomeContentProps {
  userName: string;
  covers: HomeCarouselCover[];
  presence: HomePresenceData;
  linkCollections: HomeLinkCollection[];
  news: HomeNewsData;
}

function HomeContent({
  userName,
  covers,
  presence,
  linkCollections,
  news,
}: HomeContentProps) {
  const {
    absents: absentsToday,
    telework: teleworkToday,
    visitors: visitingToday,
    traveling: travelingToday,
    plannedTravel: plannedTravelList,
  } = presence;

  const [showAllVisiting, setShowAllVisiting] = useState(false);
  const [showAllTraveling, setShowAllTraveling] = useState(false);
  const [showAllPlanned, setShowAllPlanned] = useState(false);
  const [showAllAbsents, setShowAllAbsents] = useState(false);
  const [showAllTelework, setShowAllTelework] = useState(false);

  const rightCardRef = useRef<HTMLDivElement>(null);
  const absentRef = useRef<HTMLDivElement>(null);
  const teleworkRef = useRef<HTMLDivElement>(null);

  const [absentMetrics, setAbsentMetrics] = useState<{
    rowHeight: number;
    baseHeight: number;
  }>();
  const [teleworkMetrics, setTeleworkMetrics] = useState<{
    rowHeight: number;
    baseHeight: number;
  }>();
  const [absentLimit, setAbsentLimit] = useState(absentsToday.length);
  const [teleworkLimit, setTeleworkLimit] = useState(teleworkToday.length);

  useEffect(() => {
    setAbsentLimit(absentsToday.length);
  }, [absentsToday.length]);

  useEffect(() => {
    setTeleworkLimit(teleworkToday.length);
  }, [teleworkToday.length]);

  const visitingDisplayed = showAllVisiting
    ? visitingToday
    : visitingToday.slice(0, 2);
  const travelingDisplayed = showAllTraveling
    ? travelingToday
    : travelingToday.slice(0, 2);
  const plannedTravelDisplayed = showAllPlanned
    ? plannedTravelList
    : plannedTravelList.slice(0, 2);

  type VisitingRow = { name: string; email: string; date: ReactNode };

  const visitingRows: VisitingRow[] = useMemo(
    () =>
      visitingDisplayed.map((row) => {
        const isManon = String(row.name).toLowerCase().includes('manon roux');
        return {
          ...row,
          date: isManon ? <Badge variant="default">Aujourd'hui</Badge> : row.date,
        };
      }),
    [visitingDisplayed],
  );

  const linkCollectionsById = useMemo(() => {
    const map = new Map<HomeLinkCollection['id'], HomeLinkCollection>();
    for (const collection of linkCollections) {
      map.set(collection.id, collection);
    }
    return map;
  }, [linkCollections]);

  const usefulCollection = linkCollectionsById.get('useful');
  const companyLifeCollection = linkCollectionsById.get('companyLife');
  const sharePointCollection = linkCollectionsById.get('sharePoint');

  const getLimit = (collection?: HomeLinkCollection) =>
    collection?.initialDisplayCount ?? collection?.items.length ?? undefined;

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
      if (!element) return;

      const apply = ({ rowHeight, baseHeight }: { rowHeight: number; baseHeight: number }) => {
        const maxRows = Math.floor((rightHeight - baseHeight) / rowHeight) + offset;
        setLimit(Math.min(totalRows, Math.max(0, maxRows)));
      };

      if (!metrics) {
        const row = element.querySelector('tbody tr') as HTMLTableRowElement | null;
        const rowHeight = row?.offsetHeight ?? 0;
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
                {new Date().toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                })}
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
              <span className="text-sm lg:text-base text-muted-foreground">
                Prochaine office 255001 : 08/01/2025
              </span>
            </div>
            <InfiniteCarousel covers={covers} speedSeconds={30} />
          </div>
        </div>
      </div>

      {/* Section Actualités et calendrier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActualitesCard
          newArrivals={news.newArrivals}
          saintNamesByWeekday={news.saintNamesByWeekday}
        />
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
            onSearch={(value) => console.log('search absent', value)}
            onSort={(value) => console.log('sort absent', value)}
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
            onSearch={(value) => console.log('search telework', value)}
            onSort={(value) => console.log('sort telework', value)}
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
              onSort={(value) => console.log('sort traveling', value)}
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
              count={plannedTravelList.length}
              searchable
              sortable
              sortKeys={['date', 'name']}
              showMore={!showAllPlanned && plannedTravelList.length > 2}
              showLess={showAllPlanned && plannedTravelList.length > 2}
              onSort={(value) => console.log('sort planned', value)}
              onShowMore={() => setShowAllPlanned(true)}
              onShowLess={() => setShowAllPlanned(false)}
              emptyMessage="aucun déplacement prévu"
            />
          </CardContent>
        </Card>
      </div>

      {/* 3 colonnes de liens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LinksCard
          title={usefulCollection?.title ?? 'Sites utiles'}
          links={usefulCollection?.items ?? []}
          limit={getLimit(usefulCollection)}
        />
        <LinksCard
          title={companyLifeCollection?.title ?? "Vie de l'entreprise"}
          links={companyLifeCollection?.items ?? []}
          limit={getLimit(companyLifeCollection)}
        />
        <LinksCard
          title={sharePointCollection?.title ?? 'Sites Share Point'}
          links={sharePointCollection?.items ?? []}
          limit={getLimit(sharePointCollection)}
        />
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

  const carouselQuery = useQuery({
    queryKey: ['home', 'carousel'],
    queryFn: fetchHomeCarouselCovers,
  });
  const presenceQuery = useQuery({
    queryKey: ['home', 'presence'],
    queryFn: fetchHomePresence,
  });
  const linksQuery = useQuery({
    queryKey: ['home', 'links'],
    queryFn: fetchHomeLinkCollections,
  });
  const newsQuery = useQuery({
    queryKey: ['home', 'news'],
    queryFn: fetchHomeNews,
  });

  const isLoading =
    !isReady ||
    carouselQuery.isPending ||
    presenceQuery.isPending ||
    linksQuery.isPending ||
    newsQuery.isPending;

  const hasError =
    carouselQuery.isError ||
    presenceQuery.isError ||
    linksQuery.isError ||
    newsQuery.isError;

  const presence = presenceQuery.data;
  const news = newsQuery.data;

  if (isLoading || hasError || !presence || !news) {
    return <HomeSkeleton />;
  }

  return (
    <HomeContent
      userName="Victor"
      covers={carouselQuery.data ?? []}
      presence={presence}
      linkCollections={linksQuery.data ?? []}
      news={news}
    />
  );
}
