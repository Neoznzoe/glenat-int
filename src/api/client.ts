import { API_BASE_URL } from "@/config";
import { CurrentUser, Module, UserPermission } from "@/types/sidebar";

type RequestOptions = {
  signal?: AbortSignal;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    signal: options.signal,
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data === "object" && "message" in data) {
      return String(data.message);
    }
  } catch (error) {
    // Swallow JSON parsing issues; fallback message below.
  }

  return `Erreur lors de l'appel ${response.url || response.type}: ${response.status}`;
}

export function getModules(options: RequestOptions = {}): Promise<Module[]> {
  return request<Module[]>("/api/modules", options);
}

export function getUserPermissions(options: RequestOptions = {}): Promise<UserPermission[]> {
  return request<UserPermission[]>("/api/me/permissions", options);
}

export function getCurrentUser(options: RequestOptions = {}): Promise<CurrentUser> {
  return request<CurrentUser>("/api/me", options);
}

/*
 * Variante React Query disponible dans src/api/query.ts
 * Activez-la via USE_REACT_QUERY=true dans src/config.ts.
 */
