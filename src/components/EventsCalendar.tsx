import * as React from 'react';
import { addDays, format, isSameDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

export function EventsCalendar() {
  const today = new Date();
  const [month, setMonth] = React.useState<Date>(today);
  const year = today.getFullYear();
  const currentMonth = today.getMonth();

  const holidays = [
    new Date(year, 0, 1),
    new Date(year, 4, 1),
    new Date(year, 4, 8),
    new Date(year, 6, 14),
    new Date(year, 7, 15),
    new Date(year, 10, 1),
    new Date(year, 10, 11),
    new Date(year, 11, 25),
  ];

  const months = Array.from({ length: 3 }, (_, i) => {
    const m = (currentMonth + i) % 12;
    const y = year + Math.floor((currentMonth + i) / 12);
    return { month: m, year: y };
  });

  const getNthWeekday = (
    y: number,
    m: number,
    n: number,
    weekday: number
  ) => {
    const date = new Date(y, m, 1);
    while (date.getDay() !== weekday) {
      date.setDate(date.getDate() + 1);
    }
    date.setDate(date.getDate() + (n - 1) * 7);
    return date;
  };

  const singleDay = months.map(({ month, year }) =>
    getNthWeekday(year, month, 1, 2)
  ); // first Tuesday

  const institutionEvents = months.flatMap(({ month, year }, idx) => {
    const events = [] as { from: Date; to: Date }[];
    if (idx === 0) {
      const start = getNthWeekday(year, month, 1, 5); // first Friday
      events.push({ from: start, to: addDays(start, 1) }); // Fri-Sat
    } else {
      const start = getNthWeekday(year, month, 2, 1); // second Monday
      events.push({ from: start, to: addDays(start, 1) }); // Mon-Tue
    }
    const extraStart = getNthWeekday(year, month, 4, 4); // fourth Thursday
    events.push({ from: extraStart, to: addDays(extraStart, 1) }); // Thu-Fri
    return events;
  });

  const otherEvents = months.flatMap(({ month, year }) => {
    const startOne = getNthWeekday(year, month, 2, 2); // second Tuesday
    const startTwo = getNthWeekday(year, month, 3, 3); // third Wednesday
    return [
      { from: startOne, to: addDays(startOne, 2) }, // Tue-Thu
      { from: startTwo, to: addDays(startTwo, 2) }, // Wed-Fri
    ];
  });

  const getMiddleDates = (from: Date, to: Date) => {
    const dates: Date[] = [];
    let current = addDays(from, 1);
    while (current < to) {
      dates.push(new Date(current));
      current = addDays(current, 1);
    }
    return dates;
  };

  const institutionStart = institutionEvents.map((e) => e.from);
  const institutionEnd = institutionEvents.map((e) => e.to);
  const institutionMiddle = institutionEvents.flatMap((e) =>
    getMiddleDates(e.from, e.to)
  );
  const otherStart = otherEvents.map((e) => e.from);
  const otherEnd = otherEvents.map((e) => e.to);
  const otherMiddle = otherEvents.flatMap((e) => getMiddleDates(e.from, e.to));

  const weekend = months.flatMap(({ month, year }) => {
    const dates: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      const day = date.getDay();
      if (day === 0 || day === 6) {
        const current = new Date(date);
        const isEventDay =
          holidays.some((d) => isSameDay(d, current)) ||
          singleDay.some((d) => isSameDay(d, current)) ||
          institutionEvents.some((r) =>
            isWithinInterval(current, { start: r.from, end: r.to })
          ) ||
          otherEvents.some((r) =>
            isWithinInterval(current, { start: r.from, end: r.to })
          );
        if (!isEventDay) {
          dates.push(current);
        }
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  });

  return (
    <div className="flex flex-col md:flex-row md:space-x-6 pt-2">
      <div className="flex flex-col">
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
          classNames={{
            row: 'flex w-full mt-2 gap-0.5',
            head_row: 'flex w-full gap-0.5',
          }}
          modifiers={{
            weekend,
            holiday: holidays,
            single: singleDay,
            institution: institutionEvents,
            institution_start: institutionStart,
            institution_middle: institutionMiddle,
            institution_end: institutionEnd,
            other: otherEvents,
            other_start: otherStart,
            other_middle: otherMiddle,
            other_end: otherEnd,
          }}
          modifiersClassNames={{
            weekend: 'bg-gray-200 text-gray-400 dark:bg-[#161716] dark:text-gray-500',
          }}
          modifiersStyles={{
            holiday: { backgroundColor: '#0369a1', color: 'white' },
            single: { backgroundColor: '#0ea5e9', color: 'white' },
            institution: {
              backgroundColor: '#d9f99d',
              color: '#365314',
            },
            institution_start: {
              backgroundColor: '#d9f99d',
              color: '#365314',
              borderTopLeftRadius: '4px',
              borderBottomLeftRadius: '4px',
              boxShadow: '2px 0 0 #d9f99d',
            },
            institution_middle: {
              backgroundColor: '#d9f99d',
              color: '#365314',
              boxShadow: '2px 0 0 #d9f99d, -2px 0 0 #d9f99d',
            },
            institution_end: {
              backgroundColor: '#d9f99d',
              color: '#365314',
              borderTopRightRadius: '4px',
              borderBottomRightRadius: '4px',
              boxShadow: '-2px 0 0 #d9f99d',
            },
            other: { backgroundColor: '#fde047', color: '#78350f' },
            other_start: {
              backgroundColor: '#fde047',
              color: '#78350f',
              borderTopLeftRadius: '4px',
              borderBottomLeftRadius: '4px',
              boxShadow: '2px 0 0 #fde047',
            },
            other_middle: {
              backgroundColor: '#fde047',
              color: '#78350f',
              boxShadow: '2px 0 0 #fde047, -2px 0 0 #fde047',
            },
            other_end: {
              backgroundColor: '#fde047',
              color: '#78350f',
              borderTopRightRadius: '4px',
              borderBottomRightRadius: '4px',
              boxShadow: '-2px 0 0 #fde047',
            },
          }}
        />
      </div>
      <div className="mt-4 md:mt-0 md:pl-4 md:border-l flex items-start justify-start">
        <div className="text-left">
          <p className="font-semibold">
            {format(month, 'LLLL yyyy', { locale: fr })}
          </p>
          <p className="mt-2 text-sm font-medium">Légende</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="pl-2 border-l-4 border-sky-700">Jours fériés</li>
            <li className="pl-2 border-l-4 border-lime-200">
              Institutions représentative du personnel
            </li>
            <li className="pl-2 border-l-4 border-yellow-300">Autres évènements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
