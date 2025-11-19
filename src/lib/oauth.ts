import { decryptFromStorage, encryptForStorage } from './storageEncryption';

const DEFAULT_AUTHORIZE_ENDPOINT = 'https://api-dev.groupe-glenat.com/Api/v2.0/OAuth/authorize?response_type=code&client_id=sys-api-core&client_secret=sys_api_master_secret';
const DEFAULT_TOKEN_ENDPOINT = 'https://api-dev.groupe-glenat.com/Api/v2.0/OAuth/token';



const AUTHORIZE_ENDPOINT = import.meta.env.VITE_OAUTH_AUTHORIZE_ENDPOINT ?? DEFAULT_AUTHORIZE_ENDPOINT;
const TOKEN_ENDPOINT = import.meta.env.VITE_OAUTH_TOKEN_ENDPOINT ?? DEFAULT_TOKEN_ENDPOINT;
const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_OAUTH_CLIENT_SECRET;
const REQUEST_SCOPE = import.meta.env.VITE_OAUTH_SCOPE;
const REQUEST_AUDIENCE = import.meta.env.VITE_OAUTH_AUDIENCE;
const AUTHORIZE_GRANT_TYPE =  import.meta.env.VITE_OAUTH_AUTHORIZE_GRANT_TYPE ??  import.meta.env.VITE_OAUTH_GRANT_TYPE ??  '';
const TOKEN_GRANT_TYPE =
  import.meta.env.VITE_OAUTH_TOKEN_GRANT_TYPE ?? 'authorization_code';
const REFRESH_GRANT_TYPE =
  import.meta.env.VITE_OAUTH_REFRESH_GRANT_TYPE ?? 'refresh_token';

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
  refresh_token?: string;
  refreshToken?: string;
  code_exchange?: string;
  codeExchange?: string;
  code?: string;
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
  refreshToken?: string;
}

const STORAGE_KEY = 'glenat.oauth.token';

interface PersistedOAuthToken extends OAuthAccessToken {
  refreshTimestamp: number;
}

let cachedToken: OAuthAccessToken | null = null;
let refreshTimestamp = 0;
let pendingTokenRequest: Promise<OAuthAccessToken> | null = null;
let storageHydrated = false;
let storageHydrationPromise: Promise<void> | null = null;

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

async function hydrateTokenFromStorage(): Promise<void> {
  if (storageHydrated) {
    return;
  }

  if (storageHydrationPromise) {
    await storageHydrationPromise;
    return;
  }

  storageHydrationPromise = (async () => {
    storageHydrated = true;

    const storage = getStorage();
    if (!storage) {
      return;
    }

    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    let decrypted: unknown;
    try {
      decrypted = await decryptFromStorage(raw);
    } catch (error) {
      storage.removeItem(STORAGE_KEY);
      console.warn(
        "[OAuth] Impossible de déchiffrer le jeton persistant, nettoyage du stockage.",
        error,
      );
      return;
    }

    const parsed = decrypted as PersistedOAuthToken | null;
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
      tokenType:
        typeof parsed.tokenType === 'string' && parsed.tokenType.trim()
          ? parsed.tokenType
          : 'Bearer',
      scope: typeof parsed.scope === 'string' ? parsed.scope : undefined,
      refreshToken:
        typeof parsed.refreshToken === 'string' && parsed.refreshToken.trim()
          ? parsed.refreshToken
          : undefined,
    };
    refreshTimestamp = parsed.refreshTimestamp;
  })();

  try {
    await storageHydrationPromise;
  } finally {
    storageHydrationPromise = null;
  }
}

async function persistTokenInStorage(
  token: OAuthAccessToken,
  refreshAt: number,
): Promise<void> {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const payload: PersistedOAuthToken = {
    token: token.token,
    tokenType: token.tokenType,
    scope: token.scope,
    refreshToken: token.refreshToken,
    refreshTimestamp: refreshAt,
  };

  try {
    const encrypted = await encryptForStorage(payload);
    storage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.warn('[OAuth] Impossible de persister le jeton chiffré.', error);
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

  if (!refreshTimestamp) {
    return true;
  }

  return Date.now() < refreshTimestamp;
}

function buildAuthorizeQueryParams(): string {
  if (!CLIENT_ID) {
    throw new Error(
      'La variable VITE_OAUTH_CLIENT_ID doit être configurée pour récupérer un jeton OAuth.',
    );
  }

  const params = new URLSearchParams();
  params.set('client_id', CLIENT_ID);

  if (CLIENT_SECRET) {
    params.set('client_secret', CLIENT_SECRET);
  }

  const grantType = toTrimmedString(AUTHORIZE_GRANT_TYPE);
  if (grantType) {
    params.set('grant_type', grantType);
  }

  if (REQUEST_SCOPE) {
    params.set('scope', REQUEST_SCOPE);
  }

  if (REQUEST_AUDIENCE) {
    params.set('audience', REQUEST_AUDIENCE);
  }

  return params.toString();
}


function buildAuthorizeHeaders(): HeadersInit {
  const headers = new Headers();
  headers.set('Content-Type', 'application/x-www-form-urlencoded');
  return headers;
}

async function parseOAuthError(response: Response): Promise<string | undefined> {
  try {
    const payload = (await response.json()) as { [key: string]: unknown };
    const errorDescription = payload.error_description ?? payload.errorDescription;
    const message = payload.message ?? payload.error;
    if (typeof errorDescription === 'string' && errorDescription.trim()) {
      return errorDescription;
    }
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  } catch {
    try {
      const text = await response.text();
      const trimmed = text.trim();
      if (trimmed) {
        return trimmed;
      }
    } catch {
      // ignore secondary parsing errors
    }
  }

  return undefined;
}

async function requestAuthorizationCode(): Promise<string> {
  // const body = buildAuthorizeBody();
  const body = buildAuthorizeQueryParams();
  const headers = buildAuthorizeHeaders();
  let response: Response;

  try {
    console.log(body)
    response = await fetch(AUTHORIZE_ENDPOINT, {
      method: 'GET',
      headers,
      // body,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'erreur réseau inconnue';
    throw new Error(`Impossible de contacter le service OAuth : ${detail}`);
  }

  if (!response.ok) {
    const detail = await parseOAuthError(response);
    const statusMessage = response.statusText || 'Réponse invalide';
    const suffix = detail ? ` ${detail}` : '';
    throw new Error(
      `Récupération du code d'autorisation échouée (${response.status}) ${statusMessage}${suffix}`,
    );
  }

  let payload: OAuthTokenResponse;
  try {
    payload = (await response.json()) as OAuthTokenResponse;
  } catch {
    throw new Error('Réponse OAuth invalide : impossible de lire le JSON.');
  }

  const codeExchange = toTrimmedString(payload.code_exchange ?? payload.codeExchange);
  const fallbackCode = toTrimmedString(payload.code);
  const resolvedCode = codeExchange ?? fallbackCode;

  if (!resolvedCode) {
    throw new Error(
      "La réponse /OAuth/authorize ne contient pas de champ 'code_exchange' ni 'code'.",
    );
  }

  if (codeExchange) {
    console.debug('[OAuth] code_exchange reçu via /OAuth/authorize.');
  } else {
    console.debug('[OAuth] code reçu via /OAuth/authorize.');
  }

  return resolvedCode;
}

function buildTokenRequestHeaders(): HeadersInit {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  return headers;
}

function ensureClientCredentials(): void {
  if (!CLIENT_ID) {
    throw new Error(
      'La variable VITE_OAUTH_CLIENT_ID doit être configurée pour échanger un code OAuth.',
    );
  }

  if (!CLIENT_SECRET) {
    throw new Error(
      'La variable VITE_OAUTH_CLIENT_SECRET doit être configurée pour échanger un code OAuth.',
    );
  }
}

function computeRefreshDeadline(expiresInSeconds: number): number {
  const refreshAt = Date.now() + expiresInSeconds * 1000 - REFRESH_LEEWAY_MS;
  return Math.max(Date.now() + 1000, refreshAt);
}

function cacheTokenFromResponse(payload: OAuthTokenResponse): OAuthAccessToken {
  const accessToken = toTrimmedString(payload.access_token ?? payload.accessToken);

  if (!accessToken) {
    throw new Error(
      "La réponse OAuth ne contient pas de champ 'access_token'.",
    );
  }

  const tokenType = toTrimmedString(payload.token_type ?? payload.tokenType) ?? 'Bearer';
  const expiresIn = parsePositiveInteger(
    payload.expires_in ?? payload.expiresIn ?? payload.maxAge ?? payload.max_age,
    FALLBACK_TTL_SECONDS,
  );
  const refreshAt = computeRefreshDeadline(expiresIn);
  refreshTimestamp = refreshAt;

  cachedToken = {
    token: accessToken,
    tokenType,
    scope: typeof payload.scope === 'string' ? payload.scope : undefined,
    refreshToken: toTrimmedString(payload.refresh_token ?? payload.refreshToken),
  };

  void persistTokenInStorage(cachedToken, refreshTimestamp);

  return cachedToken;
}

async function requestTokenEndpoint(payload: Record<string, string>): Promise<OAuthAccessToken> {
  const headers = buildTokenRequestHeaders();
  let response: Response;

  try {
    response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'erreur réseau inconnue';
    throw new Error(`Impossible de contacter l'endpoint /OAuth/token : ${detail}`);
  }

  if (!response.ok) {
    const detail = await parseOAuthError(response);
    const statusMessage = response.statusText || 'Réponse invalide';
    const suffix = detail ? ` ${detail}` : '';
    throw new Error(
      `Échange du jeton OAuth échoué (${response.status}) ${statusMessage}${suffix}`,
    );
  }

  let payloadResponse: OAuthTokenResponse;
  try {
    payloadResponse = (await response.json()) as OAuthTokenResponse;
  } catch {
    throw new Error('Réponse /OAuth/token invalide : impossible de lire le JSON.');
  }

  console.debug('[OAuth] Réponse /OAuth/token reçue.');

  return cacheTokenFromResponse(payloadResponse);
}

async function exchangeAuthorizationCodeForToken(code: string): Promise<OAuthAccessToken> {
  ensureClientCredentials();

  const payload: Record<string, string> = {
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
    grant_type: TOKEN_GRANT_TYPE,
    code,
  };

  if (REQUEST_SCOPE) {
    payload.scope = REQUEST_SCOPE;
  }

  return requestTokenEndpoint(payload);
}

async function refreshAccessTokenWithRefreshToken(
  refreshToken: string,
): Promise<OAuthAccessToken> {
  ensureClientCredentials();

  const payload: Record<string, string> = {
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
    grant_type: REFRESH_GRANT_TYPE,
    refresh_token: refreshToken,
  };

  if (REQUEST_SCOPE) {
    payload.scope = REQUEST_SCOPE;
  }

  return requestTokenEndpoint(payload);
}

async function requestNewToken(forceRefresh: boolean): Promise<OAuthAccessToken> {
  if (!forceRefresh) {
    const refreshToken = cachedToken?.refreshToken;

    if (refreshToken) {
      try {
        const refreshed = await refreshAccessTokenWithRefreshToken(refreshToken);
        return refreshed;
      } catch (error) {
        console.warn(
          '[OAuth] Impossible de rafraîchir le jeton, tentative de régénération complète :',
          error,
        );
        invalidateCachedOAuthToken();
      }
    }
  }

  const code = await requestAuthorizationCode();
  return exchangeAuthorizationCodeForToken(code);
}

export async function fetchAccessToken(forceRefresh = false): Promise<OAuthAccessToken> {
  await hydrateTokenFromStorage();

  if (shouldReuseToken(forceRefresh) && cachedToken) {
    return cachedToken;
  }

  if (!forceRefresh && pendingTokenRequest) {
    return pendingTokenRequest;
  }

  const request = requestNewToken(forceRefresh);
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

  if (requestUrl?.includes('/Api/v2.0/Dev/callDatabase')) {
    console.debug('[OAuth] Jeton OAuth appliqué pour un appel callDatabase.');
  }

  return fetch(input, authorizedInit);
}

export function invalidateCachedOAuthToken(): void {
  cachedToken = null;
  refreshTimestamp = 0;
  pendingTokenRequest = null;
  clearPersistedToken();
}
