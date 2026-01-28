import { eachDayOfInterval, endOfMonth, endOfWeek, format, isAfter, isBefore, parseISO, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import type { CalendarEventRecord } from '@/hooks/useCalendarEvents';

export interface CalendarDisplayEvent extends CalendarEventRecord {
  startDateValue: Date | null;
  endDateValue: Date | null;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  colorLabel?: string;
}

export type CalendarView = 'month' | 'week' | 'day';

export function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = parseISO(value);
    const parisTimeString = parsed.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
    return new Date(parisTimeString);
  } catch {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    const date = new Date(timestamp);
    const parisTimeString = date.toLocaleString('en-US', { timeZone: 'Europe/Paris' });
    return new Date(parisTimeString);
  }
}

export function hexToRgb(hex?: string): [number, number, number] | null {
  if (!hex) {
    return null;
  }
  const sanitized = hex.trim().replace(/^#/, '');
  if (!sanitized) {
    return null;
  }
  const normalized = sanitized.length === 3 ? sanitized.split('').map((char) => char + char).join('') : sanitized;
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

export function lightenRgb(rgb: [number, number, number], ratio = 0.75): [number, number, number] {
  const clamp = (value: number) => Math.min(255, Math.max(0, value));
  const blend = (value: number) => clamp(Math.round(value + (255 - value) * ratio));
  return [blend(rgb[0]), blend(rgb[1]), blend(rgb[2])];
}

export function rgbToCss(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function getEventColorStyles(hex?: string) {
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

export function normalizeReasonKey(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : undefined;
}

export function getCalendarWeeks(currentMonth: Date) {
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

export function getEventsForInterval(events: CalendarEventRecord[] | undefined, colorsMap: Map<string, { color: string; label: string }>, intervalStart: Date, intervalEnd: Date): Map<string, CalendarDisplayEvent[]> {
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

export function sortEvents(events: CalendarDisplayEvent[]) {
  return [...events].sort((a, b) => {
    const dateA = a.startDateValue?.getTime() ?? parseDate(a.startDate)?.getTime() ?? 0;
    const dateB = b.startDateValue?.getTime() ?? parseDate(b.startDate)?.getTime() ?? 0;
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    return a.title.localeCompare(b.title, 'fr');
  });
}

export function getCurrentTimePosition(): number {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const DISPLAY_START_HOUR = 7;
  const DISPLAY_END_HOUR = 21;
  const TOTAL_DISPLAY_HOURS = DISPLAY_END_HOUR - DISPLAY_START_HOUR + 1;

  const currentTimeInMinutes = hours * 60 + minutes;
  const displayStartInMinutes = DISPLAY_START_HOUR * 60;
  const displayTotalMinutes = TOTAL_DISPLAY_HOURS * 60;

  return (currentTimeInMinutes - displayStartInMinutes) / displayTotalMinutes;
}

export function getEventHourSpan(event: CalendarDisplayEvent): { startHour: number; endHour: number; endMinutes: number; isAllDay: boolean } {
  const startDate = event.startDateValue;
  const endDate = event.endDateValue;

  if (startDate && (startDate.getHours() !== 0 || startDate.getMinutes() !== 0)) {
    const startHour = Math.max(7, startDate.getHours());
    const endHour = endDate ? Math.min(21, endDate.getHours()) : Math.min(21, startHour + 1);
    const endMinutes = endDate ? endDate.getMinutes() : 0;
    return { startHour, endHour, endMinutes, isAllDay: false };
  }

  return { startHour: 9, endHour: 17, endMinutes: 30, isAllDay: true };
}

export function groupOverlappingEvents(dayEvents: CalendarDisplayEvent[]): CalendarDisplayEvent[][] {
  const eventGroups: CalendarDisplayEvent[][] = [];
  dayEvents.forEach((event) => {
    const { startHour, endHour, endMinutes } = getEventHourSpan(event);
    const endTime = endHour + endMinutes / 60;

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
  return eventGroups;
}

export const WEEK_DAYS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
export const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);
