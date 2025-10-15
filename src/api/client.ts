export interface ApiClientOptions extends RequestInit {
  /** Optional override for the API base URL. */
  baseUrl?: string;
}

const DEFAULT_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
};

const getBaseUrl = (override?: string) => {
  if (override) {
    return override.replace(/\/$/, '');
  }
  const envValue = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (envValue ?? '').replace(/\/$/, '');
};

/**
 * Minimal JSON fetch helper used by the React hooks.
 */
export async function apiFetch<TResponse>(path: string, options: ApiClientOptions = {}): Promise<TResponse> {
  const { baseUrl, headers, ...rest } = options;
  const url = `${getBaseUrl(baseUrl)}${path}`;

  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    ...rest,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status} ${response.statusText}: ${body}`);
  }

  return (await response.json()) as TResponse;
}
