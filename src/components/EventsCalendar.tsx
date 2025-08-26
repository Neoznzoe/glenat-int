import * as React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

export function EventsCalendar() {
  const [month, setMonth] = React.useState<Date>(new Date());
  const year = new Date().getFullYear();

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

  const singleDay = [
    new Date(year, 7, 5),
    new Date(year, 8, 2),
    new Date(year, 9, 7),
  ];
  const twoDay = [
    new Date(year, 7, 12),
    new Date(year, 7, 13),
    new Date(year, 8, 10),
    new Date(year, 8, 11),
    new Date(year, 9, 15),
    new Date(year, 9, 16),
  ];
  const threeDay = [
    new Date(year, 7, 18),
    new Date(year, 7, 19),
    new Date(year, 7, 20),
    new Date(year, 8, 22),
    new Date(year, 8, 23),
    new Date(year, 8, 24),
    new Date(year, 9, 27),
    new Date(year, 9, 28),
    new Date(year, 9, 29),
  ];

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
          modifiers={{
            weekend: { dayOfWeek: [0, 6] },
            holiday: holidays,
            single: singleDay,
            institution: twoDay,
            other: threeDay,
          }}
          modifiersStyles={{
            weekend: { backgroundColor: '#e5e7eb', color: '#9ca3af' },
            holiday: { backgroundColor: '#0369a1', color: 'white' },
            single: { backgroundColor: '#0ea5e9', color: 'white' },
            institution: { backgroundColor: '#d9f99d', color: '#365314' },
            other: { backgroundColor: '#fde047', color: '#78350f' },
          }}
        />
      </div>
      <div className="mt-4 md:mt-0 md:pl-4 md:border-l flex items-center justify-center">
        <div className="text-center">
          <p className="font-semibold">
            {format(month, 'LLLL yyyy', { locale: fr })}
          </p>
          <p className="mt-2 text-sm font-medium">Légende</p>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="flex items-center gap-2 justify-center">
              <span className="h-3 w-3 rounded-sm bg-sky-700" />
              Jours fériés
            </li>
            <li className="flex items-center gap-2 justify-center">
              <span className="h-3 w-3 rounded-sm bg-lime-200" />
              Institutions représentative du personnel
            </li>
            <li className="flex items-center gap-2 justify-center">
              <span className="h-3 w-3 rounded-sm bg-yellow-300" />
              Autres évènements
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
