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

// Passer à false pour utiliser les mock data
const USE_MOCK = false;

const MOCK_EMPLOYEES: PlanningEmployee[] = [
  { id: 1001, firstName: 'Victor', lastName: 'Besson', department: 'Informatique', company: 'Glénat Entreprises et Développement' },
  { id: 1002, firstName: 'Damien', lastName: 'Bonis', department: 'Informatique', company: 'Glénat Entreprises et Développement' },
  { id: 1003, firstName: 'Stéphane', lastName: 'Chermette', department: 'Informatique', company: 'Glénat Entreprises et Développement' },
  { id: 1004, firstName: 'Valentin', lastName: 'Cogan', department: 'Informatique', company: 'Glénat Entreprises et Développement' },
  { id: 1005, firstName: 'Nicolas', lastName: 'Merceur', department: 'Informatique', company: 'Glénat Entreprises et Développement' },
  { id: 1006, firstName: 'Matthieu', lastName: 'Nicolas', department: 'Informatique', company: 'Glénat Entreprises et Développement' },
  { id: 1007, firstName: 'Nino', lastName: 'Perna', department: 'Informatique', company: 'Glénat Entreprises et Développement' },
];

const MOCK_LEAVES: PlanningLeave[] = [
  // Besson Victor — congé du 10 au 14 mars (semaine complète)
  { id: 1, employeeId: 1001, startDate: '2025-03-10', endDate: '2025-03-14', startPeriod: 'AM', endPeriod: 'PM', type: 'Congé', reason: 'Congés payés', status: 'Validé', days: 5 },
  // Besson Victor — télétravail le 24 mars
  { id: 2, employeeId: 1001, startDate: '2025-03-24', endDate: '2025-03-24', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },

  // Bonis Damien — télétravail les lundis (3, 17, 24, 31)
  { id: 3, employeeId: 1002, startDate: '2025-03-03', endDate: '2025-03-03', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
  { id: 4, employeeId: 1002, startDate: '2025-03-17', endDate: '2025-03-17', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
  { id: 5, employeeId: 1002, startDate: '2025-03-24', endDate: '2025-03-24', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
  { id: 6, employeeId: 1002, startDate: '2025-03-31', endDate: '2025-03-31', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },

  // Chermette Stéphane — absence maladie du 5 au 7 mars
  { id: 7, employeeId: 1003, startDate: '2025-03-05', endDate: '2025-03-07', startPeriod: 'AM', endPeriod: 'PM', type: 'Absence', reason: 'Maladie', status: 'Validé', days: 3 },

  // Cogan Valentin — demi-journée congé le 21 mars (PM) + congé à valider 27-28 mars
  { id: 8, employeeId: 1004, startDate: '2025-03-21', endDate: '2025-03-21', startPeriod: 'PM', endPeriod: 'PM', type: 'Congé', reason: 'Congés payés', status: 'Validé', days: 0.5 },
  { id: 9, employeeId: 1004, startDate: '2025-03-27', endDate: '2025-03-28', startPeriod: 'AM', endPeriod: 'PM', type: 'Congé', reason: 'Congés payés', status: 'A valider', days: 2 },

  // Merceur Nicolas — télétravail mardi/jeudi (4,6,11,13,18,20,25,27)
  { id: 10, employeeId: 1005, startDate: '2025-03-04', endDate: '2025-03-04', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
  { id: 11, employeeId: 1005, startDate: '2025-03-06', endDate: '2025-03-06', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
  { id: 12, employeeId: 1005, startDate: '2025-03-11', endDate: '2025-03-11', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
  { id: 13, employeeId: 1005, startDate: '2025-03-13', endDate: '2025-03-13', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
  { id: 14, employeeId: 1005, startDate: '2025-03-18', endDate: '2025-03-18', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
  { id: 15, employeeId: 1005, startDate: '2025-03-20', endDate: '2025-03-20', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
  { id: 16, employeeId: 1005, startDate: '2025-03-25', endDate: '2025-03-25', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
  { id: 17, employeeId: 1005, startDate: '2025-03-27', endDate: '2025-03-27', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },

  // Nicolas Matthieu — congé du 17 au 21 mars
  { id: 18, employeeId: 1006, startDate: '2025-03-17', endDate: '2025-03-21', startPeriod: 'AM', endPeriod: 'PM', type: 'Congé', reason: 'Congés payés', status: 'Validé', days: 5 },

  // Perna Nino — demi-journée congé le 7 mars matin + congé à valider 24-25 mars
  { id: 19, employeeId: 1007, startDate: '2025-03-07', endDate: '2025-03-07', startPeriod: 'AM', endPeriod: 'AM', type: 'Congé', reason: 'Congés payés', status: 'Validé', days: 0.5 },
  { id: 20, employeeId: 1007, startDate: '2025-03-24', endDate: '2025-03-25', startPeriod: 'AM', endPeriod: 'PM', type: 'Congé', reason: 'Congés payés', status: 'A valider', days: 2 },
  // Perna Nino — télétravail le 12 mars
  { id: 21, employeeId: 1007, startDate: '2025-03-12', endDate: '2025-03-12', startPeriod: 'AM', endPeriod: 'PM', type: 'Télétravail', reason: 'Télétravail', status: 'Validé', days: 1 },
];

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
  departments: ['Commercial', 'Informatique', 'Éditorial', 'Marketing'],
  companies: [
    { id: 1, name: 'Editions Glénat' },
    { id: 2, name: 'Glénat Entreprises et Développement' },
  ],
  places: [
    { id: 1, name: 'Grenoble' },
    { id: 2, name: 'Paris' },
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
