import { fetchWithOAuth } from './oauth';

const PRESENCE_BASE_URL = import.meta.env.DEV
  ? '/Api/v2.0/presence'
  : `${import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com'}/Api/v2.0/presence`;

// ─── Types ─────────────────────────────────────────────────

export interface NotificationGroup {
  category: string;
  count: number;
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

// ─── API Call ──────────────────────────────────────────────

export async function fetchNotifications(userId: number): Promise<NotificationGroup[]> {
  const response = await fetchWithOAuth(`${PRESENCE_BASE_URL}/notifications?userId=${userId}`);

  if (!response.ok) {
    throw new Error(
      `La récupération des notifications a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ApiResponse<NotificationGroup[]>;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des notifications a échoué.');
  }

  return extractResult(data) ?? [];
}

// ─── Query Key ─────────────────────────────────────────────

export const NOTIFICATIONS_QUERY_KEY = (userId: number) => ['notifications', userId] as const;
