import { prepareJsonBody } from './transportEncryption';

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

  const preparedBody = await prepareJsonBody({
    query: `SELECT * FROM users WHERE email = '${escapeSqlLiteral(trimmedEmail)}';`,
  });

  const response = await fetch(INTERNAL_USER_ENDPOINT, {
    method: 'POST',
    headers: preparedBody.headers,
    body: preparedBody.body,
  });

  if (!response.ok) {
    throw new Error(`Requête de synchronisation échouée (${response.status}) ${response.statusText}`);
  }

  try {
    return (await response.json()) as DatabaseUserLookupResponse;
  } catch {
    return null;
  }
}