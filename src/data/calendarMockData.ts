import type { CalendarEventColorRecord, CalendarEventRecord } from '@/lib/calendar';

/**
 * Données mock pour l'agenda de la page d'accueil.
 *
 * Utilisées en repli (fallback) lorsque l'API calendrier ne renvoie aucun
 * évènement, afin de visualiser tous les cas d'affichage : évènements sur un
 * seul jour, plages multi-jours, évènements qui se superposent (jusqu'à un
 * triple chevauchement le 25), jour férié et instance représentative (CSE).
 *
 * Les dates sont générées relativement au mois courant pour rester visibles.
 */

// Palette de couleurs associée à chaque "reason". La clé `lastName` sert de
// libellé dans la légende et les tooltips (cf. EventsCalendar).
export const mockCalendarEventColors: CalendarEventColorRecord[] = [
  { reason: 'CONGES', name: 'Congés', lastName: 'Congés', color: '#ef4444' },
  { reason: 'FORMATION', name: 'Formation', lastName: 'Formation', color: '#3b82f6' },
  { reason: 'REUNION', name: 'Réunion', lastName: 'Réunion', color: '#f59e0b' },
  { reason: 'DEPLACEMENT', name: 'Déplacement', lastName: 'Déplacement', color: '#8b5cf6' },
  { reason: 'TELETRAVAIL', name: 'Télétravail', lastName: 'Télétravail', color: '#06b6d4' },
  { reason: 'EVENT', name: 'Évènement', lastName: 'Évènement', color: '#ec4899' },
  { reason: 'INST', name: 'Instance (CSE)', lastName: 'Instance (CSE)', color: '#10b981' },
  { reason: 'FERME', name: 'Jour férié', lastName: 'Jour férié', color: '#6b7280' },
];

/** Renvoie la chaîne `yyyy-MM-dd` pour un jour donné du mois de `reference`. */
function dayOfCurrentMonth(reference: Date, day: number): string {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  // Borne le jour au nombre de jours réels du mois (évite de déborder).
  const lastDay = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, lastDay);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${year}-${pad(month + 1)}-${pad(safeDay)}`;
}

/**
 * Génère un jeu d'évènements mock pour le mois courant, riche en cas variés
 * (chevauchements, plages, jour unique, jour férié, instance).
 */
export function buildMockCalendarEvents(reference: Date = new Date()): CalendarEventRecord[] {
  const d = (day: number) => dayOfCurrentMonth(reference, day);

  const events: Array<Omit<CalendarEventRecord, 'category'>> = [
    // Évènement isolé en début de mois
    { id: 'mock-1', reason: 'EVENT', title: 'Anniversaire de la société', startDate: d(1) },

    // Plage de congés qui chevauche une formation (5 → 7)
    { id: 'mock-2', reason: 'CONGES', title: 'Marie Dupont — Congés', startDate: d(3), endDate: d(7) },
    { id: 'mock-3', reason: 'FORMATION', title: 'Jean Martin — Formation sécurité', startDate: d(5), endDate: d(6) },

    // Réunion sur un jour qui chevauche le début d'un déplacement (10)
    { id: 'mock-4', reason: 'REUNION', title: 'Comité de direction', startDate: d(10) },
    { id: 'mock-5', reason: 'DEPLACEMENT', title: 'Paul Bernard — Déplacement Paris', startDate: d(10), endDate: d(12) },

    // Jour férié isolé
    { id: 'mock-6', reason: 'FERME', title: 'Jour férié', startDate: d(15) },

    // Instance CSE qui chevauche un salon (18 → 19)
    { id: 'mock-7', reason: 'INST', title: 'Réunion CSE', startDate: d(18), endDate: d(19) },
    { id: 'mock-8', reason: 'EVENT', title: 'Salon du livre', startDate: d(18), endDate: d(20) },

    // Triple chevauchement le 25 : congés + télétravail + réunion
    { id: 'mock-9', reason: 'CONGES', title: 'Sophie Leroy — Congés', startDate: d(22), endDate: d(26) },
    { id: 'mock-10', reason: 'TELETRAVAIL', title: 'Équipe Dev — Télétravail', startDate: d(25) },
    { id: 'mock-11', reason: 'REUNION', title: 'Point hebdomadaire', startDate: d(25) },

    // Plage de déplacement en fin de mois
    { id: 'mock-12', reason: 'DEPLACEMENT', title: 'Lucie Petit — Déplacement Lyon', startDate: d(28), endDate: d(30) },
  ];

  return events.map((event) => ({ ...event, category: 'Actuel ou futur' }));
}

export const mockCalendarEvents: CalendarEventRecord[] = buildMockCalendarEvents();
