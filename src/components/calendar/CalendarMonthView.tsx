import { format, isSameMonth, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { sortEvents, WEEK_DAYS, type CalendarDisplayEvent } from '@/lib/calendarUtils';

interface CalendarMonthViewProps {
  weeks: Date[][];
  currentMonth: Date;
  eventsByDay: Map<string, CalendarDisplayEvent[]>;
}

export function CalendarMonthView({ weeks, currentMonth, eventsByDay }: CalendarMonthViewProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-7 bg-muted/60 text-sm font-medium text-muted-foreground">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="px-4 py-3 text-left border-r border-b">{day}</div>
        ))}
      </div>
      <div className="relative">
        <div className="grid grid-cols-7 border-l border-t">
          {weeks.map((week, weekIndex) =>
            week.map((day) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayOfWeek = day.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isOutsideMonth = !isSameMonth(day, currentMonth);

              return (
                <div key={`${weekIndex}-${dayKey}`} className={cn('p-3 text-sm transition-colors border-r border-b min-h-[140px] relative', 'text-muted-foreground', (isOutsideMonth || isWeekend) && 'bg-[#F7F7F7] dark:bg-[#171716]')}>
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
        <div className="absolute inset-0 pointer-events-none">
          {weeks.map((week, weekIndex) => {
            const processedEvents = new Set<string>();
            return week.map((day, dayIndex) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayEvents = sortEvents(eventsByDay.get(dayKey) ?? []);

              return dayEvents.map((event, eventIndex) => {
                if (processedEvents.has(event.id)) return null;

                const isMultiDay = event.startDateValue && event.endDateValue && format(event.startDateValue, 'yyyy-MM-dd') !== format(event.endDateValue, 'yyyy-MM-dd');

                let colspan = 1;
                if (isMultiDay && event.startDateValue && event.endDateValue) {
                  const eventStartDay = format(event.startDateValue, 'yyyy-MM-dd');
                  if (dayKey === eventStartDay) {
                    processedEvents.add(event.id);
                    for (let i = dayIndex; i < week.length; i++) {
                      const checkDay = format(week[i], 'yyyy-MM-dd');
                      const eventEndDay = format(event.endDateValue, 'yyyy-MM-dd');
                      if (checkDay <= eventEndDay) {
                        colspan = i - dayIndex + 1;
                      }
                    }
                  } else {
                    return null;
                  }
                }

                const topOffset = 28 + eventIndex * 30;

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
                      style={{ backgroundColor: event.backgroundColor, color: event.textColor, borderLeft: `3px solid ${event.borderColor}` }}
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
  );
}
