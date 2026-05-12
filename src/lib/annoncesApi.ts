import { fetchWithOAuth } from './oauth';

const ANNONCES_BASE_URL = import.meta.env.DEV
  ? '/Api/v2.0/annonces'
  : `${import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com'}/Api/v2.0/annonces`;

// ─── Types ─────────────────────────────────────────────────

export interface AnnonceAuthor {
  lastName: string;
  firstName: string;
  department: string;
  company: string;
}

export interface AnnonceImage {
  filename: string;
  large: string;
  thumb: string;
}

export interface AnnonceAttachment {
  filename: string;
  url: string;
}

export interface Annonce {
  id: number;
  createdAt: string;
  title: string;
  expiresAt: string;
  description: string;
  type: string;
  category: string;
  price: string;
  validation: string;
  author: AnnonceAuthor;
  images: AnnonceImage[];
  attachments: AnnonceAttachment[];
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

export async function fetchAnnonces(): Promise<Annonce[]> {
  const response = await fetchWithOAuth(ANNONCES_BASE_URL);

  if (!response.ok) {
    throw new Error(
      `La récupération des annonces a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<Annonce[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des annonces a échoué.');
  }

  return extractResult(data) ?? [];
}

export async function fetchAnnonce(id: number): Promise<Annonce> {
  const response = await fetchWithOAuth(`${ANNONCES_BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error(
      `La récupération de l'annonce a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<Annonce>;
  if (data.success === false) {
    throw new Error(data.message || "La récupération de l'annonce a échoué.");
  }

  const result = extractResult(data);
  if (!result) {
    throw new Error('Annonce introuvable.');
  }

  return result;
}

export async function fetchAnnoncesCount(): Promise<number> {
  const response = await fetchWithOAuth(`${ANNONCES_BASE_URL}/count`);

  if (!response.ok) {
    throw new Error(
      `La récupération du nombre d'annonces a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<{ count: number }>;
  if (data.success === false) {
    throw new Error(data.message || "La récupération du nombre d'annonces a échoué.");
  }

  const result = extractResult(data);
  return result?.count ?? 0;
}

// ─── Émetteur ──────────────────────────────────────────────

export interface AnnonceEmetteur {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  email: string;
  company: string;
  lieu?: number;
}

export async function fetchAnnonceEmetteur(email: string): Promise<AnnonceEmetteur | null> {
  const response = await fetchWithOAuth(
    `${ANNONCES_BASE_URL}/emetteur?email=${encodeURIComponent(email)}`,
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(
      `La récupération de l'émetteur a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<AnnonceEmetteur>;
  if (data.success === false) {
    return null;
  }

  return extractResult(data) ?? null;
}

// ─── Query Keys ────────────────────────────────────────────

export const ANNONCES_QUERY_KEY = ['annonces'] as const;
export const ANNONCES_COUNT_QUERY_KEY = ['annonces', 'count'] as const;
export const ANNONCES_EMETTEUR_QUERY_KEY = (email: string) => ['annonces', 'emetteur', email] as const;
