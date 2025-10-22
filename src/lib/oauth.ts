const DEFAULT_AUTHORIZE_ENDPOINT =
  'https://api-dev.groupe-glenat.com/Api/v1.0/OAuth/authorize';

const AUTHORIZE_ENDPOINT =
  import.meta.env.VITE_OAUTH_AUTHORIZE_ENDPOINT ?? DEFAULT_AUTHORIZE_ENDPOINT;
const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_OAUTH_CLIENT_SECRET;
const REQUEST_SCOPE = import.meta.env.VITE_OAUTH_SCOPE;
const REQUEST_AUDIENCE = import.meta.env.VITE_OAUTH_AUDIENCE;
const GRANT_TYPE = import.meta.env.VITE_OAUTH_GRANT_TYPE ?? 'client_credentials';

const FALLBACK_TTL_SECONDS = parsePositiveInteger(
  import.meta.env.VITE_OAUTH_FALLBACK_TTL,
  3600,
);
const REFRESH_LEEWAY_SECONDS = parsePositiveInteger(
  import.meta.env.VITE_OAUTH_REFRESH_LEEWAY,
  30,
);
const REFRESH_LEEWAY_MS = Math.max(0, REFRESH_LEEWAY_SECONDS) * 1000;

interface OAuthTokenResponse {
  access_token?: string;
  accessToken?: string;
  code_exchange?: string;
  codeExchange?: string;
  token_type?: string;
  tokenType?: string;
  expires_in?: number | string;
  expiresIn?: number | string;
  maxAge?: number | string;
  max_age?: number | string;
  scope?: string;
  [key: string]: unknown;
}

export interface OAuthAccessToken {
  token: string;
  tokenType: string;
  scope?: string;
}

const STORAGE_KEY = 'glenat.oauth.token';

interface PersistedOAuthToken extends OAuthAccessToken {
  refreshTimestamp: number;
}

let cachedToken: OAuthAccessToken | null = null;
let refreshTimestamp = 0;
let pendingTokenRequest: Promise<OAuthAccessToken> | null = null;
let storageHydrated = false;

function parsePositiveInteger(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 0 ? value : fallback;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return fallback;
}

function toTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function hydrateTokenFromStorage(): void {
  if (storageHydrated) {
    return;
  }

  storageHydrated = true;

  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as PersistedOAuthToken | null;
    if (!parsed || typeof parsed !== 'object') {
      storage.removeItem(STORAGE_KEY);
      return;
    }

    if (!parsed.token || typeof parsed.token !== 'string') {
      storage.removeItem(STORAGE_KEY);
      return;
    }

    if (typeof parsed.refreshTimestamp !== 'number') {
      storage.removeItem(STORAGE_KEY);
      return;
    }

    cachedToken = {
      token: parsed.token,
      tokenType: typeof parsed.tokenType === 'string' && parsed.tokenType.trim()
        ? parsed.tokenType
        : 'Bearer',
      scope: typeof parsed.scope === 'string' ? parsed.scope : undefined,
    };
    refreshTimestamp = parsed.refreshTimestamp;
  } catch {
    const storage = getStorage();
    storage?.removeItem(STORAGE_KEY);
  }
}

function persistTokenInStorage(token: OAuthAccessToken, refreshAt: number): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const payload: PersistedOAuthToken = {
    token: token.token,
    tokenType: token.tokenType,
    scope: token.scope,
    refreshTimestamp: refreshAt,
  };

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota errors or unavailable storage
  }
}

function clearPersistedToken(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function shouldReuseToken(forceRefresh: boolean): boolean {
  if (forceRefresh) {
    return false;
  }

  if (!cachedToken) {
    return false;
  }

  if (Date.now() < refreshTimestamp) {
    return true;
  }

  invalidateCachedOAuthToken();
  return false;
}

function buildAuthorizeBody(): string {
  if (!CLIENT_ID) {
    throw new Error(
      'La variable VITE_OAUTH_CLIENT_ID doit être configurée pour récupérer un jeton OAuth.',
    );
  }

  const payload = new URLSearchParams();
  payload.set('client_id', CLIENT_ID);

  if (CLIENT_SECRET) {
    payload.set('client_secret', CLIENT_SECRET);
  }

  if (GRANT_TYPE) {
    payload.set('grant_type', GRANT_TYPE);
  }

  if (REQUEST_SCOPE) {
    payload.set('scope', REQUEST_SCOPE);
  }

  if (REQUEST_AUDIENCE) {
    payload.set('audience', REQUEST_AUDIENCE);
  }

  return payload.toString();
}

function buildAuthorizeHeaders(): HeadersInit {
  const headers = new Headers();
  headers.set('Content-Type', 'application/x-www-form-urlencoded');
  return headers;
}

async function requestNewToken(): Promise<OAuthAccessToken> {
  const body = buildAuthorizeBody();
  const headers = buildAuthorizeHeaders();
  let response: Response;

  try {
    response = await fetch(AUTHORIZE_ENDPOINT, {
      method: 'POST',
      headers,
      body,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'erreur réseau inconnue';
    throw new Error(`Impossible de contacter le service OAuth : ${detail}`);
  }

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const payload = (await response.json()) as { [key: string]: unknown };
      const errorDescription = payload.error_description ?? payload.errorDescription;
      const message = payload.message ?? payload.error;
      if (typeof errorDescription === 'string' && errorDescription.trim()) {
        detail = errorDescription;
      } else if (typeof message === 'string' && message.trim()) {
        detail = message;
      }
    } catch {
      try {
        const text = await response.text();
        detail = text.trim() || undefined;
      } catch {
        // ignore secondary parsing errors
      }
    }

    const statusMessage = response.statusText || 'Réponse invalide';
    const suffix = detail ? ` ${detail}` : '';
    throw new Error(
      `Récupération du jeton OAuth échouée (${response.status}) ${statusMessage}${suffix}`,
    );
  }

  let payload: OAuthTokenResponse;
  try {
    payload = (await response.json()) as OAuthTokenResponse;
  } catch {
    throw new Error('Réponse OAuth invalide : impossible de lire le JSON.');
  }

  const codeExchange = toTrimmedString(payload.code_exchange ?? payload.codeExchange);
  const accessToken = toTrimmedString(payload.access_token ?? payload.accessToken);
  const resolvedToken = codeExchange ?? accessToken;

  if (!resolvedToken) {
    throw new Error(
      "La réponse OAuth ne contient pas de champ 'access_token' ou 'code_exchange'.",
    );
  }

  if (codeExchange) {
    console.log('[OAuth] code_exchange reçu via /OAuth/authorize :', codeExchange);
  } else {
    console.log('[OAuth] jeton reçu via /OAuth/authorize :', resolvedToken);
  }

  const tokenType = toTrimmedString(payload.token_type ?? payload.tokenType) ?? 'Bearer';
  const expiresIn = parsePositiveInteger(
    payload.expires_in ?? payload.expiresIn ?? payload.maxAge ?? payload.max_age,
    FALLBACK_TTL_SECONDS,
  );
  const refreshAt = Date.now() + expiresIn * 1000 - REFRESH_LEEWAY_MS;
  refreshTimestamp = Math.max(Date.now() + 1000, refreshAt);

  cachedToken = {
    token: resolvedToken,
    tokenType,
    scope: typeof payload.scope === 'string' ? payload.scope : undefined,
  };

  persistTokenInStorage(cachedToken, refreshTimestamp);

  return cachedToken;
}

export async function fetchAccessToken(forceRefresh = false): Promise<OAuthAccessToken> {
  hydrateTokenFromStorage();

  if (shouldReuseToken(forceRefresh) && cachedToken) {
    return cachedToken;
  }

  if (!forceRefresh && pendingTokenRequest) {
    return pendingTokenRequest;
  }

  const request = requestNewToken();
  pendingTokenRequest = request;

  try {
    const token = await request;
    return token;
  } finally {
    pendingTokenRequest = null;
  }
}

function withAuthorizationHeader(init: RequestInit | undefined, token: OAuthAccessToken): RequestInit {
  const headers = new Headers(init?.headers ?? undefined);
  const tokenType = typeof token.tokenType === 'string' ? token.tokenType.trim() : '';
  const prefix = tokenType ? `${tokenType} ` : '';
  const headerValue = `${prefix}${token.token}`.trim();
  headers.set('Authorization', headerValue);

  return {
    ...init,
    headers,
  };
}

function normalizeRequestUrl(input: RequestInfo | URL): string | undefined {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.url;
  }

  return undefined;
}

export async function fetchWithOAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = await fetchAccessToken();
  const authorizedInit = withAuthorizationHeader(init, token);
  const requestUrl = normalizeRequestUrl(input);

  if (requestUrl?.includes('/Api/v1.0/Intranet/callDatabase')) {
    let authorizationHeader: string | null = null;
    const { headers } = authorizedInit;

    if (headers instanceof Headers) {
      authorizationHeader = headers.get('Authorization');
    } else if (headers) {
      authorizationHeader = new Headers(headers).get('Authorization');
    }

    console.log('[OAuth] Authorization envoyé vers callDatabase :', authorizationHeader);
  }

  return fetch(input, authorizedInit);
}

export function invalidateCachedOAuthToken(): void {
  cachedToken = null;
  refreshTimestamp = 0;
  pendingTokenRequest = null;
  clearPersistedToken();
}
