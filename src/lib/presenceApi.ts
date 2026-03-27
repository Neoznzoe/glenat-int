import { fetchWithOAuth } from './oauth';

const PRESENCE_BASE_URL = import.meta.env.DEV
  ? '/Api/v2.0/presence'
  : 'https://api-dev.groupe-glenat.com/Api/v2.0/presence';

// ─── Types ─────────────────────────────────────────────────

export interface PresencePerson {
  name: string;
  email: string; // vide pour l'instant, sera rempli par cross-reference plus tard
  department: string;
  company: string;
  startDate: string;
  endDate: string;
}

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

export async function fetchTravelingToday(): Promise<PresencePerson[]> {
  const response = await fetchWithOAuth(`${PRESENCE_BASE_URL}/traveling-today`);

  if (!response.ok) {
    throw new Error(
      `La récupération des déplacements du jour a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<PresencePerson[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des déplacements du jour a échoué.');
  }

  return extractResult(data) ?? [];
}

export async function fetchPlannedTravel(): Promise<PresencePerson[]> {
  const response = await fetchWithOAuth(`${PRESENCE_BASE_URL}/planned-travel`);

  if (!response.ok) {
    throw new Error(
      `La récupération des déplacements prévus a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<PresencePerson[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des déplacements prévus a échoué.');
  }

  return extractResult(data) ?? [];
}

export async function fetchVisitingToday(): Promise<PresencePerson[]> {
  const response = await fetchWithOAuth(`${PRESENCE_BASE_URL}/visiting-today`);

  if (!response.ok) {
    throw new Error(
      `La récupération des visites du jour a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<PresencePerson[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des visites du jour a échoué.');
  }

  return extractResult(data) ?? [];
}

// ─── Query Keys ────────────────────────────────────────────

export const PRESENCE_TRAVELING_TODAY_QUERY_KEY = ['presence', 'traveling-today'] as const;
export const PRESENCE_PLANNED_TRAVEL_QUERY_KEY = ['presence', 'planned-travel'] as const;
export const PRESENCE_VISITING_TODAY_QUERY_KEY = ['presence', 'visiting-today'] as const;
