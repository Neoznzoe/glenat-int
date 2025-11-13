import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, CalendarPlus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  useCalendarEventColors,
  useCalendarEvents,
  type CalendarEventRecord,
} from '@/hooks/useCalendarEvents';

const WEEK_DAYS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
const MAX_EVENTS_PER_DAY = 3;

interface CalendarDisplayEvent extends CalendarEventRecord {
  startDateValue: Date | null;
  endDateValue: Date | null;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  colorLabel?: string;
}

type CategoryFilter = 'all' | 'Actuel ou futur' | 'Ancien (2 ans)';

function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  try {
    return parseISO(value);
  } catch {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    return new Date(timestamp);
  }
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

function lightenRgb(rgb: [number, number, number], ratio = 0.75): [number, number, number] {
  const clamp = (value: number) => Math.min(255, Math.max(0, value));
  const blend = (value: number) => clamp(Math.round(value + (255 - value) * ratio));
  return [blend(rgb[0]), blend(rgb[1]), blend(rgb[2])];
}

function rgbToCss(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function getEventColorStyles(hex?: string) {
  const defaultStyles = {
    backgroundColor: 'hsl(213 27% 95%)',
    textColor: 'hsl(222.2 47.4% 11.2%)',
    borderColor: 'hsl(213 27% 80%)',
  };

  const rgb = hexToRgb(hex);
  if (!rgb) {
    return defaultStyles;
  }

  const lightRgb = lightenRgb(rgb, 0.72);
  const backgroundColor = rgbToCss(lightRgb);
  const brightness = (lightRgb[0] * 299 + lightRgb[1] * 587 + lightRgb[2] * 114) / 1000;
  const textColor = brightness > 150 ? '#0f172a' : '#ffffff';
  const borderColor = rgbToCss(rgb);

  return { backgroundColor, textColor, borderColor };
}

function normalizeReasonKey(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : undefined;
}

function getCalendarWeeks(currentMonth: Date) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks: Date[][] = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return { weeks, calendarStart, calendarEnd };
}

function getEventsForInterval(
  events: CalendarEventRecord[] | undefined,
  colorsMap: Map<string, { color: string; label: string }>,
  intervalStart: Date,
  intervalEnd: Date,
): Map<string, CalendarDisplayEvent[]> {
  const byDay = new Map<string, CalendarDisplayEvent[]>();

  if (!events?.length) {
    return byDay;
  }

  for (const event of events) {
    const startDate = parseDate(event.startDate);
    const endDate = parseDate(event.endDate) ?? startDate;
    if (!startDate) {
      continue;
    }

    const effectiveEnd = endDate && !isBefore(endDate, startDate) ? endDate : startDate;
    const eventStart = isBefore(startDate, intervalStart) ? intervalStart : startDate;
    const eventEnd = effectiveEnd ? (isAfter(effectiveEnd, intervalEnd) ? intervalEnd : effectiveEnd) : intervalEnd;

    const normalizedReason = normalizeReasonKey(event.reason);
    const colorEntry = normalizedReason ? colorsMap.get(normalizedReason) : undefined;
    const { backgroundColor, textColor, borderColor } = getEventColorStyles(colorEntry?.color);

    const daysInInterval = eachDayOfInterval({ start: startOfDay(eventStart), end: startOfDay(eventEnd) });

    for (const day of daysInInterval) {
      if (isBefore(day, intervalStart) || isAfter(day, intervalEnd)) {
        continue;
      }
      const key = format(day, 'yyyy-MM-dd');
      const dayEvents = byDay.get(key) ?? [];
      dayEvents.push({
        ...event,
        startDateValue: startDate,
        endDateValue: effectiveEnd,
        backgroundColor,
        textColor,
        borderColor,
        colorLabel: colorEntry?.label ?? event.reason ?? undefined,
      });
      byDay.set(key, dayEvents);
    }
  }

  return byDay;
}

function sortEvents(events: CalendarDisplayEvent[]) {
  return [...events].sort((a, b) => {
    const dateA = a.startDateValue?.getTime() ?? parseDate(a.startDate)?.getTime() ?? 0;
    const dateB = b.startDateValue?.getTime() ?? parseDate(b.startDate)?.getTime() ?? 0;
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    return a.title.localeCompare(b.title, 'fr');
  });
}

const CATEGORY_OPTIONS: { label: string; value: CategoryFilter }[] = [
  { label: 'Toutes les catégories', value: 'all' },
  { label: 'Actuel ou futur', value: 'Actuel ou futur' },
  { label: 'Ancien (2 ans)', value: 'Ancien (2 ans)' },
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [category, setCategory] = useState<CategoryFilter>('all');
  const { data: colors, isLoading: isLoadingColors, error: colorsError } = useCalendarEventColors();
  const {
    data: events,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useCalendarEvents();

  const colorsMap = useMemo(() => {
    const map = new Map<string, { color: string; label: string }>();
    colors?.forEach((entry) => {
      const key = normalizeReasonKey(entry.reason);
      if (key) {
        map.set(key, { color: entry.color, label: entry.name });
      }
    });
    return map;
  }, [colors]);

  const filteredEvents = useMemo(() => {
    if (!events?.length) {
      return [];
    }
    if (category === 'all') {
      return events;
    }
    return events.filter((event) => event.category === category);
  }, [events, category]);

  const { weeks, calendarStart, calendarEnd } = useMemo(
    () => getCalendarWeeks(currentMonth),
    [currentMonth],
  );

  const eventsByDay = useMemo(
    () => getEventsForInterval(filteredEvents, colorsMap, calendarStart, calendarEnd),
    [filteredEvents, colorsMap, calendarStart, calendarEnd],
  );

  const handlePreviousMonth = () => {
    setCurrentMonth((previous) => addMonths(previous, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((previous) => addMonths(previous, 1));
  };

  const handleResetToToday = () => {
    setCurrentMonth(startOfMonth(new Date()));
  };

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: fr });
  const isLoading = isLoadingColors || isLoadingEvents;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Agenda</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">
              Visualisez les évènements prévus et retrouvez les informations importantes en un coup d&apos;œil.
            </p>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Calendrier des évènements</CardTitle>
          <CardDescription>
            Naviguez mois par mois, filtrez les catégories et accédez facilement aux détails des évènements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card/60 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={handleResetToToday} disabled={isLoading}>
                Aujourd&apos;hui
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handlePreviousMonth} disabled={isLoading}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Mois précédent</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} disabled={isLoading}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Mois suivant</span>
                </Button>
              </div>
              <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
            </div>
            <div className="flex items-center gap-3">
              <Select value={category} onValueChange={(value: CategoryFilter) => setCategory(value)} disabled={isLoading}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="gap-2" variant="default" disabled>
                <CalendarPlus className="h-4 w-4" />
                Nouvel évènement
              </Button>
            </div>
          </div>
          <Separator className="my-6" />

          {(colorsError || eventsError) && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Impossible de charger l&apos;agenda</AlertTitle>
              <AlertDescription>
                {eventsError?.message || colorsError?.message || 'Une erreur inattendue est survenue.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="overflow-hidden rounded-lg border">
              <div className="grid grid-cols-7 bg-muted/60 text-sm font-medium text-muted-foreground">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="px-4 py-3 text-left">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-muted/40">
                {weeks.map((week, weekIndex) =>
                  week.map((day) => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = sortEvents(eventsByDay.get(dayKey) ?? []);
                    const extraEvents = dayEvents.length - MAX_EVENTS_PER_DAY;

                    return (
                      <div
                        key={`${weekIndex}-${dayKey}`}
                        className={cn(
                          'min-h-[140px] bg-background p-3 text-sm transition-colors',
                          !isSameMonth(day, currentMonth) && 'bg-muted/20 text-muted-foreground',
                          isToday(day) && 'ring-1 ring-primary/50',
                        )}
                      >
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className={cn(!isSameMonth(day, currentMonth) && 'text-muted-foreground/80')}>
                            {format(day, 'd', { locale: fr })}
                          </span>
                          {isToday(day) && <Badge variant="secondary">Aujourd&apos;hui</Badge>}
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          {dayEvents.slice(0, MAX_EVENTS_PER_DAY).map((event) => {
                            const showStartTime =
                              event.startDateValue &&
                              isSameDay(day, event.startDateValue) &&
                              (event.startDateValue.getHours() !== 0 || event.startDateValue.getMinutes() !== 0);
                            const timeLabel = showStartTime
                              ? format(event.startDateValue as Date, 'HH:mm', { locale: fr })
                              : null;

                            return (
                              <div
                                key={`${dayKey}-${event.id}`}
                                className="flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 transition hover:opacity-90"
                                style={{
                                  backgroundColor: event.backgroundColor,
                                  color: event.textColor,
                                  borderColor: event.borderColor,
                                }}
                                title={event.title}
                              >
                                {timeLabel && <span className="shrink-0 text-[11px] font-semibold uppercase">{timeLabel}</span>}
                                <span className="truncate font-medium">{event.title}</span>
                              </div>
                            );
                          })}
                          {extraEvents > 0 && (
                            <div className="text-muted-foreground">+ {extraEvents} autre{extraEvents > 1 ? 's' : ''}</div>
                          )}
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>
            </div>

            {!!colors?.length && (
              <div className="rounded-lg border bg-muted/10 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Légende des couleurs
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {colors.map((color) => {
                    const styles = getEventColorStyles(color.color);
                    return (
                      <div
                        key={color.reason}
                        className="flex items-center gap-3 rounded-md border bg-background p-3"
                        style={{ borderColor: styles.borderColor }}
                      >
                        <span
                          className="h-9 w-9 rounded-full border"
                          style={{
                            backgroundColor: styles.backgroundColor,
                            borderColor: styles.borderColor,
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium leading-tight">{color.name}</p>
                          <p className="text-xs text-muted-foreground">Code : {color.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 pt-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement des évènements…
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
