import type { CalendarEventColorRecord, CalendarEventRecord } from '@/lib/calendar';

/**
 * Données mock pour l'agenda (page d'accueil + page Agenda).
 *
 * Reprend le contenu de l'agenda Glénat 2026 (préparation T1/T2 2027) :
 * remises BC, briefs éditoriaux, pitchs, réunions commerciales, RDV enseignes,
 * réunions CSE, etc. Utilisées en repli lorsque l'API calendrier ne renvoie
 * aucun évènement.
 *
 * Les catégories suivent la légende d'origine :
 *  - AUTRE  → « Autre évènements » (orange)
 *  - INST   → « Institutions représentatives du personnel » / Réunion CSE (kaki)
 *  - BRIEF  → « Brief éditorial » (jaune)
 *  - PITCH  → « Réunion PITCH » (magenta)
 *  - CO     → « Réunion commerciale » (vert)
 */

// Palette de couleurs associée à chaque "reason". Les clés `name`/`lastName`
// servent de libellé dans la légende et les tooltips.
export const mockCalendarEventColors: CalendarEventColorRecord[] = [
  { reason: 'AUTRE', name: 'Autre évènements', lastName: 'Autre évènements', color: '#ED7D31' },
  { reason: 'INST', name: 'Institutions représentatives du personnel', lastName: 'Institutions représentatives du personnel', color: '#C9BD6E' },
  { reason: 'BRIEF', name: 'Brief éditorial', lastName: 'Brief éditorial', color: '#FFE600' },
  { reason: 'PITCH', name: 'Réunion PITCH', lastName: 'Réunion PITCH', color: '#FF00FF' },
  { reason: 'CO', name: 'Réunion commerciale', lastName: 'Réunion commerciale', color: '#92D050' },
];

interface MockEvent {
  id: string;
  reason: string;
  title: string;
  startDate: string;
  endDate?: string;
}

// Évènements de l'agenda Glénat 2026 (dates ISO `yyyy-MM-dd`).
const AGENDA_2026_EVENTS: MockEvent[] = [
  // ─── Juillet 2026 (préparation T1 2027) ───────────────────
  { id: 'agenda-2026-07-01', reason: 'AUTRE', title: 'MAJ BC T1 2027 Remise Eléments Edito T1 2027', startDate: '2026-07-01' },
  { id: 'agenda-2026-07-02', reason: 'AUTRE', title: 'Création matrice', startDate: '2026-07-02' },
  { id: 'agenda-2026-07-06', reason: 'PITCH', title: 'PITCH T1 2027 MANGA', startDate: '2026-07-06' },
  { id: 'agenda-2026-07-07', reason: 'BRIEF', title: 'BRIEF EDITO T1 2027 BD', startDate: '2026-07-07' },
  { id: 'agenda-2026-07-08', reason: 'BRIEF', title: 'BRIEF EDITO T1 2027 LIVRE, JEUNESSE, HUGO', startDate: '2026-07-08' },
  { id: 'agenda-2026-07-16', reason: 'AUTRE', title: 'MARKET CO T1 2027', startDate: '2026-07-16' },
  { id: 'agenda-2026-07-24', reason: 'AUTRE', title: 'MAJ BC T1 2027 Eléments Définitifs Edito T1 2027', startDate: '2026-07-24' },
  { id: 'agenda-2026-07-26', reason: 'PITCH', title: 'PITCH T1 2027 HUGO, LIVRE, EDITIONS DU MONT BLANC', startDate: '2026-07-26' },
  { id: 'agenda-2026-07-27', reason: 'PITCH', title: 'PITCH T1 2027 BD & CAURETTE', startDate: '2026-07-27' },
  { id: 'agenda-2026-07-28', reason: 'AUTRE', title: 'RUN T1 2027', startDate: '2026-07-28' },

  // ─── Septembre 2026 (commercialisation T1 2027) ───────────
  { id: 'agenda-2026-09-01', reason: 'AUTRE', title: 'Remise Brief, Blades et VISUELS DEF', startDate: '2026-09-01' },
  { id: 'agenda-2026-09-04', reason: 'AUTRE', title: 'Dernière MAJ BC avant Commercialisation T1 2027', startDate: '2026-09-04' },
  { id: 'agenda-2026-09-07', reason: 'AUTRE', title: 'Argumentaires et Previews', startDate: '2026-09-07' },
  { id: 'agenda-2026-09-08', reason: 'AUTRE', title: 'GO MATRICES ET PPT COMMERCIALISATION T1 2027', startDate: '2026-09-08' },
  { id: 'agenda-2026-09-08-cse', reason: 'INST', title: 'Réunion CSE', startDate: '2026-09-08' },
  { id: 'agenda-2026-09-14', reason: 'AUTRE', title: 'RDV ENSEIGNES', startDate: '2026-09-14', endDate: '2026-09-18' },
  { id: 'agenda-2026-09-22', reason: 'CO', title: 'REUNION CO T1 2027', startDate: '2026-09-22', endDate: '2026-09-23' },
  { id: 'agenda-2026-09-24', reason: 'AUTRE', title: 'REUNION REPRES', startDate: '2026-09-24' },
  { id: 'agenda-2026-09-29', reason: 'AUTRE', title: 'ATTERRISSAGES T4 2026', startDate: '2026-09-29' },

  // ─── Octobre 2026 (préparation T2 2027) ───────────────────
  { id: 'agenda-2026-10-08', reason: 'AUTRE', title: 'MAJ BC T2 2027 Remise Eléments Edito T2 2027', startDate: '2026-10-08' },
  { id: 'agenda-2026-10-12', reason: 'AUTRE', title: 'Création matrice', startDate: '2026-10-12' },
  { id: 'agenda-2026-10-13', reason: 'INST', title: 'Réunion CSE', startDate: '2026-10-13' },
  { id: 'agenda-2026-10-14', reason: 'BRIEF', title: 'BRIEF EDITO T2 2027 LIVRE, JEUNESSE, HUGO', startDate: '2026-10-14' },
  { id: 'agenda-2026-10-15', reason: 'BRIEF', title: 'BRIEF EDITO T2 2027 BD PITCH T2 2027 MANGA', startDate: '2026-10-15' },
  { id: 'agenda-2026-10-20', reason: 'AUTRE', title: 'MARKET CO T2 2027', startDate: '2026-10-20' },
  { id: 'agenda-2026-10-30', reason: 'AUTRE', title: 'MAJ BC T2 2027 Eléments Définitifs Edito T2 2027', startDate: '2026-10-30' },

  // ─── Novembre 2026 (commercialisation T2 2027) ────────────
  { id: 'agenda-2026-11-04', reason: 'PITCH', title: 'PITCH T2 2027 HUGO, LIVRE, EDITIONS DU MONT BLANC', startDate: '2026-11-04' },
  { id: 'agenda-2026-11-05', reason: 'PITCH', title: 'PITCH T2 2027 BD & CAURETTE', startDate: '2026-11-05' },
  { id: 'agenda-2026-11-06', reason: 'AUTRE', title: 'RUN T2 2027', startDate: '2026-11-06' },
  { id: 'agenda-2026-11-10', reason: 'INST', title: 'Réunion CSE', startDate: '2026-11-10' },
  { id: 'agenda-2026-11-17', reason: 'AUTRE', title: 'Remise Brief, Blades et VISUELS DEF', startDate: '2026-11-17' },
  { id: 'agenda-2026-11-26', reason: 'AUTRE', title: 'Dernière MAJ BC avant Commercialisation T2 2027', startDate: '2026-11-26' },
  { id: 'agenda-2026-11-27', reason: 'AUTRE', title: 'Argumentaires et Previews', startDate: '2026-11-27' },
  { id: 'agenda-2026-11-30', reason: 'AUTRE', title: 'GO MATRICES ET PPT COMMERCIALISATION T2 2027', startDate: '2026-11-30' },

  // ─── Décembre 2026 ────────────────────────────────────────
  { id: 'agenda-2026-12-03', reason: 'AUTRE', title: 'ATTERRISSAGES T1 2027', startDate: '2026-12-03' },
  { id: 'agenda-2026-12-07', reason: 'AUTRE', title: 'RDV ENSEIGNES', startDate: '2026-12-07', endDate: '2026-12-11' },
  { id: 'agenda-2026-12-08-cse', reason: 'INST', title: 'Réunion CSE', startDate: '2026-12-08' },
  { id: 'agenda-2026-12-15', reason: 'CO', title: 'REUNION CO T2 2027', startDate: '2026-12-15', endDate: '2026-12-16' },
  { id: 'agenda-2026-12-17', reason: 'AUTRE', title: 'REPRES', startDate: '2026-12-17' },
];

/** Renvoie les évènements mock de l'agenda Glénat 2026. */
export function buildMockCalendarEvents(): CalendarEventRecord[] {
  return AGENDA_2026_EVENTS.map((event) => ({ ...event, category: 'Actuel ou futur' }));
}

export const mockCalendarEvents: CalendarEventRecord[] = buildMockCalendarEvents();
