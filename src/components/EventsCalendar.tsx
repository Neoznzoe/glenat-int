import * as React from 'react';
import { addDays, format, isSameDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function EventsCalendar() {
  const today = new Date();
  const [month, setMonth] = React.useState<Date>(today);
  const year = today.getFullYear();
  const currentMonth = today.getMonth();
  const daySpacing = 6; // spacing between days in pixels

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
    const singleInst = getNthWeekday(year, month, 3, 2); // third Tuesday
    events.push({ from: singleInst, to: singleInst }); // single-day event
    return events;
  });

  const otherEvents = months.flatMap(({ month, year }) => {
    const startOne = getNthWeekday(year, month, 2, 2); // second Tuesday
    const startTwo = getNthWeekday(year, month, 3, 3); // third Wednesday
    const singleOther = getNthWeekday(year, month, 1, 4); // first Thursday
    return [
      { from: startOne, to: addDays(startOne, 2) }, // Tue-Thu
      { from: startTwo, to: addDays(startTwo, 2) }, // Wed-Fri
      { from: singleOther, to: singleOther }, // single-day event
    ];
  });


  return (
    <div className="flex flex-col lg:flex-row lg:space-x-6 pt-2">
      <div className="flex flex-col flex-1">
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
            holiday: holidays,
            single: singleDay,
            institution: institutionEvents.flatMap(range => {
              const dates = [];
              const current = new Date(range.from);
              while (current <= range.to) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
              }
              return dates;
            }),
            other: otherEvents.flatMap(range => {
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
            institution: 'bg-lime-200 text-lime-800',
            other: 'bg-yellow-200 text-yellow-800',
          }}
          modifiersStyles={{
            holiday: { backgroundColor: '#0369a1', color: 'white' },
            single: { backgroundColor: '#0ea5e9', color: 'white' },
          }}
          components={{
            Day: (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { date, displayMonth, ...props }: any
            ) => {
              const { theme } = useTheme();

              const getDayType = (d: Date) => {
                if (
                  institutionEvents.some(range =>
                    isWithinInterval(d, { start: range.from, end: range.to })
                  )
                )
                  return 'institution';
                if (
                  otherEvents.some(range =>
                    isWithinInterval(d, { start: range.from, end: range.to })
                  )
                )
                  return 'other';
                if (holidays.some(h => isSameDay(h, d))) return 'holiday';
                if (d.getDay() === 0 || d.getDay() === 6) return 'weekend';
                return 'none';
              };

              const type = getDayType(date);
              const prevType = getDayType(addDays(date, -1));
              const nextType = getDayType(addDays(date, 1));
              const isOutside = date.getMonth() !== displayMonth.getMonth();

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

              if (type === 'institution') {
                applyRangeStyle(
                  '#d9f99d',
                  '#365314',
                  prevType === 'institution',
                  nextType === 'institution'
                );
              } else if (type === 'other') {
                applyRangeStyle(
                  '#fde047',
                  '#78350f',
                  prevType === 'other',
                  nextType === 'other'
                );
              } else if (type === 'holiday') {
                customStyle = {
                  ...customStyle,
                  backgroundColor: '#0369a1',
                  color: 'white',
                  borderRadius: '6px',
                };
              } else if (type === 'weekend') {
                applyRangeStyle(
                  theme === 'dark' ? '#171717' : '#e5e7eb',
                  theme === 'dark' ? '#a3a3a3' : '#9ca3af',
                  prevType === 'weekend',
                  nextType === 'weekend'
                );
              } else if (isOutside) {
                customStyle = {
                  ...customStyle,
                  backgroundColor: theme === 'dark' ? '#262626' : '#f3f4f6',
                  color: '#9ca3af',
                };
              }

              return (
                <div
                  {...props}
                  style={{ ...props.style, ...customStyle }}
                  className={`${props.className} cursor-pointer`}
                >
                  {date.getDate()}
                </div>
              );
            },
          }}
        />
      </div>
      <div className="mt-4 lg:mt-0 lg:pl-4 lg:border-l flex items-start justify-start lg:w-64 flex-shrink-0">
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
