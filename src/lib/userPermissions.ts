const USER_PERMISSIONS_ENDPOINT = import.meta.env.DEV
  ? '/intranet/call-database'
  : 'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase';

const USER_PERMISSIONS_QUERY = 'SELECT * FROM [userPermissions];';

export interface RawUserPermissionRecord {
  [key: string]: unknown;
}

export interface UserPermissionRecord {
  id: string;
  userId: string;
  permissionType: string;
  moduleId?: string;
  canView: boolean | null;
  metadata?: Record<string, unknown>;
}

interface DatabaseUserPermissionsResponse {
  success?: boolean;
  message?: string;
  result?: unknown;
  data?: unknown;
  rows?: unknown;
  recordset?: unknown;
  Recordset?: unknown;
  recordsets?: unknown;
  records?: unknown;
  [key: string]: unknown;
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  return undefined;
}

function toRecordIdentifier(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
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
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    if (['1', 'true', 'yes', 'oui', 'allow', 'autoriser'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'no', 'non', 'deny', 'refuser'].includes(normalized)) {
      return false;
    }
  }
  return null;
}

function extractArray(payload: unknown): RawUserPermissionRecord[] {
  const tryParse = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input;
    }
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input) as unknown;
        return tryParse(parsed);
      } catch {
        return [];
      }
    }
    if (input && typeof input === 'object') {
      const objectPayload = input as Record<string, unknown>;
      if (Array.isArray(objectPayload.rows)) {
        return objectPayload.rows;
      }
      if (Array.isArray(objectPayload.data)) {
        return objectPayload.data;
      }
      if (Array.isArray(objectPayload.result)) {
        return objectPayload.result;
      }
      if (Array.isArray(objectPayload.recordset)) {
        return objectPayload.recordset;
      }
      if (Array.isArray(objectPayload.Recordset)) {
        return objectPayload.Recordset;
      }
      if (Array.isArray(objectPayload.recordsets)) {
        const [first] = objectPayload.recordsets as unknown[];
        if (Array.isArray(first)) {
          return first;
        }
      }
      if ('records' in objectPayload && Array.isArray(objectPayload.records)) {
        return objectPayload.records;
      }
    }
    return [];
  };

  const arrayCandidate = tryParse(payload);
  return Array.isArray(arrayCandidate)
    ? (arrayCandidate.filter((item) => item && typeof item === 'object') as RawUserPermissionRecord[])
    : [];
}

function normalizePermissionType(value: unknown): string {
  const raw = toNonEmptyString(value);
  if (!raw) {
    return 'module';
  }
  return raw.trim().toLowerCase();
}

function normalizeUserPermission(
  record: RawUserPermissionRecord,
  index: number,
): UserPermissionRecord | null {
  const id =
    toRecordIdentifier(record.permissionId ?? (record as Record<string, unknown>).PermissionId) ??
    `permission-${index + 1}`;
  const userId =
    toRecordIdentifier(record.userId ?? (record as Record<string, unknown>).UserId ?? record.userID ?? (record as Record<string, unknown>).UserID) ??
    undefined;
  if (!userId) {
    return null;
  }

  const permissionType = normalizePermissionType(
    record.permissionType ?? (record as Record<string, unknown>).PermissionType,
  );
  const moduleId =
    toRecordIdentifier(record.moduleId ?? (record as Record<string, unknown>).ModuleId ?? record.moduleID ?? (record as Record<string, unknown>).ModuleID) ??
    undefined;
  const canView = toOptionalBoolean(record.canView ?? (record as Record<string, unknown>).CanView);

  const knownKeys = new Set([
    'permissionId',
    'PermissionId',
    'permissionID',
    'PermissionID',
    'userId',
    'UserId',
    'userID',
    'UserID',
    'permissionType',
    'PermissionType',
    'moduleId',
    'ModuleId',
    'moduleID',
    'ModuleID',
    'canView',
    'CanView',
    'can_view',
    'Can_View',
  ]);

  const metadataEntries = Object.entries(record).filter(([key]) => !knownKeys.has(key));
  const metadata = metadataEntries.length ? Object.fromEntries(metadataEntries) : undefined;

  return {
    id,
    userId,
    permissionType,
    moduleId,
    canView,
    metadata,
  };
}

function toDatabaseUserId(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (!/^[0-9]+$/.test(trimmed)) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isSafeInteger(parsed)) {
    return null;
  }
  return String(parsed);
}

function buildUserPermissionsQuery(userId?: string): string {
  const databaseUserId = toDatabaseUserId(userId);
  if (!databaseUserId) {
    return USER_PERMISSIONS_QUERY;
  }

  return [
    'SET NOCOUNT ON;',
    'SELECT *',
    'FROM [userPermissions]',
    `WHERE [userId] = ${databaseUserId}`,
    "  AND UPPER(LTRIM(RTRIM([permissionType]))) = 'MODULE';",
  ].join('\n');
}

export async function fetchUserPermissions(
  userId?: string,
): Promise<UserPermissionRecord[]> {
  const query = buildUserPermissionsQuery(userId);

  const response = await fetch(USER_PERMISSIONS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(
      `La récupération des permissions utilisateurs a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as DatabaseUserPermissionsResponse;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des permissions utilisateurs a échoué.');
  }

  let rawRecords = extractArray(data.result);
  if (!rawRecords.length) {
    rawRecords = extractArray(data.data);
  }
  if (!rawRecords.length) {
    rawRecords = extractArray(data.rows);
  }
  if (!rawRecords.length) {
    rawRecords = extractArray(data);
  }

  const permissions: UserPermissionRecord[] = [];
  rawRecords.forEach((record, index) => {
    const normalized = normalizeUserPermission(record, index);
    if (normalized) {
      permissions.push(normalized);
    }
  });

  return permissions;
}

export const USER_PERMISSIONS_QUERY_KEY = ['user-permissions'] as const;

export { USER_PERMISSIONS_ENDPOINT, USER_PERMISSIONS_QUERY };
