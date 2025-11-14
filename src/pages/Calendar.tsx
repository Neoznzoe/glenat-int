import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);
function getParisTime(): Date {
  const now = new Date();
  const parisTimeString = now.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
  return new Date(parisTimeString);
}

interface CalendarDisplayEvent extends CalendarEventRecord {
  startDateValue: Date | null;
  endDateValue: Date | null;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  colorLabel?: string;
}

type CalendarView = 'month' | 'week' | 'day';

function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = parseISO(value);
    // Convertir au fuseau horaire de Paris
    const parisTimeString = parsed.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
    return new Date(parisTimeString);
  } catch {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    const date = new Date(timestamp);
    // Convertir au fuseau horaire de Paris
    const parisTimeString = date.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
    return new Date(parisTimeString);
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

    // Filtrer: ne garder que les événements qui commencent OU se terminent dans l'intervalle visible
    const startInInterval = !isBefore(startDate, intervalStart) && !isAfter(startDate, intervalEnd);
    const endInInterval = effectiveEnd && !isBefore(effectiveEnd, intervalStart) && !isAfter(effectiveEnd, intervalEnd);
    const spansInterval = isBefore(startDate, intervalStart) && isAfter(effectiveEnd, intervalEnd);

    if (!startInInterval && !endInInterval && !spansInterval) {
      continue;
    }

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

function getCurrentTimePosition(): number {
  const now = new Date(); // Utiliser l'heure locale du PC
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const DISPLAY_START_HOUR = 7;
  const DISPLAY_END_HOUR = 21;
  const TOTAL_DISPLAY_HOURS = DISPLAY_END_HOUR - DISPLAY_START_HOUR + 1;

  // Calculer la position relative aux heures affichées (7h-21h)
  const currentTimeInMinutes = hours * 60 + minutes;
  const displayStartInMinutes = DISPLAY_START_HOUR * 60;
  const displayTotalMinutes = TOTAL_DISPLAY_HOURS * 60;

  return (currentTimeInMinutes - displayStartInMinutes) / displayTotalMinutes;
}

function getEventHourSpan(event: CalendarDisplayEvent): { startHour: number; endHour: number; endMinutes: number; isAllDay: boolean } {
  const startDate = event.startDateValue;
  const endDate = event.endDateValue;

  // Si l'événement a une heure précise
  if (startDate && (startDate.getHours() !== 0 || startDate.getMinutes() !== 0)) {
    const startHour = Math.max(7, startDate.getHours()); // Minimum 7h
    const endHour = endDate ? Math.min(21, endDate.getHours()) : Math.min(21, startHour + 1); // Maximum 21h
    const endMinutes = endDate ? endDate.getMinutes() : 0;
    return { startHour, endHour, endMinutes, isAllDay: false };
  }

  // Sinon, événement sur toute la journée de travail (9h-17h30)
  return { startHour: 9, endHour: 17, endMinutes: 30, isAllDay: true };
}

const VIEW_OPTIONS: { label: string; value: CalendarView }[] = [
  { label: 'Vue mensuelle', value: 'month' },
  { label: 'Vue hebdomadaire', value: 'week' },
  { label: 'Vue journalière', value: 'day' },
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(getParisTime()));
  const [view, setView] = useState<CalendarView>('month');
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
    // Afficher tous les événements, pas de filtre par catégorie
    return events;
  }, [events]);

  const { weeks, calendarStart, calendarEnd } = useMemo(() => {
    if (view === 'month') {
      return getCalendarWeeks(currentMonth);
    }

    if (view === 'week') {
      // Vue hebdomadaire: afficher la semaine contenant currentMonth
      const weekStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      return {
        weeks: [days],
        calendarStart: weekStart,
        calendarEnd: weekEnd,
      };
    }

    // Vue journalière: afficher uniquement le jour de currentMonth
    const dayStart = startOfDay(currentMonth);
    return {
      weeks: [[dayStart]],
      calendarStart: dayStart,
      calendarEnd: dayStart,
    };
  }, [currentMonth, view]);

  const eventsByDay = useMemo(
    () => getEventsForInterval(filteredEvents, colorsMap, calendarStart, calendarEnd),
    [filteredEvents, colorsMap, calendarStart, calendarEnd],
  );

  const handlePrevious = () => {
    setCurrentMonth((previous) => {
      if (view === 'month') {
        return addMonths(previous, -1);
      }
      if (view === 'week') {
        return addDays(previous, -7);
      }
      return addDays(previous, -1);
    });
  };

  const handleNext = () => {
    setCurrentMonth((previous) => {
      if (view === 'month') {
        return addMonths(previous, 1);
      }
      if (view === 'week') {
        return addDays(previous, 7);
      }
      return addDays(previous, 1);
    });
  };

  const handleResetToToday = () => {
    if (view === 'month') {
      setCurrentMonth(startOfMonth(getParisTime()));
    } else {
      setCurrentMonth(getParisTime());
    }
  };

  const handleViewChange = (newView: CalendarView) => {
    const today = getParisTime();
    const isCurrentMonth = isSameMonth(currentMonth, today);

    // Si on change vers une vue hebdomadaire ou journalière et qu'on est dans le mois courant,
    // on utilise la date du jour. Sinon, on garde currentMonth.
    if ((newView === 'week' || newView === 'day') && view === 'month' && isCurrentMonth) {
      setCurrentMonth(today);
    }

    setView(newView);
  };

  const dateLabel = useMemo(() => {
    if (view === 'month') {
      return format(currentMonth, 'MMMM yyyy', { locale: fr });
    }
    if (view === 'week') {
      const weekStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 1 });
      return `${format(weekStart, 'd MMM', { locale: fr })} - ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`;
    }
    return format(currentMonth, 'EEEE d MMMM yyyy', { locale: fr });
  }, [currentMonth, view]);

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
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Agenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card/60 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={handleResetToToday} disabled={isLoading}>
                Aujourd&apos;hui
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handlePrevious} disabled={isLoading}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Période précédente</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNext} disabled={isLoading}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Période suivante</span>
                </Button>
              </div>
              <h2 className="text-lg font-semibold capitalize">{dateLabel}</h2>
            </div>
            <div className="flex items-center gap-3">
              <Select value={view} onValueChange={handleViewChange} disabled={isLoading}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sélectionner la vue" />
                </SelectTrigger>
                <SelectContent>
                  {VIEW_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {/* Vue mensuelle */}
            {view === 'month' && (
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-7 bg-muted/60 text-sm font-medium text-muted-foreground">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="px-4 py-3 text-left border-r border-b">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="relative">
                  {/* Grille de fond */}
                  <div className="grid grid-cols-7 border-l border-t">
                    {weeks.map((week, weekIndex) =>
                      week.map((day) => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayOfWeek = day.getDay(); // 0 = Dimanche, 6 = Samedi
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Dimanche ou Samedi
                        const isOutsideMonth = !isSameMonth(day, currentMonth);

                        return (
                          <div
                            key={`${weekIndex}-${dayKey}`}
                            className={cn(
                              'p-3 text-sm transition-colors border-r border-b min-h-[140px] relative',
                              'text-muted-foreground',
                              (isOutsideMonth || isWeekend) && 'bg-[#F7F7F7] dark:bg-[#171716]'
                            )}
                          >
                            <div className="flex items-center justify-between text-xs font-medium mb-8">
                              <span className={cn((isOutsideMonth || isWeekend) && 'text-muted-foreground/80')}>
                                {format(day, 'd', { locale: fr })}
                              </span>
                            </div>
                            {isToday(day) && (
                              <div className="absolute top-1 right-1">
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Aujourd&apos;hui</Badge>
                              </div>
                            )}
                          </div>
                        );
                      }),
                    )}
                  </div>
                  {/* Événements en position absolue */}
                  <div className="absolute inset-0 pointer-events-none">
                    {weeks.map((week, weekIndex) => {
                      const processedEvents = new Set<string>();
                      return week.map((day, dayIndex) => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayEvents = sortEvents(eventsByDay.get(dayKey) ?? []);

                        return dayEvents.map((event, eventIndex) => {
                          // Éviter de dupliquer les événements multi-jours
                          if (processedEvents.has(event.id)) return null;

                          const isMultiDay = event.startDateValue && event.endDateValue &&
                            format(event.startDateValue, 'yyyy-MM-dd') !== format(event.endDateValue, 'yyyy-MM-dd');

                          let colspan = 1;
                          if (isMultiDay && event.startDateValue && event.endDateValue) {
                            // Calculer combien de jours l'événement couvre dans cette semaine
                            const eventStartDay = format(event.startDateValue, 'yyyy-MM-dd');
                            if (dayKey === eventStartDay) {
                              processedEvents.add(event.id);
                              // Compter les jours jusqu'à la fin de la semaine ou la fin de l'événement
                              for (let i = dayIndex; i < week.length; i++) {
                                const checkDay = format(week[i], 'yyyy-MM-dd');
                                const eventEndDay = format(event.endDateValue, 'yyyy-MM-dd');
                                if (checkDay <= eventEndDay) {
                                  colspan = i - dayIndex + 1;
                                }
                              }
                            } else {
                              return null; // Ne pas afficher si ce n'est pas le jour de début
                            }
                          }

                          const topOffset = 28 + eventIndex * 30; // 28px pour l'en-tête + 30px par événement

                          return (
                            <div
                              key={`${dayKey}-${event.id}`}
                              className="absolute pointer-events-auto cursor-pointer hover:opacity-90 transition-opacity"
                              style={{
                                left: `${(dayIndex / 7) * 100}%`,
                                width: `${(colspan / 7) * 100}%`,
                                top: `${weekIndex * 140 + topOffset}px`,
                                minHeight: '28px',
                              }}
                            >
                              <div
                                className="mx-1 h-full rounded-sm px-3 py-1.5 flex items-center text-xs font-medium line-clamp-2"
                                style={{
                                  backgroundColor: event.backgroundColor,
                                  color: event.textColor,
                                  borderLeft: `3px solid ${event.borderColor}`,
                                }}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            </div>
                          );
                        });
                      });
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Vue hebdomadaire */}
            {view === 'week' && (
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                  <div className="border-r border-b bg-muted/60" />
                  {weeks[0]?.map((day) => {
                    const dayOfWeek = day.getDay(); // 0 = Dimanche, 6 = Samedi
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    return (
                      <div
                        key={format(day, 'yyyy-MM-dd')}
                        className={cn(
                          "border-r border-b px-2 py-3 text-center text-sm font-medium",
                          isWeekend && 'bg-[#F7F7F7] dark:bg-[#171716]'
                        )}
                      >
                        <div>{format(day, 'EEE', { locale: fr })}</div>
                        <div className={cn("text-lg", isToday(day) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto")}>
                          {format(day, 'd')}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="relative" style={{ height: '600px' }}>
                  <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                    {/* Lignes horaires */}
                    {HOURS.map((hour) => (
                      <div key={hour} className="contents">
                        <div className="border-r border-b px-2 py-1 text-xs text-muted-foreground text-right sticky left-0 bg-background">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        {weeks[0]?.map((day) => {
                          const dayOfWeek = day.getDay(); // 0 = Dimanche, 6 = Samedi
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                          return (
                            <div
                              key={`${format(day, 'yyyy-MM-dd')}-${hour}`}
                              className={cn(
                                "border-r border-b",
                                isWeekend && 'bg-[#F7F7F7] dark:bg-[#171716]'
                              )}
                              style={{
                                height: '40px',
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  {/* Événements positionnés en absolu */}
                  <div className="absolute inset-0 grid grid-cols-[60px_repeat(7,1fr)] pointer-events-none">
                    <div />
                    {weeks[0]?.map((day) => {
                      const dayKey = format(day, 'yyyy-MM-dd');
                      const dayEvents = sortEvents(eventsByDay.get(dayKey) ?? []);

                      // Grouper les événements par tranche horaire qui se chevauchent
                      const eventGroups: CalendarDisplayEvent[][] = [];
                      dayEvents.forEach((event) => {
                        const { startHour, endHour, endMinutes } = getEventHourSpan(event);
                        const endTime = endHour + endMinutes / 60;

                        // Trouver un groupe où cet événement ne chevauche aucun autre
                        let placed = false;
                        for (const group of eventGroups) {
                          const hasOverlap = group.some((existingEvent) => {
                            const existing = getEventHourSpan(existingEvent);
                            const existingEnd = existing.endHour + existing.endMinutes / 60;
                            return !(endTime <= existing.startHour || startHour >= existingEnd);
                          });
                          if (!hasOverlap) {
                            group.push(event);
                            placed = true;
                            break;
                          }
                        }
                        if (!placed) {
                          eventGroups.push([event]);
                        }
                      });

                      const maxConcurrent = eventGroups.length;

                      return (
                        <div key={dayKey} className="relative pointer-events-auto">
                          {eventGroups.map((group, groupIndex) =>
                            group.map((event) => {
                              const { startHour, endHour, endMinutes } = getEventHourSpan(event);
                              const DISPLAY_START_HOUR = 7;
                              const DISPLAY_END_HOUR = 21;
                              const TOTAL_DISPLAY_HOURS = DISPLAY_END_HOUR - DISPLAY_START_HOUR + 1;
                              const topPosition = ((startHour - DISPLAY_START_HOUR) / TOTAL_DISPLAY_HOURS) * 100;
                              const endTime = endHour + endMinutes / 60;
                              const height = ((endTime - startHour) / TOTAL_DISPLAY_HOURS) * 100;

                              // Vérifier si l'événement est multi-jours
                              const isMultiDay = event.startDateValue && event.endDateValue &&
                                format(event.startDateValue, 'yyyy-MM-dd') !== format(event.endDateValue, 'yyyy-MM-dd');
                              const isFirstDay = isMultiDay && event.startDateValue && format(day, 'yyyy-MM-dd') === format(event.startDateValue, 'yyyy-MM-dd');
                              const isLastDay = isMultiDay && event.endDateValue && format(day, 'yyyy-MM-dd') === format(event.endDateValue, 'yyyy-MM-dd');
                              const isMiddleDay = isMultiDay && !isFirstDay && !isLastDay;

                              const widthPercent = 100 / maxConcurrent;
                              const leftPercent = (groupIndex * widthPercent);

                              return (
                                <div
                                  key={event.id}
                                  className={cn(
                                    "absolute px-1 py-1 cursor-pointer hover:opacity-90 overflow-hidden",
                                    !isMultiDay && "rounded",
                                    isFirstDay && "rounded-l",
                                    isLastDay && "rounded-r",
                                    isMiddleDay && "rounded-none"
                                  )}
                                  style={{
                                    top: `${topPosition}%`,
                                    height: `${height}%`,
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                    backgroundColor: event.backgroundColor,
                                    color: event.textColor,
                                    borderLeft: `3px solid ${event.borderColor}`,
                                  }}
                                  title={`${event.title}${isMultiDay ? ' (événement multi-jours)' : ''}`}
                                >
                                  <div className="text-xs font-semibold line-clamp-2">
                                    {event.title}
                                    {isMultiDay && isFirstDay && ' →'}
                                    {isMultiDay && isMiddleDay && ' ↔'}
                                    {isMultiDay && isLastDay && ' ←'}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Barre d'heure actuelle */}
                  {weeks[0]?.some(day => isToday(day)) && (
                    <div
                      className="absolute left-[60px] right-0 h-0.5 bg-red-500 z-20 pointer-events-none"
                      style={{ top: `${getCurrentTimePosition() * 100}%` }}
                    >
                      <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vue journalière */}
            {view === 'day' && weeks[0]?.[0] && (
              <div className="overflow-hidden rounded-lg border">
                <div className="border-b bg-muted/60 px-4 py-3 text-center font-semibold">
                  {format(weeks[0][0], 'EEEE d MMMM yyyy', { locale: fr })}
                </div>
                <div className="relative" style={{ height: '600px' }}>
                  <div className="grid grid-cols-[80px_1fr]">
                    {HOURS.map((hour) => (
                      <div key={hour} className="contents">
                        <div className="border-r border-b px-3 py-2 text-sm text-muted-foreground text-right sticky left-0 bg-background">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="border-r border-b bg-background" style={{ height: '40px' }} />
                      </div>
                    ))}
                  </div>
                  {/* Événements positionnés en absolu */}
                  <div className="absolute inset-0 grid grid-cols-[80px_1fr] pointer-events-none">
                    <div />
                    <div className="relative pointer-events-auto px-2">
                      {(() => {
                        const day = weeks[0][0];
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayEvents = sortEvents(eventsByDay.get(dayKey) ?? []);

                        // Grouper les événements par tranche horaire qui se chevauchent
                        const eventGroups: CalendarDisplayEvent[][] = [];
                        dayEvents.forEach((event) => {
                          const { startHour, endHour, endMinutes } = getEventHourSpan(event);
                          const endTime = endHour + endMinutes / 60;

                          // Trouver un groupe où cet événement ne chevauche aucun autre
                          let placed = false;
                          for (const group of eventGroups) {
                            const hasOverlap = group.some((existingEvent) => {
                              const existing = getEventHourSpan(existingEvent);
                              const existingEnd = existing.endHour + existing.endMinutes / 60;
                              return !(endTime <= existing.startHour || startHour >= existingEnd);
                            });
                            if (!hasOverlap) {
                              group.push(event);
                              placed = true;
                              break;
                            }
                          }
                          if (!placed) {
                            eventGroups.push([event]);
                          }
                        });

                        const maxConcurrent = eventGroups.length;

                        return eventGroups.map((group, groupIndex) =>
                          group.map((event) => {
                            const { startHour, endHour, endMinutes } = getEventHourSpan(event);
                            const DISPLAY_START_HOUR = 7;
                            const DISPLAY_END_HOUR = 21;
                            const TOTAL_DISPLAY_HOURS = DISPLAY_END_HOUR - DISPLAY_START_HOUR + 1;
                            const topPosition = ((startHour - DISPLAY_START_HOUR) / TOTAL_DISPLAY_HOURS) * 100;
                            const endTime = endHour + endMinutes / 60;
                            const height = ((endTime - startHour) / TOTAL_DISPLAY_HOURS) * 100;

                            const widthPercent = 100 / maxConcurrent;
                            const leftPercent = (groupIndex * widthPercent);

                            return (
                              <div
                                key={event.id}
                                className="absolute rounded px-3 py-2 cursor-pointer hover:opacity-90 overflow-hidden"
                                style={{
                                  top: `${topPosition}%`,
                                  height: `${height}%`,
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                  backgroundColor: event.backgroundColor,
                                  color: event.textColor,
                                  borderLeft: `4px solid ${event.borderColor}`,
                                }}
                                title={event.title}
                              >
                                <div className="text-sm font-semibold line-clamp-2">{event.title}</div>
                              </div>
                            );
                          })
                        );
                      })()}
                    </div>
                  </div>
                  {/* Barre d'heure actuelle */}
                  {isToday(weeks[0][0]) && (
                    <div
                      className="absolute left-[80px] right-0 h-0.5 bg-red-500 z-20 pointer-events-none"
                      style={{ top: `${getCurrentTimePosition() * 100}%` }}
                    >
                      <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {!!colors?.length && (
              <div className="rounded-lg border bg-muted/10 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Légende
                </h3>
                <div className="flex flex-wrap gap-4">
                  {colors.map((color) => {
                    return (
                      <div
                        key={color.reason}
                        className="flex items-center gap-2"
                      >
                        <span
                          className="h-5 w-5 rounded-full"
                          style={{
                            backgroundColor: color.color,
                          }}
                        />
                        <span className="text-sm">{color.lastName}</span>
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
