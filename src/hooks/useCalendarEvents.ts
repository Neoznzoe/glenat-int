import { useQuery } from '@tanstack/react-query';
import { CALENDAR_EVENT_COLORS_QUERY_KEY, CALENDAR_EVENTS_QUERY_KEY, fetchCalendarEventColors, fetchCalendarEvents, type CalendarEventColorRecord, type CalendarEventRecord } from '@/lib/calendar';
import { buildMockCalendarEvents, mockCalendarEventColors } from '@/data/calendarMockData';

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export function useCalendarEventColors() {
  return useQuery<CalendarEventColorRecord[]>({
    queryKey: CALENDAR_EVENT_COLORS_QUERY_KEY,
    queryFn: async () => {
      try {
        const colors = await fetchCalendarEventColors();
        // Repli sur les couleurs mock si l'API ne renvoie rien.
        return colors.length > 0 ? colors : mockCalendarEventColors;
      } catch {
        return mockCalendarEventColors;
      }
    },
    staleTime: DEFAULT_STALE_TIME,
    retry: 1,
  });
}

export function useCalendarEvents() {
  return useQuery<CalendarEventRecord[]>({
    queryKey: CALENDAR_EVENTS_QUERY_KEY,
    queryFn: async () => {
      try {
        const events = await fetchCalendarEvents();
        // Repli sur les évènements mock si l'API ne renvoie rien.
        return events.length > 0 ? events : buildMockCalendarEvents();
      } catch {
        return buildMockCalendarEvents();
      }
    },
    staleTime: DEFAULT_STALE_TIME,
    retry: 1,
  });
}

export type { CalendarEventColorRecord, CalendarEventRecord } from '@/lib/calendar';
