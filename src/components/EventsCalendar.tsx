import * as React from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useCalendarEvents, useCalendarEventColors } from '@/hooks/useCalendarEvents';
import { Loader2 } from 'lucide-react';

// Fonction pour parser une date ISO en format Date
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

// [PERF] js-hoist-regexp: Hoister la fonction lightenColor hors du composant pour éviter les recréations
const lightenColor = (hex: string, percent: number = 0.85): string => {
  const sanitized = hex.replace(/^#/, '');
  const num = parseInt(sanitized, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const lighten = (c: number) => Math.round(c + (255 - c) * percent);
  const newR = lighten(r);
  const newG = lighten(g);
  const newB = lighten(b);

  return `rgb(${newR}, ${newG}, ${newB})`;
};

// [PERF] js-cache-function-results: Cache pour les couleurs allégées
const lightenedColorCache = new Map<string, string>();
const getLightenedColor = (hex: string, percent: number = 0.85): string => {
  const cacheKey = `${hex}-${percent}`;
  let result = lightenedColorCache.get(cacheKey);
  if (!result) {
    result = lightenColor(hex, percent);
    lightenedColorCache.set(cacheKey, result);
  }
  return result;
};

export function EventsCalendar() {
  const today = new Date();
  const [month, setMonth] = React.useState<Date>(today);
  const daySpacing = 6; // spacing between days in pixels

  // Récupération des données du calendrier
  const { data: events, isLoading: isLoadingEvents } = useCalendarEvents();
  const { data: colors, isLoading: isLoadingColors } = useCalendarEventColors();

  const isLoading = isLoadingEvents || isLoadingColors;

  // Créer une map des couleurs par raison
  const colorsMap = React.useMemo(() => {
    const map = new Map<string, { color: string; label: string }>();
    colors?.forEach((entry) => {
      const key = entry.reason?.trim().toUpperCase();
      if (key) {
        map.set(key, { color: entry.color, label: entry.lastName });
      }
    });
    return map;
  }, [colors]);

  // Créer une map des événements par date pour les tooltips
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, Array<{ title: string; label: string; color: string }>>();

    if (!events?.length) return map;

    events.forEach((event) => {
      const startDate = parseDate(event.startDate);
      const endDate = parseDate(event.endDate) || startDate;

      if (!startDate) return;

      const reason = event.reason?.trim().toUpperCase();
      const colorInfo = reason ? colorsMap.get(reason) : undefined;

      // Créer une entrée pour chaque jour de l'événement
      let currentDate = new Date(startDate);
      const end = endDate || startDate;

      while (currentDate <= end) {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        const dayEvents = map.get(dateKey) || [];

        dayEvents.push({
          title: event.title,
          label: colorInfo?.label || event.reason || 'Événement',
          color: colorInfo?.color || '#3b82f6',
        });

        map.set(dateKey, dayEvents);
        currentDate = addDays(currentDate, 1);
      }
    });

    return map;
  }, [events, colorsMap]);

  // Organiser les événements par catégorie
  const categorizedEvents = React.useMemo(() => {
    if (!events?.length) {
      return { holidays: [], institution: [], other: [] };
    }

    const holidays: Date[] = [];
    const institutionRanges: { from: Date; to: Date }[] = [];
    const otherRanges: { from: Date; to: Date }[] = [];

    events.forEach((event) => {
      const startDate = parseDate(event.startDate);
      const endDate = parseDate(event.endDate) || startDate;

      if (!startDate) return;

      const reason = event.reason?.trim().toUpperCase();

      // Déterminer la catégorie en fonction du reason
      if (reason === 'FERME') {
        // Jours fériés - ce sont généralement des jours uniques
        holidays.push(startDate);
      } else if (reason === 'INST' || reason === 'INSTITUTION') {
        // Institutions représentatives du personnel
        institutionRanges.push({ from: startDate, to: endDate || startDate });
      } else {
        // Autres événements
        otherRanges.push({ from: startDate, to: endDate || startDate });
      }
    });

    return { holidays, institution: institutionRanges, other: otherRanges };
  }, [events]);


  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:space-x-6 pt-2">
      <div className="flex flex-col w-full lg:w-auto flex-shrink-0 lg:basis-72">
        <div className="flex items-center justify-center mb-2">
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date())}>
            Aujourd'hui
          </Button>
        </div>
        <Calendar
          month={month}
          onMonthChange={setMonth}
          locale={fr}
          mode="range"
          className="w-full"
          classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4 w-full',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-sm font-medium',
            nav: 'space-x-1 flex items-center',
            nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
            nav_button_previous: 'absolute left-1',
            nav_button_next: 'absolute right-1',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex w-full',
            head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1 text-center py-2',
            // Ajout d'un espacement horizontal entre les jours
            row: 'flex w-full mt-1 space-x-1.5',
            cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1',
            day: 'h-9 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md flex items-center justify-center',
            day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            day_today: 'bg-accent text-accent-foreground',
            day_outside: 'text-muted-foreground opacity-50',
            day_disabled: 'text-muted-foreground opacity-50',
            day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
            day_hidden: 'invisible',
          }}
          modifiers={{
            holiday: categorizedEvents.holidays,
            institution: categorizedEvents.institution.flatMap(range => {
              const dates = [];
              const current = new Date(range.from);
              while (current <= range.to) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
              }
              return dates;
            }),
            other: categorizedEvents.other.flatMap(range => {
              const dates = [];
              const current = new Date(range.from);
              while (current <= range.to) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
              }
              return dates;
            }),
          }}
          modifiersClassNames={{
            institution:
              'bg-[var(--calendar-institution-bg)] text-[var(--calendar-institution-fg)]',
            other:
              'bg-[var(--calendar-other-bg)] text-[var(--calendar-other-fg)]',
          }}
          modifiersStyles={{
            holiday: {
              backgroundColor: 'var(--calendar-holiday-bg)',
              color: 'var(--primary-foreground)',
            },
          }}
          components={{
            Day: (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { date, displayMonth, ...props }: any
            ) => {
              const { theme } = useTheme();

              // [PERF] Utiliser la fonction lightenColor hoistée et cachée
              const getColorForDay = (d: Date): { bg: string; type: string } | null => {
                const dateKey = format(d, 'yyyy-MM-dd');
                const dayEvents = eventsByDate.get(dateKey);

                if (!dayEvents || dayEvents.length === 0) return null;

                const firstEvent = dayEvents[0];
                const bg = getLightenedColor(firstEvent.color);

                return { bg, type: 'event' };
              };

              const getDayType = (d: Date) => {
                if (d.getDay() === 0 || d.getDay() === 6) return 'weekend';
                const colorInfo = getColorForDay(d);
                if (colorInfo) return 'event';
                return 'none';
              };

              const type = getDayType(date);
              const prevType = getDayType(addDays(date, -1));
              const nextType = getDayType(addDays(date, 1));
              const isOutside = date.getMonth() !== displayMonth.getMonth();

              const currentColorInfo = getColorForDay(date);
              const prevColorInfo = getColorForDay(addDays(date, -1));
              const nextColorInfo = getColorForDay(addDays(date, 1));

              let customStyle: React.CSSProperties = {
                width: '100%',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '500',
              };

              const applyRangeStyle = (
                bg: string,
                fg: string,
                prevSame: boolean,
                nextSame: boolean
              ) => {
                const extraWidth =
                  (prevSame ? daySpacing : 0) + (nextSame ? daySpacing : 0);
                customStyle = {
                  ...customStyle,
                  backgroundColor: bg,
                  color: fg,
                  width:
                    extraWidth === 0
                      ? '100%'
                      : `calc(100% + ${extraWidth}px)`,
                  marginLeft: prevSame ? `-${daySpacing}px` : '0',
                  marginRight: nextSame ? `-${daySpacing}px` : '0',
                  borderTopLeftRadius: prevSame ? '0' : '6px',
                  borderBottomLeftRadius: prevSame ? '0' : '6px',
                  borderTopRightRadius: nextSame ? '0' : '6px',
                  borderBottomRightRadius: nextSame ? '0' : '6px',
                };
              };

              if (type === 'event' && currentColorInfo) {
                // Appliquer la couleur de l'événement depuis l'API
                const prevIsSameEvent = prevType === 'event' && prevColorInfo?.bg === currentColorInfo.bg;
                const nextIsSameEvent = nextType === 'event' && nextColorInfo?.bg === currentColorInfo.bg;

                // Toujours utiliser du noir pour les événements (meilleur contraste avec les couleurs allégées)
                const textColor = '#0f172a';

                applyRangeStyle(
                  currentColorInfo.bg,
                  textColor,
                  prevIsSameEvent,
                  nextIsSameEvent
                );
              } else if (type === 'weekend') {
                applyRangeStyle(
                  theme === 'dark' ? 'var(--background)' : 'var(--secondary)',
                  'var(--muted-foreground)',
                  prevType === 'weekend',
                  nextType === 'weekend'
                );
              } else if (isOutside) {
                customStyle = {
                  ...customStyle,
                  backgroundColor: 'transparent',
                  color:
                    theme === 'dark'
                      ? 'var(--muted-foreground)'
                      : 'var(--muted)',
                  borderRadius: 0,
                  marginLeft: 0,
                  marginRight: 0,
                };
              }

              // Récupérer les événements de ce jour pour le tooltip
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayEventsList = eventsByDate.get(dateKey) || [];
              const tooltipText = dayEventsList.length > 0
                ? dayEventsList.map(e => `${e.label}: ${e.title}`).join('\n')
                : '';

              return (
                <div
                  {...props}
                  style={{ ...props.style, ...customStyle }}
                  className={`${props.className} cursor-pointer`}
                  title={tooltipText}
                >
                  {date.getDate()}
                </div>
              );
            },
          }}
        />
      </div>
      <div className="mt-4 lg:mt-0 lg:pl-4 lg:border-l flex items-start justify-start lg:w-64">
        <div className="text-left w-full">
          <p className="font-semibold text-xl capitalize">
            {format(month, 'LLLL yyyy', { locale: fr })}
          </p>
          {colors && colors.length > 0 && (
            <>
              <p className="mt-4 text-sm font-medium">Légende</p>
              <ul className="mt-2 space-y-2 text-sm">
                {colors.map((color) => (
                  <li key={color.reason} className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: color.color }}
                    />
                    <span className="text-xs">{color.lastName}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
