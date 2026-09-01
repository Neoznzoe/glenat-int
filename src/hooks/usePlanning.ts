import { useQuery } from '@tanstack/react-query';
import {
  fetchPlanningLeaves,
  fetchLeaveReasons,
  fetchPlanningEmployees,
  fetchPlanningFilters,
  PLANNING_LEAVES_QUERY_KEY,
  PLANNING_REASONS_QUERY_KEY,
  PLANNING_EMPLOYEES_QUERY_KEY,
  PLANNING_FILTERS_QUERY_KEY,
  type PlanningLeave,
  type LeaveReason,
  type PlanningEmployee,
  type PlanningFilters,
  type PlanningFilterType,
} from '@/lib/planningApi';

// Passer à false pour utiliser les vraies données de l'API
export const USE_MOCK = true;

// ─── Effectif mock (d'après l'agenda des absences Glénat) ───
const COMPANY = 'Editions Glénat';
const DEPT_FINANCE = 'Direction Financière, Administrative et Juridique';
const DEPT_COMMERCIAL = 'Direction Commerciale & Marketing';
const DEPT_COMMERCIAL_ADJ = 'Direction Commerciale Adjointe';
const DEPT_PRODUCTION = 'Direction de la production / Achats';

const MOCK_EMPLOYEES: PlanningEmployee[] = [
  // Direction Financière, Administrative et Juridique
  { id: 1001, firstName: 'Victor', lastName: 'Besson', department: DEPT_FINANCE, company: COMPANY },
  { id: 1002, firstName: 'Damien', lastName: 'Bonis', department: DEPT_FINANCE, company: COMPANY },
  { id: 1003, firstName: 'Stéphane', lastName: 'Chermette', department: DEPT_FINANCE, company: COMPANY },
  { id: 1004, firstName: 'Valentin', lastName: 'Cogan', department: DEPT_FINANCE, company: COMPANY },
  { id: 1005, firstName: 'Nicolas', lastName: 'Merceur', department: DEPT_FINANCE, company: COMPANY },
  { id: 1006, firstName: 'Matthieu', lastName: 'Nicolas', department: DEPT_FINANCE, company: COMPANY },
  { id: 1007, firstName: 'Nino', lastName: 'Perna', department: DEPT_FINANCE, company: COMPANY },
  { id: 1008, firstName: 'Deyana', lastName: 'Baeva', department: DEPT_FINANCE, company: COMPANY },
  // Direction Commerciale & Marketing
  { id: 1009, firstName: 'Louis', lastName: 'Basseres', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1010, firstName: 'Yanis', lastName: 'Berrouka', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1011, firstName: 'Mathis', lastName: 'Besa', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1012, firstName: 'Estelle', lastName: 'Edmond', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1013, firstName: 'Christophe', lastName: 'Hardy', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1014, firstName: 'Celia', lastName: 'Madeira', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1015, firstName: 'Grégory', lastName: 'Manson', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1016, firstName: 'Sebastian', lastName: 'Olivera Monroy', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1017, firstName: 'Auxane', lastName: 'Pecheux', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1018, firstName: 'Pauline', lastName: 'Raveau', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1019, firstName: 'Lucie', lastName: 'Vaucois', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1020, firstName: 'Camille', lastName: 'Brunet', department: DEPT_COMMERCIAL, company: COMPANY },
  { id: 1021, firstName: 'Laurie', lastName: 'Davoigneau', department: DEPT_COMMERCIAL, company: COMPANY },
  // Direction Commerciale Adjointe
  { id: 1022, firstName: 'Frédéric', lastName: 'Adler', department: DEPT_COMMERCIAL_ADJ, company: COMPANY },
  { id: 1023, firstName: 'Cindy', lastName: 'Prevot', department: DEPT_COMMERCIAL_ADJ, company: COMPANY },
  // Direction de la production / Achats
  { id: 1024, firstName: 'Khadijah', lastName: 'Bougrine', department: DEPT_PRODUCTION, company: COMPANY },
  { id: 1025, firstName: 'Kevin', lastName: 'Delaunois', department: DEPT_PRODUCTION, company: COMPANY },
  { id: 1026, firstName: 'Soléa', lastName: 'Lavier', department: DEPT_PRODUCTION, company: COMPANY },
  { id: 1027, firstName: 'Amandine', lastName: 'Perrin', department: DEPT_PRODUCTION, company: COMPANY },
  { id: 1028, firstName: 'Nicolas', lastName: 'Rouher', department: DEPT_PRODUCTION, company: COMPANY },
  { id: 1029, firstName: 'Caroline', lastName: 'Dubois de Cambourg', department: DEPT_PRODUCTION, company: COMPANY },
  { id: 1030, firstName: 'Isabelle', lastName: 'Folliet', department: DEPT_PRODUCTION, company: COMPANY },
];

// ─── Générateurs de congés / absences / télétravail ─────────
let mockLeaveId = 0;
const nextLeaveId = () => (mockLeaveId += 1);

function daysBetween(startISO: string, endISO: string): number {
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function makeLeave(
  employeeId: number,
  startDate: string,
  endDate: string,
  type: string,
  reason: string,
  status = 'Validé',
  startPeriod = 'AM',
  endPeriod = 'PM',
): PlanningLeave {
  return { id: nextLeaveId(), employeeId, startDate, endDate, startPeriod, endPeriod, type, reason, status, days: daysBetween(startDate, endDate) };
}

const conge = (employeeId: number, start: string, end: string, status = 'Validé', startPeriod = 'AM', endPeriod = 'PM') =>
  makeLeave(employeeId, start, end, 'Congé', 'Congés payés', status, startPeriod, endPeriod);
const absence = (employeeId: number, start: string, end: string, reason = 'Maladie') =>
  makeLeave(employeeId, start, end, 'Absence', reason);

// Télétravail récurrent sur la période juin → septembre 2026.
const TT_FROM = '2026-06-01';
const TT_TO = '2026-09-30';
function ttWeekly(employeeId: number, weekdays: number[]): PlanningLeave[] {
  const leaves: PlanningLeave[] = [];
  const cursor = new Date(`${TT_FROM}T00:00:00`);
  const end = new Date(`${TT_TO}T00:00:00`);
  while (cursor <= end) {
    if (weekdays.includes(cursor.getDay())) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      leaves.push(makeLeave(employeeId, iso, iso, 'Télétravail', 'Télétravail'));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return leaves;
}

// Congés / absences — poussés AVANT le télétravail : en cas de chevauchement,
// getCellState retient la première entrée trouvée, donc le congé prime.
const MOCK_CONGES: PlanningLeave[] = [
  // Direction Financière
  conge(1001, '2026-08-03', '2026-08-14'),
  conge(1002, '2026-07-20', '2026-07-31'),
  conge(1003, '2026-08-17', '2026-08-28'),
  conge(1004, '2026-07-06', '2026-07-10'),
  conge(1004, '2026-09-04', '2026-09-04', 'Validé', 'PM', 'PM'), // demi-journée (après-midi)
  conge(1004, '2026-09-21', '2026-09-22', 'A valider'),
  conge(1005, '2026-08-10', '2026-08-21'),
  conge(1006, '2026-07-13', '2026-07-24'),
  absence(1006, '2026-09-07', '2026-09-08', 'Maladie'),
  conge(1007, '2026-08-24', '2026-09-04'),
  conge(1007, '2026-06-30', '2026-06-30', 'Validé', 'AM', 'AM'), // demi-journée (matin)
  absence(1008, '2026-06-01', '2026-09-30', 'Congé maternité'), // absence longue durée
  // Direction Commerciale & Marketing
  conge(1009, '2026-07-27', '2026-08-07'),
  conge(1010, '2026-08-17', '2026-08-28'),
  conge(1011, '2026-07-06', '2026-07-24'),
  conge(1012, '2026-08-03', '2026-08-14'),
  conge(1013, '2026-09-14', '2026-09-25'),
  conge(1014, '2026-07-20', '2026-07-31'),
  conge(1015, '2026-08-10', '2026-08-21'),
  conge(1016, '2026-08-24', '2026-09-04'),
  conge(1017, '2026-07-13', '2026-07-17'),
  conge(1018, '2026-06-15', '2026-09-18'), // congé longue durée (sabbatique)
  conge(1019, '2026-08-03', '2026-08-14'),
  conge(1020, '2026-07-20', '2026-07-24'),
  conge(1021, '2026-08-17', '2026-08-28'),
  absence(1021, '2026-09-17', '2026-09-18', 'Formation'),
  // Direction Commerciale Adjointe
  conge(1022, '2026-07-06', '2026-07-17'),
  conge(1023, '2026-08-10', '2026-08-21'),
  conge(1023, '2026-07-24', '2026-07-24'),
  // Direction de la production / Achats
  conge(1024, '2026-08-03', '2026-08-14'),
  conge(1025, '2026-07-27', '2026-08-07'),
  conge(1026, '2026-09-07', '2026-09-18'),
  conge(1027, '2026-08-17', '2026-08-28'),
  conge(1028, '2026-07-13', '2026-07-24'),
  conge(1029, '2026-08-24', '2026-09-04'),
  conge(1030, '2026-07-06', '2026-07-17'),
];

const MOCK_TELETRAVAIL: PlanningLeave[] = [
  ...ttWeekly(1001, [5]),        // vendredi
  ...ttWeekly(1002, [1]),        // lundi
  ...ttWeekly(1003, [3]),        // mercredi
  ...ttWeekly(1004, [2]),        // mardi
  ...ttWeekly(1005, [2, 4]),     // mardi + jeudi
  ...ttWeekly(1006, [4]),        // jeudi
  ...ttWeekly(1007, [1]),        // lundi
  ...ttWeekly(1009, [3]),        // mercredi
  ...ttWeekly(1010, [3, 5]),     // mercredi + vendredi
  ...ttWeekly(1011, [1]),        // lundi
  ...ttWeekly(1012, [4, 5]),     // jeudi + vendredi
  ...ttWeekly(1013, [3]),        // mercredi
  ...ttWeekly(1014, [3, 5]),     // mercredi + vendredi
  ...ttWeekly(1015, [4, 5]),     // jeudi + vendredi
  ...ttWeekly(1016, [5]),        // vendredi
  ...ttWeekly(1017, [2, 4, 5]),  // mardi + jeudi + vendredi
  ...ttWeekly(1019, [3, 5]),     // mercredi + vendredi
  ...ttWeekly(1020, [3, 5]),     // mercredi + vendredi
  ...ttWeekly(1022, [1]),        // lundi
  ...ttWeekly(1023, [1]),        // lundi
  ...ttWeekly(1024, [2, 4]),     // mardi + jeudi
  ...ttWeekly(1025, [3, 5]),     // mercredi + vendredi
  ...ttWeekly(1026, [4]),        // jeudi
  ...ttWeekly(1027, [1, 3, 5]),  // lundi + mercredi + vendredi
  ...ttWeekly(1028, [5]),        // vendredi
  ...ttWeekly(1029, [2, 5]),     // mardi + vendredi
  ...ttWeekly(1030, [3]),        // mercredi
];

const MOCK_LEAVES: PlanningLeave[] = [...MOCK_CONGES, ...MOCK_TELETRAVAIL];

const MOCK_REASONS: LeaveReason[] = [
  { id: 1, description: 'Congés payés', code: 'CP', color: '#fca5a5', isConge: true, isFerie: false, isAbsence: false, isTeletravail: false },
  { id: 2, description: 'RTT', code: 'RTT', color: '#fca5a5', isConge: true, isFerie: false, isAbsence: false, isTeletravail: false },
  { id: 3, description: 'Maladie', code: 'MAL', color: '#fca5a5', isConge: false, isFerie: false, isAbsence: true, isTeletravail: false },
  { id: 4, description: 'Télétravail', code: 'TT', color: '#86efac', isConge: false, isFerie: false, isAbsence: false, isTeletravail: true },
  { id: 5, description: 'Jour férié', code: 'FER', color: '#d1d5db', isConge: false, isFerie: true, isAbsence: false, isTeletravail: false },
  { id: 6, description: 'Fermeture', code: 'FERM', color: '#9ca3af', isConge: false, isFerie: false, isAbsence: true, isTeletravail: false },
  { id: 7, description: 'Formation', code: 'FORM', color: '#fca5a5', isConge: false, isFerie: false, isAbsence: true, isTeletravail: false },
  { id: 8, description: 'Congé sans solde', code: 'CSS', color: '#fca5a5', isConge: true, isFerie: false, isAbsence: false, isTeletravail: false },
];

const MOCK_FILTERS: PlanningFilters = {
  departments: [DEPT_FINANCE, DEPT_COMMERCIAL, DEPT_COMMERCIAL_ADJ, DEPT_PRODUCTION],
  companies: [
    { id: 1, name: 'Editions Glénat' },
    { id: 2, name: 'Fonds Glénat pour le patrimoine et la création' },
    { id: 3, name: 'GED' },
    { id: 4, name: 'Glénat Benelux' },
    { id: 5, name: 'Glénat Diffusion' },
  ],
  places: [
    { id: 1, name: 'Glénat / Hugo Boulogne LE GALLO' },
    { id: 2, name: 'Glénat Boulogne SEN' },
    { id: 3, name: 'Glénat Grenoble' },
  ],
};
// ─── Fin mock data ──────────────────────────────────────────

export function usePlanningFilters() {
  return useQuery<PlanningFilters>({
    queryKey: [...PLANNING_FILTERS_QUERY_KEY],
    queryFn: USE_MOCK ? () => Promise.resolve(MOCK_FILTERS) : fetchPlanningFilters,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}

export function usePlanningLeaves(
  start: string,
  end: string,
  filterType?: PlanningFilterType,
  filterValue?: string,
) {
  return useQuery<PlanningLeave[]>({
    queryKey: PLANNING_LEAVES_QUERY_KEY(start, end, filterType, filterValue),
    queryFn: USE_MOCK
      ? () => Promise.resolve(MOCK_LEAVES)
      : () => fetchPlanningLeaves(start, end, filterType, filterValue),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!start && !!end,
  });
}

export function useLeaveReasons() {
  return useQuery<LeaveReason[]>({
    queryKey: PLANNING_REASONS_QUERY_KEY,
    queryFn: USE_MOCK ? () => Promise.resolve(MOCK_REASONS) : fetchLeaveReasons,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}

export function usePlanningEmployees(filterType: PlanningFilterType, filterValue: string) {
  return useQuery<PlanningEmployee[]>({
    queryKey: PLANNING_EMPLOYEES_QUERY_KEY(filterType, filterValue),
    queryFn: USE_MOCK
      ? () => Promise.resolve(MOCK_EMPLOYEES)
      : () => fetchPlanningEmployees(filterType, filterValue),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: !!filterValue,
  });
}

export type { PlanningLeave, LeaveReason, PlanningEmployee, PlanningFilters, PlanningFilterType } from '@/lib/planningApi';
