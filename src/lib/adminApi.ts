import {
  type AuditLogEntry,
  type PermissionOverride,
  type UpdateUserAccessPayload,
  type UserAccount,
} from './adminAccess';
import { type GroupDefinition, type PermissionDefinition } from './access-control';
import { encryptUrlPayload, isUrlEncryptionConfigured } from './urlEncryption';

const DATABASE_ENDPOINT = import.meta.env.DEV
  ? '/intranet/call-database'
  : 'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase';

const LIST_USERS_QUERY = 'SELECT * FROM [users];';

interface DatabaseQueryResponse {
  success?: boolean;
  message?: string;
  result?: unknown;
  data?: unknown;
  rows?: unknown;
  recordset?: unknown;
  Recordset?: unknown;
  recordsets?: unknown;
  [key: string]: unknown;
}

type RawDatabaseRow = Record<string, unknown>;

function toRecordArray(value: unknown): RawDatabaseRow[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is RawDatabaseRow => Boolean(item) && typeof item === 'object');
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return toRecordArray(parsed);
    } catch {
      return [];
    }
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    const nestedCandidates = [
      objectValue.rows,
      objectValue.result,
      objectValue.data,
      objectValue.recordset,
      objectValue.Recordset,
    ];

    for (const candidate of nestedCandidates) {
      const array = toRecordArray(candidate);
      if (array.length) {
        return array;
      }
    }

    if (Array.isArray(objectValue.recordsets)) {
      const [first] = objectValue.recordsets as unknown[];
      const array = toRecordArray(first);
      if (array.length) {
        return array;
      }
    }
  }

  return [];
}

function extractDatabaseRows(response: DatabaseQueryResponse): RawDatabaseRow[] {
  const candidates = [
    response.result,
    response.data,
    response.rows,
    response.recordset,
    response.Recordset,
    response,
  ];

  for (const candidate of candidates) {
    const rows = toRecordArray(candidate);
    if (rows.length) {
      return rows;
    }
  }

  return [];
}

async function executeDatabaseQuery(query: string): Promise<RawDatabaseRow[]> {
  const response = await fetch(DATABASE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(
      `Requête base de données échouée (${response.status}) ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as DatabaseQueryResponse;

  if (payload.success === false) {
    const detail = typeof payload.message === 'string' ? payload.message : 'Requête SQL échouée';
    throw new Error(detail);
  }

  return extractDatabaseRows(payload);
}

const ensureString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return null;
};

const ensureStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => ensureString(item))
      .filter((item): item is string => Boolean(item));
  }
  if (typeof value === 'string') {
    return value
      .split(/[;,]/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
};

const ensureIsoDate = (value: unknown): string | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsedNumber = Number(trimmed);
    if (Number.isFinite(parsedNumber)) {
      return new Date(parsedNumber).toISOString();
    }

    const parsedDate = new Date(trimmed);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }
  return null;
};

const toBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return null;
    }
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    if (['1', 'true', 'yes', 'oui', 'vrai'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'no', 'non', 'faux'].includes(normalized)) {
      return false;
    }
  }
  return null;
};

function normalizeUserRecord(record: RawDatabaseRow): UserAccount | null {
  const id =
    ensureString(record.userId) ??
    ensureString(record.userID) ??
    ensureString(record.UserId) ??
    ensureString(record.id) ??
    ensureString(record.ID);

  if (!id) {
    return null;
  }

  const firstName =
    ensureString(record.firstName) ??
    ensureString(record.firstname) ??
    ensureString(record.FirstName) ??
    '';
  const lastName =
    ensureString(record.lastName) ??
    ensureString(record.lastname) ??
    ensureString(record.LastName) ??
    '';

  const email =
    ensureString(record.email) ??
    ensureString(record.Email) ??
    ensureString(record.mail) ??
    '';

  const fallbackNameParts = [firstName, lastName].filter(Boolean);
  const displayName =
    ensureString(record.displayName) ??
    ensureString(record.DisplayName) ??
    ensureString(record.fullName) ??
    ensureString(record.FullName) ??
    ensureString(record.username) ??
    ensureString(record.userName) ??
    ensureString(record.UserName) ??
    (fallbackNameParts.length ? fallbackNameParts.join(' ') : email || `Utilisateur ${id}`);

  const statusCandidate = ensureString(record.status) ?? ensureString(record.Status);
  const normalizedStatus = statusCandidate ? statusCandidate.toLowerCase() : 'active';
  const status: 'active' | 'inactive' =
    normalizedStatus.includes('inact') || normalizedStatus.includes('disable')
      ? 'inactive'
      : 'active';

  const jobTitle =
    ensureString(record.jobTitle) ??
    ensureString(record.JobTitle) ??
    ensureString(record.title) ??
    ensureString(record.function) ??
    ensureString(record.role) ??
    undefined;

  const department =
    ensureString(record.department) ??
    ensureString(record.Department) ??
    ensureString(record.service) ??
    ensureString(record.team) ??
    undefined;

  const location =
    ensureString(record.location) ??
    ensureString(record.Location) ??
    ensureString(record.office) ??
    ensureString(record.officeLocation) ??
    undefined;

  const phoneNumber =
    ensureString(record.phoneNumber) ??
    ensureString(record.PhoneNumber) ??
    ensureString(record.phone) ??
    ensureString(record.telephone) ??
    undefined;

  const azureOid =
    ensureString(record.azureOid) ??
    ensureString(record.AzureOid) ??
    ensureString(record.azureObjectId) ??
    ensureString(record.azure_oid) ??
    undefined;

  const azureUpn =
    ensureString(record.azureUpn) ??
    ensureString(record.AzureUpn) ??
    ensureString(record.userPrincipalName) ??
    ensureString(record.username) ??
    undefined;

  const lastConnection = ensureIsoDate(
    record.lastConnection ??
      record.lastConnexion ??
      record.lastLogin ??
      record.lastSeen ??
      record.lastAccess ??
      record.last_access ??
      record.lastConnectionAt,
  );

  const createdAt = ensureIsoDate(
    record.createdAt ??
      record.CreatedAt ??
      record.creationDate ??
      record.createdOn ??
      record.created_at,
  );

  const updatedAt = ensureIsoDate(
    record.updatedAt ??
      record.UpdatedAt ??
      record.modifiedAt ??
      record.updatedOn ??
      record.lastUpdate ??
      record.updated_at,
  );

  const groups = ensureStringArray(
    record.groups ??
      record.groupIds ??
      record.groupId ??
      record.group_id ??
      record.group_codes ??
      record.groupNames,
  );

  const isSuperAdminValue =
    toBoolean(record.isSuperAdmin) ??
    toBoolean(record.is_superadmin) ??
    toBoolean(record.is_admin) ??
    toBoolean(record.superAdmin);

  return {
    id,
    firstName,
    lastName,
    displayName,
    email,
    azureOid: azureOid ?? undefined,
    azureUpn: azureUpn ?? undefined,
    jobTitle,
    department,
    location,
    phoneNumber,
    status,
    lastConnection: lastConnection ?? undefined,
    createdAt: createdAt ?? undefined,
    updatedAt: updatedAt ?? undefined,
    groups,
    permissionOverrides: [],
    isSuperAdmin: isSuperAdminValue ?? undefined,
  } satisfies UserAccount;
}

async function withEncryptedUrl(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ input: RequestInfo | URL; init?: RequestInit }> {
  if (typeof window === 'undefined' || !isUrlEncryptionConfigured()) {
    return { input, init };
  }

  const resolveUrl = (target: string | URL): URL =>
    target instanceof URL ? target : new URL(target.toString(), window.location.origin);

  const methodFromInit = (requestInit?: RequestInit): string =>
    (requestInit?.method ?? 'GET').toUpperCase();

  if (input instanceof Request) {
    const requestUrl = resolveUrl(input.url);
    if (requestUrl.origin !== window.location.origin) {
      return { input, init };
    }

    const method = (input.method ?? 'GET').toUpperCase();
    const token = await encryptUrlPayload({
      path: requestUrl.pathname,
      search: requestUrl.search,
      method,
    });

    let body: BodyInit | null | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      body = await input.clone().text();
    }

    const headers = new Headers();
    input.headers.forEach((value, key) => {
      headers.append(key, value);
    });

    const encryptedInit: RequestInit = {
      method,
      headers,
      body,
      cache: input.cache,
      credentials: input.credentials,
      integrity: input.integrity,
      keepalive: input.keepalive,
      mode: input.mode,
      redirect: input.redirect,
      referrer: input.referrer,
      referrerPolicy: input.referrerPolicy,
      signal: input.signal,
    };

    return { input: `/secure/${token}`, init: encryptedInit };
  }

  const url = resolveUrl(input);

  if (url.origin !== window.location.origin) {
    return { input, init };
  }

  const method = methodFromInit(init);
  const token = await encryptUrlPayload({ path: url.pathname, search: url.search, method });

  return { input: `/secure/${token}`, init };
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const encrypted = await withEncryptedUrl(input, init);
  const response = await fetch(encrypted.input, encrypted.init);
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) {
        detail = data.message;
      }
    } catch {
      // ignore json parse errors
    }
    throw new Error(detail || 'Requête échouée');
  }
  return (await response.json()) as T;
}

export async function fetchUsers(): Promise<UserAccount[]> {
  const rows = await executeDatabaseQuery(LIST_USERS_QUERY);
  const normalized = rows
    .map((row) => normalizeUserRecord(row))
    .filter((user): user is UserAccount => Boolean(user));

  return normalized.sort((left, right) =>
    left.displayName.localeCompare(right.displayName, 'fr', { sensitivity: 'base' }),
  );
}

export async function fetchGroups(): Promise<GroupDefinition[]> {
  return requestJson<GroupDefinition[]>('/api/admin/groups');
}

export async function fetchPermissions(): Promise<PermissionDefinition[]> {
  return requestJson<PermissionDefinition[]>('/api/admin/permissions');
}

export async function fetchAuditLog(limit = 25): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  return requestJson<AuditLogEntry[]>(`/api/admin/audit-log?${params.toString()}`);
}

export async function fetchCurrentUser(): Promise<UserAccount> {
  return requestJson<UserAccount>('/api/admin/current-user');
}

export async function persistUserAccess(
  payload: UpdateUserAccessPayload,
): Promise<UserAccount> {
  const { userId, ...body } = payload;
  return requestJson<UserAccount>(`/api/admin/users/${encodeURIComponent(userId)}/access`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export type { UserAccount, PermissionOverride, AuditLogEntry, UpdateUserAccessPayload };
