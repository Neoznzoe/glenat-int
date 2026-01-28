import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { sortEvents, getCurrentTimePosition, getEventHourSpan, groupOverlappingEvents, HOURS, type CalendarDisplayEvent } from '@/lib/calendarUtils';

interface CalendarWeekViewProps {
  weeks: Date[][];
  eventsByDay: Map<string, CalendarDisplayEvent[]>;
}

export function CalendarWeekView({ weeks, eventsByDay }: CalendarWeekViewProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
        <div className="border-r border-b bg-muted/60" />
        {weeks[0]?.map((day) => {
          const dayOfWeek = day.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          return (
            <div key={format(day, 'yyyy-MM-dd')} className={cn("border-r border-b px-2 py-3 text-center text-sm font-medium", isWeekend && 'bg-[#F7F7F7] dark:bg-[#171716]')}>
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
          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              <div className="border-r border-b px-2 py-1 text-xs text-muted-foreground text-right sticky left-0 bg-background">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weeks[0]?.map((day) => {
                const dayOfWeek = day.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                return (
                  <div key={`${format(day, 'yyyy-MM-dd')}-${hour}`} className={cn("border-r border-b", isWeekend && 'bg-[#F7F7F7] dark:bg-[#171716]')} style={{ height: '40px' }} />
                );
              })}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 grid grid-cols-[60px_repeat(7,1fr)] pointer-events-none">
          <div />
          {weeks[0]?.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEvents = sortEvents(eventsByDay.get(dayKey) ?? []);
            const eventGroups = groupOverlappingEvents(dayEvents);
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

                    const isMultiDay = event.startDateValue && event.endDateValue && format(event.startDateValue, 'yyyy-MM-dd') !== format(event.endDateValue, 'yyyy-MM-dd');
                    const isFirstDay = isMultiDay && event.startDateValue && format(day, 'yyyy-MM-dd') === format(event.startDateValue, 'yyyy-MM-dd');
                    const isLastDay = isMultiDay && event.endDateValue && format(day, 'yyyy-MM-dd') === format(event.endDateValue, 'yyyy-MM-dd');
                    const isMiddleDay = isMultiDay && !isFirstDay && !isLastDay;

                    const widthPercent = 100 / maxConcurrent;
                    const leftPercent = groupIndex * widthPercent;

                    return (
                      <div
                        key={event.id}
                        className={cn("absolute px-1 py-1 cursor-pointer hover:opacity-90 overflow-hidden", !isMultiDay && "rounded", isFirstDay && "rounded-l", isLastDay && "rounded-r", isMiddleDay && "rounded-none")}
                        style={{ top: `${topPosition}%`, height: `${height}%`, left: `${leftPercent}%`, width: `${widthPercent}%`, backgroundColor: event.backgroundColor, color: event.textColor, borderLeft: `3px solid ${event.borderColor}` }}
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
        {weeks[0]?.some(day => isToday(day)) && (
          <div className="absolute left-[60px] right-0 h-0.5 bg-red-500 z-20 pointer-events-none" style={{ top: `${getCurrentTimePosition() * 100}%` }}>
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
