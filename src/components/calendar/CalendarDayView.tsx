import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { sortEvents, getCurrentTimePosition, getEventHourSpan, groupOverlappingEvents, HOURS, type CalendarDisplayEvent } from '@/lib/calendarUtils';

interface CalendarDayViewProps {
  day: Date;
  eventsByDay: Map<string, CalendarDisplayEvent[]>;
}

export function CalendarDayView({ day, eventsByDay }: CalendarDayViewProps) {
  const dayKey = format(day, 'yyyy-MM-dd');
  const dayEvents = sortEvents(eventsByDay.get(dayKey) ?? []);
  const eventGroups = groupOverlappingEvents(dayEvents);
  const maxConcurrent = eventGroups.length;

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="border-b bg-muted/60 px-4 py-3 text-center font-semibold">
        {format(day, 'EEEE d MMMM yyyy', { locale: fr })}
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
        <div className="absolute inset-0 grid grid-cols-[80px_1fr] pointer-events-none">
          <div />
          <div className="relative pointer-events-auto px-2">
            {eventGroups.map((group, groupIndex) =>
              group.map((event) => {
                const { startHour, endHour, endMinutes } = getEventHourSpan(event);
                const DISPLAY_START_HOUR = 7;
                const DISPLAY_END_HOUR = 21;
                const TOTAL_DISPLAY_HOURS = DISPLAY_END_HOUR - DISPLAY_START_HOUR + 1;
                const topPosition = ((startHour - DISPLAY_START_HOUR) / TOTAL_DISPLAY_HOURS) * 100;
                const endTime = endHour + endMinutes / 60;
                const height = ((endTime - startHour) / TOTAL_DISPLAY_HOURS) * 100;

                const widthPercent = 100 / maxConcurrent;
                const leftPercent = groupIndex * widthPercent;

                return (
                  <div
                    key={event.id}
                    className="absolute rounded px-3 py-2 cursor-pointer hover:opacity-90 overflow-hidden"
                    style={{ top: `${topPosition}%`, height: `${height}%`, left: `${leftPercent}%`, width: `${widthPercent}%`, backgroundColor: event.backgroundColor, color: event.textColor, borderLeft: `4px solid ${event.borderColor}` }}
                    title={event.title}
                  >
                    <div className="text-sm font-semibold line-clamp-2">{event.title}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {isToday(day) && (
          <div className="absolute left-[80px] right-0 h-0.5 bg-red-500 z-20 pointer-events-none" style={{ top: `${getCurrentTimePosition() * 100}%` }}>
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
