import { useMemo, useState } from 'react';
import { addDays, addMonths, eachDayOfInterval, endOfWeek, format, isSameMonth, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCalendarEventColors, useCalendarEvents } from '@/hooks/useCalendarEvents';
import { normalizeReasonKey, getCalendarWeeks, getEventsForInterval, type CalendarView } from '@/lib/calendarUtils';
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView';
import { CalendarWeekView } from '@/components/calendar/CalendarWeekView';
import { CalendarDayView } from '@/components/calendar/CalendarDayView';

function getParisTime(): Date {
  const now = new Date();
  const parisTimeString = now.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
  return new Date(parisTimeString);
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
  const { data: events, isLoading: isLoadingEvents, error: eventsError } = useCalendarEvents();

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
    return events;
  }, [events]);

  const { weeks, calendarStart, calendarEnd } = useMemo(() => {
    if (view === 'month') {
      return getCalendarWeeks(currentMonth);
    }

    if (view === 'week') {
      const weekStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      return { weeks: [days], calendarStart: weekStart, calendarEnd: weekEnd };
    }

    const dayStart = startOfDay(currentMonth);
    return { weeks: [[dayStart]], calendarStart: dayStart, calendarEnd: dayStart };
  }, [currentMonth, view]);

  const eventsByDay = useMemo(() => getEventsForInterval(filteredEvents, colorsMap, calendarStart, calendarEnd), [filteredEvents, colorsMap, calendarStart, calendarEnd]);

  const handlePrevious = () => {
    setCurrentMonth((previous) => {
      if (view === 'month') return addMonths(previous, -1);
      if (view === 'week') return addDays(previous, -7);
      return addDays(previous, -1);
    });
  };

  const handleNext = () => {
    setCurrentMonth((previous) => {
      if (view === 'month') return addMonths(previous, 1);
      if (view === 'week') return addDays(previous, 7);
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
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
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
            {view === 'month' && <CalendarMonthView weeks={weeks} currentMonth={currentMonth} eventsByDay={eventsByDay} />}
            {view === 'week' && <CalendarWeekView weeks={weeks} eventsByDay={eventsByDay} />}
            {view === 'day' && weeks[0]?.[0] && <CalendarDayView day={weeks[0][0]} eventsByDay={eventsByDay} />}

            {!!colors?.length && (
              <div className="rounded-lg border bg-muted/10 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Légende</h3>
                <div className="flex flex-wrap gap-4">
                  {colors.map((color) => (
                    <div key={color.reason} className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full" style={{ backgroundColor: color.color }} />
                      <span className="text-sm">{color.lastName}</span>
                    </div>
                  ))}
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
