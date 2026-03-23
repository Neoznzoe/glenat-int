import { fetchWithOAuth } from './oauth';

const PLANNING_BASE_URL = import.meta.env.DEV
  ? '/Api/v2.0/planning'
  : 'https://api-dev.groupe-glenat.com/Api/v2.0/planning';

// ─── Types ─────────────────────────────────────────────────

export interface PlanningEmployee {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  company: string;
}

export interface PlanningLeave {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  startPeriod: string;
  endPeriod: string;
  type: string;
  reason: string;
  status: string;
  days: number;
}

export interface LeaveReason {
  id: number;
  description: string;
  code: string;
  color: string;
  isConge: boolean;
  isFerie: boolean;
  isAbsence: boolean;
  isTeletravail: boolean;
}

export interface PlanningFilters {
  departments: string[];
  companies: { id: number; name: string }[];
  places: { id: number; name: string }[];
}

export type PlanningFilterType = 'service' | 'societe' | 'lieu';

// ─── Helpers ───────────────────────────────────────────────

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  result?: T | { result?: T };
}

function extractResult<T>(data: ApiResponse<T>): T | undefined {
  const result = data.result;
  if (result && typeof result === 'object' && 'result' in (result as Record<string, unknown>)) {
    return (result as { result: T }).result;
  }
  return result as T | undefined;
}

// ─── API Calls ─────────────────────────────────────────────

export async function fetchPlanningFilters(): Promise<PlanningFilters> {
  const response = await fetchWithOAuth(`${PLANNING_BASE_URL}/filters`);

  if (!response.ok) {
    throw new Error(
      `La récupération des filtres a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<PlanningFilters>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des filtres a échoué.');
  }

  return extractResult(data) ?? { departments: [], companies: [], places: [] };
}

export async function fetchPlanningLeaves(
  start: string,
  end: string,
  filterType?: PlanningFilterType,
  filterValue?: string,
): Promise<PlanningLeave[]> {
  const params = new URLSearchParams({ start, end });
  if (filterType && filterValue) {
    params.set('filterType', filterType);
    params.set('filterValue', filterValue);
  }

  const response = await fetchWithOAuth(`${PLANNING_BASE_URL}/leaves?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `La récupération des absences a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<PlanningLeave[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des absences a échoué.');
  }

  return extractResult(data) ?? [];
}

export async function fetchLeaveReasons(): Promise<LeaveReason[]> {
  const response = await fetchWithOAuth(`${PLANNING_BASE_URL}/reasons`);

  if (!response.ok) {
    throw new Error(
      `La récupération des motifs a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<LeaveReason[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des motifs a échoué.');
  }

  return extractResult(data) ?? [];
}

export async function fetchPlanningEmployees(
  filterType: PlanningFilterType,
  filterValue: string,
): Promise<PlanningEmployee[]> {
  const params = new URLSearchParams({ filterType, filterValue });
  const response = await fetchWithOAuth(`${PLANNING_BASE_URL}/employees?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `La récupération des employés a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<PlanningEmployee[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des employés a échoué.');
  }

  return extractResult(data) ?? [];
}

// ─── Query Keys ────────────────────────────────────────────

export const PLANNING_FILTERS_QUERY_KEY = ['planning', 'filters'] as const;

export const PLANNING_LEAVES_QUERY_KEY = (
  start: string,
  end: string,
  filterType?: PlanningFilterType,
  filterValue?: string,
) => ['planning', 'leaves', start, end, filterType ?? 'none', filterValue ?? 'all'] as const;

export const PLANNING_REASONS_QUERY_KEY = ['planning', 'reasons'] as const;

export const PLANNING_EMPLOYEES_QUERY_KEY = (filterType: PlanningFilterType, filterValue: string) =>
  ['planning', 'employees', filterType, filterValue] as const;
