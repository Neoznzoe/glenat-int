import { fetchWithOAuth } from './oauth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-dev.groupe-glenat.com';

export interface DatabaseUserLookupResponse {
  success?: boolean;
  message?: string;
  result?: unknown;
  [key: string]: unknown;
}

interface UserListResponse {
  success: boolean;
  code?: number;
  message?: string;
  data?: UserRecord[];
  users?: UserRecord[];
  page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  [key: string]: unknown;
}

interface UserRecord {
  email?: string;
  [key: string]: unknown;
}

/**
 * Searches through paginated user list to find a user matching the given email.
 * Uses GET /Api/v2.0/users with pagination.
 */
export async function lookupInternalUserByEmail(
  email: string,
): Promise<DatabaseUserLookupResponse | null> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return null;
  }

  const perPage = 100;
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${API_BASE_URL}/Api/v2.0/users?page=${page}&per_page=${perPage}`;

    const response = await fetchWithOAuth(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Requête de synchronisation échouée (${response.status}) ${response.statusText}`,
      );
    }

    let body: UserListResponse;
    try {
      body = (await response.json()) as UserListResponse;
    } catch {
      return null;
    }

    const users: UserRecord[] = body.data ?? body.users ?? [];

    const match = users.find(
      (u) => typeof u.email === 'string' && u.email.toLowerCase() === trimmedEmail,
    );

    if (match) {
      return {
        success: true,
        message: 'User found',
        result: match,
      };
    }

    // Determine total pages from the response
    if (body.total_pages != null) {
      totalPages = body.total_pages;
    } else if (body.total != null) {
      totalPages = Math.ceil(body.total / perPage);
    } else if (users.length < perPage) {
      // No more pages if we got fewer results than requested
      break;
    }

    page++;
  }

  // No user found with that email
  return {
    success: true,
    message: 'No user found',
    result: null,
  };
}
