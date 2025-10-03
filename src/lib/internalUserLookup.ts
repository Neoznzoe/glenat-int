import type { PermissionOverride } from './mockDb';

const INTERNAL_USER_ENDPOINT = import.meta.env.DEV
  ? '/intranet/call-database'
  : 'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase';

export interface DatabaseUserLookupResponse {
  success?: boolean;
  message?: string;
  result?: unknown;
  [key: string]: unknown;
}

export interface DatabaseUserRecordSummary {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  raw: Record<string, unknown>;
}

export interface InternalUserLookupResult {
  success: boolean;
  message?: string;
  user: DatabaseUserRecordSummary | null;
  permissionOverrides: PermissionOverride[];
  raw: DatabaseUserLookupResponse;
}

type RawRecord = Record<string, unknown>;

const USER_ID_KEYS = ['userId', 'UserId', 'userID', 'UserID', 'id', 'Id', 'ID'];
const EMAIL_KEYS = ['email', 'Email', 'EMAIL'];
const USERNAME_KEYS = ['username', 'userName', 'UserName'];
const FIRST_NAME_KEYS = ['firstName', 'FirstName', 'firstname', 'FIRSTNAME', 'first_name'];
const LAST_NAME_KEYS = ['lastName', 'LastName', 'lastname', 'LASTNAME', 'last_name'];
const DISPLAY_NAME_KEYS = ['displayName', 'DisplayName', 'name', 'Name'];
const PERMISSION_TYPE_KEYS = ['permissionType', 'PermissionType', 'type', 'Type'];
const PERMISSION_KEY_FIELDS = [
  'permissionKey',
  'PermissionKey',
  'permission_key',
  'permission',
  'Permission',
  'moduleKey',
  'ModuleKey',
  'module_key',
  'moduleSlug',
  'module_slug',
  'slug',
  'Slug',
  'key',
  'Key',
];
const CAN_VIEW_KEYS = ['canView', 'CanView', 'can_view', 'Can_View'];
const MODE_KEYS = ['mode', 'Mode', 'permissionMode', 'PermissionMode', 'access', 'Access'];

const escapeSqlLiteral = (value: string): string => value.replace(/'/g, "''");

function isPlainObject(value: unknown): value is RawRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  return undefined;
}

function toOptionalBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    if (value === 0) {
      return false;
    }
    if (value === 1) {
      return true;
    }
    return null;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    if (['1', 'true', 'oui', 'yes', 'on', 'allow', 'allowed', 'autoriser'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'non', 'no', 'off', 'deny', 'denied', 'refus', 'refuser'].includes(normalized)) {
      return false;
    }
  }
  return null;
}

function getValue(record: RawRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (key in record) {
      const value = record[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }
  return undefined;
}

function toRecordIdentifier(value: unknown): string | undefined {
  const stringValue = toNonEmptyString(value);
  if (stringValue) {
    return stringValue;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  return undefined;
}

function collectRecordsets(payload: unknown): RawRecord[][] {
  const recordsets: RawRecord[][] = [];
  const visited = new Set<unknown>();
  const queue: unknown[] = [payload];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || current === null) {
      continue;
    }
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (typeof current === 'string') {
      const trimmed = current.trim();
      if (trimmed) {
        try {
          queue.push(JSON.parse(trimmed));
        } catch {
          // ignore JSON parsing errors on raw strings
        }
      }
      continue;
    }

    if (Array.isArray(current)) {
      const objects = current.filter((item): item is RawRecord => isPlainObject(item));
      if (objects.length > 0) {
        recordsets.push(objects);
      }
      for (const entry of current) {
        if (Array.isArray(entry) || isPlainObject(entry)) {
          queue.push(entry);
        }
      }
      continue;
    }

    if (isPlainObject(current)) {
      const keysToInspect = [
        'result',
        'recordset',
        'Recordset',
        'recordsets',
        'Recordsets',
        'records',
        'rows',
        'data',
        'value',
        'values',
        'dataset',
      ];
      for (const key of keysToInspect) {
        if (key in current) {
          queue.push(current[key]);
        }
      }
    }
  }

  return recordsets;
}

function parseUserRecord(recordsets: RawRecord[][]): DatabaseUserRecordSummary | null {
  for (const records of recordsets) {
    for (const record of records) {
      const id = toRecordIdentifier(getValue(record, USER_ID_KEYS));
      if (!id) {
        continue;
      }

      const email = toNonEmptyString(getValue(record, EMAIL_KEYS));
      const username = toNonEmptyString(getValue(record, USERNAME_KEYS));
      const firstName = toNonEmptyString(getValue(record, FIRST_NAME_KEYS));
      const lastName = toNonEmptyString(getValue(record, LAST_NAME_KEYS));
      const explicitDisplayName = toNonEmptyString(getValue(record, DISPLAY_NAME_KEYS));
      const displayName =
        explicitDisplayName ||
        [firstName, lastName].filter(Boolean).join(' ').trim() ||
        username ||
        email;

      return {
        id,
        email,
        username,
        firstName,
        lastName,
        displayName: displayName || undefined,
        raw: record,
      } satisfies DatabaseUserRecordSummary;
    }
  }

  return null;
}

function normalizePermissionMode(record: RawRecord): PermissionOverride['mode'] | null {
  const canView = toOptionalBoolean(getValue(record, CAN_VIEW_KEYS));
  if (canView !== null) {
    return canView ? 'allow' : 'deny';
  }

  const modeValue = toNonEmptyString(getValue(record, MODE_KEYS));
  if (!modeValue) {
    return null;
  }

  const normalized = modeValue.trim().toLowerCase();
  if (['allow', 'allowed', 'autoriser', 'autorisé', 'autorisee'].includes(normalized)) {
    return 'allow';
  }
  if (['deny', 'denied', 'refus', 'refusé', 'refusee', 'forbid', 'forbidden'].includes(normalized)) {
    return 'deny';
  }

  return null;
}

function looksLikePermissionRecord(record: RawRecord): boolean {
  const keys = Object.keys(record).map((key) => key.toLowerCase());
  return keys.some((key) =>
    [
      'permissiontype',
      'permission_key',
      'permissionkey',
      'moduleid',
      'pageid',
      'canview',
      'permission',
      'modulekey',
      'module_slug',
    ].includes(key),
  );
}

function parsePermissionOverrides(recordsets: RawRecord[][]): PermissionOverride[] {
  const overrides = new Map<string, PermissionOverride['mode']>();

  for (const records of recordsets) {
    for (const record of records) {
      if (!looksLikePermissionRecord(record)) {
        continue;
      }

      const typeValue = toNonEmptyString(getValue(record, PERMISSION_TYPE_KEYS));
      if (typeValue && typeValue.trim().toUpperCase() !== 'MODULE') {
        continue;
      }

      const keyCandidate = toNonEmptyString(getValue(record, PERMISSION_KEY_FIELDS));
      if (!keyCandidate) {
        continue;
      }

      const mode = normalizePermissionMode(record);
      if (!mode) {
        continue;
      }

      overrides.set(keyCandidate, mode);
    }
  }

  return Array.from(overrides.entries()).map(([key, mode]) => ({ key, mode }));
}

export function parseDatabaseUserLookupResponse(
  payload: DatabaseUserLookupResponse,
): InternalUserLookupResult {
  const recordsets = collectRecordsets(payload);
  const user = parseUserRecord(recordsets);
  const permissionOverrides = parsePermissionOverrides(recordsets);

  return {
    success: payload.success !== false,
    message: payload.message,
    user,
    permissionOverrides,
    raw: payload,
  } satisfies InternalUserLookupResult;
}

export async function lookupInternalUserByEmail(
  email: string,
): Promise<InternalUserLookupResult | null> {
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
    const raw = (await response.json()) as DatabaseUserLookupResponse;
    return parseDatabaseUserLookupResponse(raw);
  } catch (error) {
    console.warn('Réponse inattendue lors de la récupération utilisateur :', error);
    return null;
  }
}
