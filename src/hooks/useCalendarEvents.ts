import { useQuery } from '@tanstack/react-query';
import {
  CALENDAR_EVENT_COLORS_QUERY_KEY,
  CALENDAR_EVENTS_QUERY_KEY,
  fetchCalendarEventColors,
  fetchCalendarEvents,
  type CalendarEventColorRecord,
  type CalendarEventRecord,
} from '@/lib/calendar';

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export function useCalendarEventColors() {
  return useQuery<CalendarEventColorRecord[]>({
    queryKey: CALENDAR_EVENT_COLORS_QUERY_KEY,
    queryFn: fetchCalendarEventColors,
    staleTime: DEFAULT_STALE_TIME,
    retry: 1,
  });
}

export function useCalendarEvents() {
  return useQuery<CalendarEventRecord[]>({
    queryKey: CALENDAR_EVENTS_QUERY_KEY,
    queryFn: fetchCalendarEvents,
    staleTime: DEFAULT_STALE_TIME,
    retry: 1,
  });
}

export type { CalendarEventColorRecord, CalendarEventRecord } from '@/lib/calendar';
