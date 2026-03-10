import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

// ============================================================================
// TYPES
// ============================================================================

export interface ImaginoContactPayload {
  email: string;
  optin?: string;
  first_name?: string;
  last_name?: string;
  origin?: string;
  country?: string;
  zip_code?: string;
  birth_date?: string;
  services?: string[];
  lists?: string[];
}

export interface ImaginoContactProfile {
  email: string;
  profile?: unknown;
  subscriptions?: unknown;
}

export interface ImaginoResponse {
  success: boolean;
  code: number;
  message: string;
  result: unknown;
}

export interface ImaginoContactResponse {
  success: boolean;
  code: number;
  message: string;
  result: ImaginoContactProfile;
}

// ============================================================================
// HELPERS
// ============================================================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = (await response.json()) as { message?: string };
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage || 'Une erreur est survenue');
  }
  return (await response.json()) as T;
}

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * Recupere un contact Imagino par email
 */
export async function getImaginoContact(
  email: string,
  include: ('profile' | 'subscriptions' | 'raw')[] = ['profile', 'subscriptions'],
  country?: string,
): Promise<ImaginoContactResponse> {
  const params = new URLSearchParams({ include: include.join(',') });
  if (country) {
    params.set('country', country);
  }

  const url = `${API_BASE_URL}/Api/v2.0/Imagino/contact/${encodeURIComponent(email)}?${params.toString()}`;

  const response = await fetchWithOAuth(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<ImaginoContactResponse>(response);
}

/**
 * Cree ou met a jour un contact Imagino
 */
export async function upsertImaginoContact(
  payload: ImaginoContactPayload,
): Promise<ImaginoResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/Imagino/contact`;

  const response = await fetchWithOAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<ImaginoResponse>(response);
}

/**
 * v2.2 — Mise a jour contact Imagino via endpoint legacy (compatible extranet v1)
 * Cet endpoint ne requiert pas d'authentification cote API,
 * mais on passe par fetchWithOAuth par coherence
 */
export async function setImaginoContact(
  email: string,
  data?: Record<string, unknown>,
): Promise<ImaginoResponse> {
  const url = `${API_BASE_URL}/Api/v2.0/imagino/set`;

  const body: Record<string, unknown> = { email };
  if (data) {
    body.data = data;
  }

  const response = await fetchWithOAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return handleResponse<ImaginoResponse>(response);
}
