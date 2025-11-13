import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CalendarDays,
  Clock,
  Link as LinkIcon,
  Loader2,
  MapPin,
} from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCalendarEventColors,
  useCalendarEvents,
  type CalendarEventRecord,
} from '@/hooks/useCalendarEvents';

interface EnrichedCalendarEvent extends CalendarEventRecord {
  reasonKey?: string;
  colorHex?: string;
  colorLabel?: string;
}

interface MonthGroup {
  key: string;
  label: string;
  events: EnrichedCalendarEvent[];
}

function normalizeReasonKey(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : undefined;
}

function parseIsoDate(value?: string): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    return new Date(timestamp);
  }
  return parsed;
}

function hasTimeComponent(date: Date): boolean {
  return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
}

function formatDisplayDate(date: Date, options?: { withWeekday?: boolean; withTime?: boolean }) {
  const withWeekday = options?.withWeekday ?? true;
  const withTime = options?.withTime ?? hasTimeComponent(date);
  const basePattern = withWeekday ? 'EEEE d MMMM yyyy' : 'd MMMM yyyy';
  if (withTime && hasTimeComponent(date)) {
    return format(date, `${basePattern} 'à' HH:mm`, { locale: fr });
  }
  return format(date, basePattern, { locale: fr });
}

function formatDateRange(startIso: string, endIso?: string | null): string {
  const startDate = parseIsoDate(startIso);
  if (!startDate) {
    return 'Date à confirmer';
  }
  const endDate = endIso ? parseIsoDate(endIso) : null;
  if (!endDate) {
    return formatDisplayDate(startDate);
  }

  if (isSameDay(startDate, endDate)) {
    const hasStartTime = hasTimeComponent(startDate);
    const hasEndTime = hasTimeComponent(endDate);
    if (hasStartTime || hasEndTime) {
      const dayLabel = formatDisplayDate(startDate, { withTime: false });
      if (hasStartTime && hasEndTime) {
        return `${dayLabel} de ${format(startDate, 'HH:mm', { locale: fr })} à ${format(endDate, 'HH:mm', { locale: fr })}`;
      }
      const timeLabel = hasStartTime
        ? format(startDate, 'HH:mm', { locale: fr })
        : format(endDate, 'HH:mm', { locale: fr });
      return `${dayLabel} à ${timeLabel}`;
    }
    return formatDisplayDate(startDate);
  }

  const startLabel = formatDisplayDate(startDate);
  const endLabel = formatDisplayDate(endDate);
  return `Du ${startLabel} au ${endLabel}`;
}

function formatOptionalDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const date = parseIsoDate(value);
  if (!date) {
    return null;
  }
  return formatDisplayDate(date);
}

function hexToRgb(hex?: string): [number, number, number] | null {
  if (!hex) {
    return null;
  }
  const sanitized = hex.trim().replace(/^#/, '');
  if (!sanitized) {
    return null;
  }
  const normalized = sanitized.length === 3
    ? sanitized
        .split('')
        .map((char) => char + char)
        .join('')
    : sanitized;
  if (normalized.length !== 6) {
    return null;
  }
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) {
    return null;
  }
  const red = (value >> 16) & 0xff;
  const green = (value >> 8) & 0xff;
  const blue = value & 0xff;
  return [red, green, blue];
}

function rgbaString(rgb: [number, number, number], alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function getReadableTextColor(hex?: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return 'var(--card-foreground)';
  }
  const [r, g, b] = rgb;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 160 ? '#0f172a' : '#f8fafc';
}

function getCardStyles(color?: string): CSSProperties {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return {};
  }
  const borderColor = rgbaString(rgb, 0.5);
  const backgroundColor = rgbaString(rgb, 0.08);
  return {
    borderColor,
    backgroundColor,
  } satisfies CSSProperties;
}

function sortByStartDateAsc(a: EnrichedCalendarEvent, b: EnrichedCalendarEvent): number {
  const aDate = parseIsoDate(a.startDate)?.getTime() ?? 0;
  const bDate = parseIsoDate(b.startDate)?.getTime() ?? 0;
  return aDate - bDate;
}

function sortByStartDateDesc(a: EnrichedCalendarEvent, b: EnrichedCalendarEvent): number {
  return sortByStartDateAsc(b, a);
}

function groupEventsByMonth(events: EnrichedCalendarEvent[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();

  for (const event of events) {
    const startDate = parseIsoDate(event.startDate) ?? new Date(event.startDate);
    const monthKey = format(startDate, 'yyyy-MM');
    const monthLabel = format(startDate, 'LLLL yyyy', { locale: fr });
    if (!groups.has(monthKey)) {
      groups.set(monthKey, { key: monthKey, label: monthLabel, events: [] });
    }
    groups.get(monthKey)!.events.push(event);
  }

  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export function Calendar() {
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const {
    data: colors,
    isLoading: colorsLoading,
    isError: colorsError,
    error: colorsErrorValue,
  } = useCalendarEventColors();
  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrorValue,
    refetch: refetchEvents,
    isFetching: eventsFetching,
  } = useCalendarEvents();

  const colorMap = useMemo(() => {
    const map = new Map<string, { hex: string; label: string }>();
    colors?.forEach((color) => {
      const reasonKey = normalizeReasonKey(color.reason);
      if (reasonKey) {
        map.set(reasonKey, {
          hex: color.color,
          label: color.name || color.reason,
        });
      }
    });
    return map;
  }, [colors]);

  const enrichedEvents: EnrichedCalendarEvent[] = useMemo(() => {
    if (!events) {
      return [];
    }
    return events.map((event) => {
      const reasonKey = normalizeReasonKey(event.reason);
      const colorInfo = reasonKey ? colorMap.get(reasonKey) : undefined;
      return {
        ...event,
        reasonKey,
        colorHex: colorInfo?.hex,
        colorLabel: colorInfo?.label ?? event.reason ?? 'Sans code couleur',
      };
    });
  }, [colorMap, events]);

  const reasonOptions = useMemo(() => {
    const options = new Map<string, string>();
    enrichedEvents.forEach((event) => {
      if (event.reasonKey) {
        options.set(event.reasonKey, event.colorLabel ?? event.reasonKey);
      }
    });
    const sorted = Array.from(options.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], 'fr', { sensitivity: 'base' }),
    );
    const list = sorted.map(([value, label]) => ({ value, label }));
    if (enrichedEvents.some((event) => !event.reasonKey)) {
      list.push({ value: 'none', label: 'Sans code couleur' });
    }
    return list;
  }, [enrichedEvents]);

  const filteredEvents = useMemo(() => {
    if (selectedReason === 'all') {
      return enrichedEvents;
    }
    if (selectedReason === 'none') {
      return enrichedEvents.filter((event) => !event.reasonKey);
    }
    return enrichedEvents.filter((event) => event.reasonKey === selectedReason);
  }, [enrichedEvents, selectedReason]);

  const { upcomingEvents, archivedEvents } = useMemo(() => {
    const groups = new Map<string, EnrichedCalendarEvent[]>();
    for (const event of filteredEvents) {
      const category = event.category || 'Actuel ou futur';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(event);
    }

    groups.forEach((categoryEvents, category) => {
      const sorter = category.toLowerCase().includes('ancien')
        ? sortByStartDateDesc
        : sortByStartDateAsc;
      categoryEvents.sort(sorter);
    });

    return {
      upcomingEvents: groups.get('Actuel ou futur') ?? [],
      archivedEvents: groups.get('Ancien (2 ans)') ?? [],
    };
  }, [filteredEvents]);

  const upcomingGroups = useMemo(() => groupEventsByMonth(upcomingEvents), [upcomingEvents]);
  const archivedGroups = useMemo(
    () => groupEventsByMonth(archivedEvents).sort((a, b) => b.key.localeCompare(a.key)),
    [archivedEvents],
  );

  const totalEvents = enrichedEvents.length;
  const loading = colorsLoading || eventsLoading || eventsFetching;
  const hasError = colorsError || eventsError;
  const errorMessage =
    (colorsErrorValue instanceof Error ? colorsErrorValue.message : undefined) ||
    (eventsErrorValue instanceof Error ? eventsErrorValue.message : undefined) ||
    "Une erreur est survenue lors du chargement du calendrier.";

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Calendrier</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendrier des évènements</CardTitle>
              <CardDescription>
                Visualisez l'ensemble des rendez-vous institutionnels et commerciaux, classés par
                catégorie. Utilisez les filtres pour affiner l'affichage et retrouver rapidement une
                information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {upcomingEvents.length > 0
                      ? `${upcomingEvents.length} évènement${upcomingEvents.length > 1 ? 's' : ''} à venir`
                      : 'Aucun évènement à venir'}
                  </span>
                  <Separator orientation="vertical" className="hidden h-4 lg:block" />
                  <span className="hidden lg:inline">
                    {archivedEvents.length > 0
                      ? `${archivedEvents.length} évènement${archivedEvents.length > 1 ? 's' : ''} archivés`
                      : 'Aucun évènement archivé sur les deux dernières années'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Couleur</span>
                  <Select value={selectedReason} onValueChange={setSelectedReason}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Toutes les couleurs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les couleurs</SelectItem>
                      {reasonOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[180px] items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  <span>Chargement des données du calendrier…</span>
                </div>
              ) : hasError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
                  <p className="font-semibold">Impossible d'afficher le calendrier.</p>
                  <p className="text-sm opacity-80">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => refetchEvents()}
                    className="mt-3 inline-flex items-center rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
                  >
                    Réessayer
                  </button>
                </div>
              ) : totalEvents === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun évènement n'a été trouvé. Modifiez vos filtres ou réessayez plus tard.
                </p>
              ) : (
                <Tabs defaultValue="Actuel ou futur" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="Actuel ou futur">
                      Actuel ou futur ({upcomingEvents.length})
                    </TabsTrigger>
                    <TabsTrigger value="Ancien (2 ans)">
                      Ancien (2 ans) ({archivedEvents.length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="Actuel ou futur" className="space-y-4">
                    {upcomingGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucun évènement futur ne correspond à vos filtres.
                      </p>
                    ) : (
                      upcomingGroups.map((group) => (
                        <section key={group.key} className="space-y-3">
                          <h3 className="text-base font-semibold capitalize text-foreground">
                            {group.label}
                          </h3>
                          <div className="grid gap-4">
                            {group.events.map((event) => (
                              <Card
                                key={event.id}
                                className="border"
                                style={getCardStyles(event.colorHex)}
                              >
                                <CardHeader className="space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <CardTitle className="text-xl font-semibold leading-tight">
                                      {event.title}
                                    </CardTitle>
                                    <Badge
                                      style={{
                                        backgroundColor: event.colorHex ?? 'var(--accent)',
                                        color: getReadableTextColor(event.colorHex),
                                        borderColor: event.colorHex ?? 'transparent',
                                      }}
                                    >
                                      {event.colorLabel}
                                    </Badge>
                                  </div>
                                  {event.subtitle ? (
                                    <CardDescription className="text-sm text-muted-foreground">
                                      {event.subtitle}
                                    </CardDescription>
                                  ) : null}
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                                    <div className="flex items-start gap-2 text-muted-foreground">
                                      <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                      <span className="text-foreground">
                                        {formatDateRange(event.startDate, event.endDate)}
                                      </span>
                                    </div>
                                    {event.registrationDeadline ? (
                                      <div className="flex items-start gap-2 text-muted-foreground">
                                        <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                        <span>
                                          Inscription jusqu'au{' '}
                                          {formatOptionalDate(event.registrationDeadline)}
                                        </span>
                                      </div>
                                    ) : null}
                                    {event.location ? (
                                      <div className="flex items-start gap-2 text-muted-foreground">
                                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                        <span>{event.location}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                  {event.description ? (
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                      {event.description}
                                    </p>
                                  ) : null}
                                  {event.link ? (
                                    <a
                                      href={event.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                      <LinkIcon className="h-4 w-4" aria-hidden="true" />
                                      En savoir plus
                                    </a>
                                  ) : null}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </section>
                      ))
                    )}
                  </TabsContent>
                  <TabsContent value="Ancien (2 ans)" className="space-y-4">
                    {archivedGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucun évènement passé ne correspond à vos filtres sur les deux dernières années.
                      </p>
                    ) : (
                      archivedGroups.map((group) => (
                        <section key={group.key} className="space-y-3">
                          <h3 className="text-base font-semibold capitalize text-foreground">
                            {group.label}
                          </h3>
                          <div className="grid gap-4">
                            {group.events.map((event) => (
                              <Card
                                key={event.id}
                                className="border"
                                style={getCardStyles(event.colorHex)}
                              >
                                <CardHeader className="space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <CardTitle className="text-xl font-semibold leading-tight">
                                      {event.title}
                                    </CardTitle>
                                    <Badge
                                      style={{
                                        backgroundColor: event.colorHex ?? 'var(--accent)',
                                        color: getReadableTextColor(event.colorHex),
                                        borderColor: event.colorHex ?? 'transparent',
                                      }}
                                    >
                                      {event.colorLabel}
                                    </Badge>
                                  </div>
                                  {event.subtitle ? (
                                    <CardDescription className="text-sm text-muted-foreground">
                                      {event.subtitle}
                                    </CardDescription>
                                  ) : null}
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                                    <div className="flex items-start gap-2 text-muted-foreground">
                                      <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                      <span className="text-foreground">
                                        {formatDateRange(event.startDate, event.endDate)}
                                      </span>
                                    </div>
                                    {event.registrationDeadline ? (
                                      <div className="flex items-start gap-2 text-muted-foreground">
                                        <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                        <span>
                                          Inscription jusqu'au{' '}
                                          {formatOptionalDate(event.registrationDeadline)}
                                        </span>
                                      </div>
                                    ) : null}
                                    {event.location ? (
                                      <div className="flex items-start gap-2 text-muted-foreground">
                                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                        <span>{event.location}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                  {event.description ? (
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                      {event.description}
                                    </p>
                                  ) : null}
                                  {event.link ? (
                                    <a
                                      href={event.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                      <LinkIcon className="h-4 w-4" aria-hidden="true" />
                                      Consulter l'archive
                                    </a>
                                  ) : null}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </section>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="w-full space-y-6 xl:w-80">
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs clés</CardTitle>
              <CardDescription>
                Vue synthétique de l'activité sur les deux dernières années et au-delà.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total des évènements</span>
                <span className="text-base font-semibold text-foreground">{totalEvents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">À venir</span>
                <span className="text-base font-semibold text-foreground">{upcomingEvents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Archivés (2 ans)</span>
                <span className="text-base font-semibold text-foreground">{archivedEvents.length}</span>
              </div>
              <Separator />
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  Les évènements archivés restent consultables pendant deux ans. Les prochains
                  évènements sont affichés sans limite vers le futur.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Légende des couleurs</CardTitle>
              <CardDescription>
                Correspondance entre les codes du calendrier et les familles d'évènements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Mise à jour de la légende…</span>
                </div>
              ) : colorsError ? (
                <p className="text-sm text-muted-foreground">
                  Impossible de charger la légende des couleurs pour le moment.
                </p>
              ) : colors && colors.length > 0 ? (
                <div className="space-y-2">
                  {colors.map((color) => {
                    const reasonKey = normalizeReasonKey(color.reason);
                    const rgb = hexToRgb(color.color);
                    const background = rgb ? rgbaString(rgb, 0.12) : 'var(--muted)';
                    return (
                      <div
                        key={color.reason}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                        style={{
                          borderColor: rgb ? rgbaString(rgb, 0.4) : 'var(--border)',
                          backgroundColor: background,
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{color.name}</span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">
                            {reasonKey}
                          </span>
                        </div>
                        <Badge
                          style={{
                            backgroundColor: color.color,
                            color: getReadableTextColor(color.color),
                            borderColor: color.color,
                          }}
                        >
                          {color.color}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune couleur n'a été définie pour les évènements du calendrier.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default Calendar;
