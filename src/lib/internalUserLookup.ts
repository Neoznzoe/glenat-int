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

  const response = await fetch(INTERNAL_USER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Requête de synchronisation échouée (${response.status}) ${response.statusText}`);
  }

  try {
    console.log("Réponse brute :", response);
    return (await response.json()) as DatabaseUserLookupResponse;
  } catch (error) {
    console.warn('Réponse inattendue lors de la récupération utilisateur :', error);
    return null;
  }
}