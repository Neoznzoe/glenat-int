import { fetchWithOAuth } from './oauth';
import { applySecurePayloadHeaders, prepareSecureJsonPayload } from './securePayload';

const INTERNAL_USER_ENDPOINT = import.meta.env.DEV
  ? '/intranet/call-database'
  : 'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase';

export interface DatabaseUserLookupResponse {
  success?: boolean;
  message?: string;
  result?: unknown;
  [key: string]: unknown;
}

const escapeSqlLiteral = (value: string): string => value.replace(/'/g, "''");

export async function lookupInternalUserByEmail(
  email: string,
): Promise<DatabaseUserLookupResponse | null> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return null;
  }

  const payload = {
    query: `SELECT * FROM users WHERE email = '${escapeSqlLiteral(trimmedEmail)}';`,
  };

  const securePayload = await prepareSecureJsonPayload(payload);
  const headers = new Headers({ 'Content-Type': 'application/json' });
  applySecurePayloadHeaders(headers, securePayload.encrypted);

  const response = await fetchWithOAuth(INTERNAL_USER_ENDPOINT, {
    method: 'POST',
    headers,
    body: securePayload.body,
  });

  if (!response.ok) {
    throw new Error(`Requête de synchronisation échouée (${response.status}) ${response.statusText}`);
  }

  try {
    return (await response.json()) as DatabaseUserLookupResponse;
  } catch (error) {
    console.warn('Réponse inattendue lors de la récupération utilisateur :', error);
    return null;
  }
}