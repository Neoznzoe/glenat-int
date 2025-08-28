import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useRef, useLayoutEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { InfiniteCarousel } from '@/components/InfiniteCarousel';
import { EventsCalendar } from '@/components/EventsCalendar';
import { ActualitesCard } from '@/components/ActualitesCard';
import { PresenceList } from '@/components/PresenceList';

const asset = (p: string) => new URL(p, import.meta.url).href;

const covers = [
  { src: asset('../assets/images/aladin.webp'), href: '' },
  { src: asset('../assets/images/eclipse_humaine.webp') , href: '' },
  { src: asset('../assets/images/jaime_la_mode.webp') , href: '' },
  { src: asset('../assets/images/le_combat_dune_vie.webp') , href: '' },
  { src: asset('../assets/images/les_licorniers.webp') , href: '' },
  { src: asset('../assets/images/montagne_europe.webp') , href: '' },
  { src: asset('../assets/images/naya_pika.webp') , href: '' },
  { src: asset('../assets/images/odyssee.webp') , href: '' },
  { src: asset('../assets/images/jules_matrat.webp') , href: '' },
  { src: asset('../assets/images/onepiece_110.webp'), href: '' },
];

export function Home() {
  const userName = 'Victor';

  const absentsToday = [
    { name: 'David Bernard', email: 'david@example.com', retour: '12/09/2024' },
    { name: 'Emma Boucher', email: 'emma@example.com', retour: '15/09/2024' },
    { name: 'Julien Moreau', email: 'julien@example.com', retour: '16/09/2024' },
    { name: 'Sophie Lambert', email: 'sophie@example.com', retour: '18/09/2024' },
    { name: 'Thomas Leroy', email: 'thomas@example.com', retour: '19/09/2024' },
    { name: 'Camille Dupuis', email: 'camille@example.com', retour: '20/09/2024' },
    { name: 'Hugo Richard', email: 'hugo@example.com', retour: '21/09/2024' },
    { name: 'Laura Lefevre', email: 'laura@example.com', retour: '22/09/2024' },
    { name: 'Nicolas Caron', email: 'nicolas@example.com', retour: '23/09/2024' },
    { name: 'Manon Roux', email: 'manon@example.com', retour: '24/09/2024' },
    { name: 'Alexandre Garnier', email: 'alexandre@example.com', retour: '25/09/2024' },
    { name: 'Chloé Marchand', email: 'chloe@example.com', retour: '26/09/2024' },
    { name: 'Pierre Fontaine', email: 'pierre@example.com', retour: '27/09/2024' },
    { name: 'Claire Perrot', email: 'claire@example.com', retour: '28/09/2024' },
    { name: 'Lucas Pelletier', email: 'lucas@example.com', retour: '29/09/2024' },
  ];

  const teleworkToday = [
    { name: 'Alice Martin', email: 'alice@example.com' },
    { name: 'Bob Dupont', email: 'bob@example.com' },
    { name: 'Paul Girard', email: 'paul@example.com' },
    { name: 'Julie Robin', email: 'julie@example.com' },
    { name: 'Hélène Faure', email: 'helene@example.com' },
    { name: 'Antoine Picard', email: 'antoine@example.com' },
    { name: 'Marion Noël', email: 'marion@example.com' },
    { name: 'François Tessier', email: 'francois@example.com' },
    { name: 'Isabelle Moulin', email: 'isabelle@example.com' },
    { name: 'Romain Barre', email: 'romain@example.com' },
    { name: 'Céline Robert', email: 'celine@example.com' },
    { name: 'Vincent Colin', email: 'vincent@example.com' },
    { name: 'Aurélie Lucas', email: 'aurelie@example.com' },
    { name: 'Mathieu Roger', email: 'mathieu@example.com' },
    { name: 'Elodie Masson', email: 'elodie@example.com' },
    { name: 'Damien Millet', email: 'damien@example.com' },
    { name: 'Charlotte Paris', email: 'charlotte@example.com' },
  ];

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
  const [absentLimit, setAbsentLimit] = useState(absentsToday.length);
  const [teleworkLimit, setTeleworkLimit] = useState(teleworkToday.length);

  const visitingDisplayed = showAllVisiting
    ? visitingToday
    : visitingToday.slice(0, 2);
  const travelingDisplayed = showAllTraveling
    ? travelingToday
    : travelingToday.slice(0, 2);
  const plannedTravelDisplayed = showAllPlanned
    ? plannedTravel
    : plannedTravel.slice(0, 2);

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
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
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
              <p className="text-base lg:text-lg font-semibold text-[#ff3b30]">
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
              rows={visitingDisplayed}
              count={visitingToday.length}
              searchable
              sortable
              showMore={!showAllVisiting && visitingToday.length > 2}
              showLess={showAllVisiting && visitingToday.length > 2}
              onSearch={(value) => console.log('search visiting', value)}
              onSort={(value) => console.log('sort visiting', value)}
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
              showMore={!showAllTraveling && travelingToday.length > 2}
              showLess={showAllTraveling && travelingToday.length > 2}
              onSearch={(value) => console.log('search traveling', value)}
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
              count={plannedTravel.length}
              searchable
              sortable
              showMore={!showAllPlanned && plannedTravel.length > 2}
              showLess={showAllPlanned && plannedTravel.length > 2}
              onSearch={(value) => console.log('search planned', value)}
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ressources RH</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Fiches de paie', 'Demandes de congés', 'Formation', 'Évaluations'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="flex items-center justify-between p-2 hover:bg-muted rounded transition-colors"
                >
                  <span className="text-sm text-foreground">{link}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outils</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Messagerie', 'Drive partagé', 'Planning', 'Support IT'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="flex items-center justify-between p-2 hover:bg-muted rounded transition-colors"
                >
                  <span className="text-sm text-foreground">{link}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Liens utiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Intranet', 'Documentation', 'Contacts', 'Aide'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="flex items-center justify-between p-2 hover:bg-muted rounded transition-colors"
                >
                  <span className="text-sm text-foreground">{link}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
