import * as React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

export function EventsCalendar() {
  const [month, setMonth] = React.useState<Date>(new Date(2023, 9));

  const singleDay = [new Date(2023, 9, 31)];
  const twoDay = [new Date(2023, 9, 3), new Date(2023, 9, 4)];
  const threeDay = [new Date(2023, 9, 24), new Date(2023, 9, 25), new Date(2023, 9, 26)];

  return (
    <div className="flex flex-col md:flex-row md:space-x-6">
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
            single: singleDay,
            institution: twoDay,
            other: threeDay,
          }}
          modifiersStyles={{
            weekend: { backgroundColor: '#0369a1', color: 'white' },
            single: { backgroundColor: '#0ea5e9', color: 'white' },
            institution: { backgroundColor: '#d9f99d', color: '#365314' },
            other: { backgroundColor: '#fde047', color: '#78350f' },
          }}
        />
      </div>
      <div className="mt-4 md:mt-0 md:pl-4 border-t md:border-t-0 md:border-l">
        <p className="font-semibold">
          {format(month, 'LLLL yyyy', { locale: fr })}
        </p>
        <p className="mt-2 text-sm font-medium">Légende</p>
        <ul className="mt-2 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-sky-700" />
            Samedi/Dimanche et jours fériés
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-lime-200" />
            Institutions représentative du personnel
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-yellow-300" />
            Autre évènements
          </li>
        </ul>
      </div>
    </div>
  );
}
