import {
  type AuditLogEntry,
  type PermissionOverride,
  type UpdateUserAccessPayload,
  type UserAccount,
} from './mockDb';
import {
  GROUP_DEFINITIONS,
  type GroupDefinition,
  type PermissionDefinition,
} from './access-control';
import { encryptUrlPayload, isUrlEncryptionConfigured } from './urlEncryption';

const ADMIN_DATABASE_ENDPOINT = import.meta.env.DEV
  ? '/intranet/call-database'
  : 'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase';

const ADMIN_USERS_QUERY = 'SELECT * FROM [users];';
const ADMIN_GROUPS_QUERY = 'SELECT [groupId], [groupName] FROM [userGroups];';
const ADMIN_GROUP_MEMBERS_QUERY = 'SELECT [userId], [groupId] FROM [userGroupMembers];';
const DEFAULT_GROUP_DESCRIPTION =
  'Groupe métier personnalisé créé depuis l’interface d’administration.';

const ACCENT_COLOR_CLASSES = [
  'bg-slate-500/10 text-slate-600 border-slate-200',
  'bg-rose-500/10 text-rose-600 border-rose-200',
  'bg-sky-500/10 text-sky-600 border-sky-200',
  'bg-amber-500/10 text-amber-600 border-amber-200',
  'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  'bg-indigo-500/10 text-indigo-600 border-indigo-200',
  'bg-violet-500/10 text-violet-600 border-violet-200',
  'bg-orange-500/10 text-orange-600 border-orange-200',
  'bg-lime-500/10 text-lime-600 border-lime-200',
  'bg-cyan-500/10 text-cyan-600 border-cyan-200',
];

const STATIC_GROUP_DEFINITIONS_BY_NAME = new Map(
  GROUP_DEFINITIONS.map((group) => [group.name.trim().toLowerCase(), group]),
);

interface DatabaseQueryResponse {
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

type RawDatabaseRecord = Record<string, unknown>;

function getValue(record: RawDatabaseRecord, keys: string[]): unknown {
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

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function normalizeDateValue(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const timestamp = Date.parse(trimmed);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toISOString();
    }
  }
  return null;
}

function normalizeGroups(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => toNonEmptyString(entry))
      .filter((entry): entry is string => Boolean(entry));
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;]+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }
  return [];
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function computeAccentColor(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return ACCENT_COLOR_CLASSES[hash % ACCENT_COLOR_CLASSES.length];
}

function extractDatabaseRecords(payload: unknown): RawDatabaseRecord[] {
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

    if (Array.isArray(current)) {
      const records = current.filter(
        (item): item is RawDatabaseUserRecord => item !== null && typeof item === 'object' && !Array.isArray(item),
      );
      if (records.length) {
        return records;
      }
      continue;
    }

    if (typeof current === 'string') {
      try {
        const parsed = JSON.parse(current) as unknown;
        queue.push(parsed);
      } catch {
        // ignore parse errors
      }
      continue;
    }

    if (typeof current === 'object') {
      const objectPayload = current as Record<string, unknown>;
      const keysToInspect = ['rows', 'data', 'result', 'recordset', 'Recordset', 'records'];
      for (const key of keysToInspect) {
        if (key in objectPayload) {
          queue.push(objectPayload[key]);
        }
      }
      if (Array.isArray(objectPayload.recordsets)) {
        for (const entry of objectPayload.recordsets as unknown[]) {
          queue.push(entry);
        }
      }
    }
  }

  return [];
}

function normalizeGroupRecord(record: RawDatabaseRecord, index: number): GroupDefinition {
  const numericId = toNumber(getValue(record, ['groupId', 'GroupId', 'id', 'ID']));
  const idString =
    toNonEmptyString(getValue(record, ['groupId', 'GroupId', 'id', 'ID'])) ??
    (numericId !== undefined ? numericId.toString() : undefined);
  const id = idString ?? `group-${index + 1}`;

  const name =
    toNonEmptyString(getValue(record, ['groupName', 'GroupName', 'name'])) ?? `Groupe ${id}`;
  const normalizedName = normalizeKey(name);
  const staticDefinition = name ? STATIC_GROUP_DEFINITIONS_BY_NAME.get(normalizedName) : undefined;

  const description =
    toNonEmptyString(getValue(record, ['groupDescription', 'description'])) ??
    staticDefinition?.description ??
    DEFAULT_GROUP_DESCRIPTION;

  const accentColor = staticDefinition?.accentColor ?? computeAccentColor(id);
  const defaultPermissions = staticDefinition?.defaultPermissions ?? [];

  return { id, name, description, defaultPermissions, accentColor };
}

function normalizeGroupMembership(records: RawDatabaseRecord[]): Map<number, string[]> {
  const membership = new Map<number, Set<string>>();

  for (const record of records) {
    const userId = toNumber(getValue(record, ['userId', 'UserId', 'user_id']));
    const groupId = toNumber(getValue(record, ['groupId', 'GroupId', 'group_id']));

    if (userId === undefined || groupId === undefined) {
      continue;
    }

    if (!membership.has(userId)) {
      membership.set(userId, new Set());
    }

    membership.get(userId)!.add(groupId.toString());
  }

  const result = new Map<number, string[]>();
  for (const [userId, groups] of membership.entries()) {
    result.set(userId, Array.from(groups).sort((left, right) => Number(left) - Number(right)));
  }

  return result;
}

async function sendDatabaseQuery(sql: string): Promise<DatabaseQueryResponse> {
  let response: Response;
  try {
    response = await fetch(ADMIN_DATABASE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Erreur réseau inconnue';
    throw new Error(`Impossible de contacter la base de données : ${detail}`);
  }

  if (!response.ok) {
    throw new Error(`Requête SQL échouée (${response.status}) ${response.statusText}`);
  }

  let payload: DatabaseQueryResponse;
  try {
    payload = (await response.json()) as DatabaseQueryResponse;
  } catch {
    throw new Error('Réponse inattendue lors de l’exécution de la requête.');
  }

  if (payload.success === false) {
    const detail = payload.message ?? 'La récupération des données a échoué.';
    throw new Error(detail);
  }

  return payload;
}

async function runDatabaseQuery(sql: string): Promise<RawDatabaseRecord[]> {
  const payload = await sendDatabaseQuery(sql);
  return extractDatabaseRecords(payload.result ?? payload.data ?? payload.rows ?? payload);
}

function normalizeUserRecord(
  record: RawDatabaseRecord,
  index: number,
  fallbackTimestamp: string,
): UserAccount {
  const numericId = toNumber(
    getValue(record, ['userId', 'userID', 'UserId', 'UserID', 'id', 'ID', 'Id']),
  );
  const stringId =
    toNonEmptyString(getValue(record, ['userId', 'userID', 'UserId', 'UserID', 'id', 'ID', 'Id'])) ??
    (numericId !== undefined ? numericId.toString() : undefined);
  const id = stringId ?? `user-${index + 1}`;

  const firstName =
    toNonEmptyString(
      getValue(record, ['firstName', 'firstname', 'FirstName', 'FIRSTNAME', 'first_name']),
    ) ?? '';
  const lastName =
    toNonEmptyString(
      getValue(record, ['lastName', 'lastname', 'LastName', 'LASTNAME', 'last_name']),
    ) ?? '';
  const username = toNonEmptyString(getValue(record, ['username', 'userName', 'UserName']));
  const email = toNonEmptyString(getValue(record, ['email', 'Email', 'EMAIL']));

  const composedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const displayName = composedName || username || email || `Utilisateur ${id}`;

  const azureUpn =
    toNonEmptyString(getValue(record, ['azureUpn', 'azure_upn', 'azureUPN'])) ?? email ?? username ?? '';
  const azureOid =
    toNonEmptyString(getValue(record, ['azureOid', 'azure_oid', 'azureOID'])) ?? id;

  const jobTitle =
    toNonEmptyString(getValue(record, ['jobTitle', 'job_title', 'title', 'fonction'])) ?? '';
  const department =
    toNonEmptyString(getValue(record, ['department', 'departement', 'service', 'division'])) ?? '';
  const location =
    toNonEmptyString(getValue(record, ['location', 'ville', 'city', 'site', 'bureau'])) ?? '';
  const phoneNumber =
    toNonEmptyString(getValue(record, ['phoneNumber', 'phone', 'telephone', 'tel', 'mobile'])) ?? '';

  const statusValue = getValue(record, ['status', 'active', 'isActive', 'etat', 'state']);
  let status: 'active' | 'inactive' = 'active';
  if (typeof statusValue === 'string') {
    const normalized = statusValue.trim().toLowerCase();
    if (['inactive', 'inactif', '0', 'false', 'off', 'désactivé', 'desactive'].includes(normalized)) {
      status = 'inactive';
    } else if (['active', 'actif', '1', 'true', 'on'].includes(normalized)) {
      status = 'active';
    }
  } else if (typeof statusValue === 'number') {
    status = statusValue === 0 ? 'inactive' : 'active';
  } else if (typeof statusValue === 'boolean') {
    status = statusValue ? 'active' : 'inactive';
  }

  const lastConnection =
    normalizeDateValue(
      getValue(record, [
        'lastConnection',
        'last_connection',
        'lastLogin',
        'last_login',
        'lastSeen',
        'last_seen',
      ]),
    ) ?? fallbackTimestamp;
  const createdAt =
    normalizeDateValue(
      getValue(record, ['createdAt', 'created_at', 'created', 'creationDate', 'createdDate']),
    ) ?? fallbackTimestamp;
  const updatedAt =
    normalizeDateValue(
      getValue(record, ['updatedAt', 'updated_at', 'updated', 'updateDate', 'modifiedAt', 'modified_at']),
    ) ?? createdAt;

  const groups = normalizeGroups(getValue(record, ['groups', 'groupIds', 'group_ids']));

  const user: UserAccount = {
    id,
    firstName: firstName || displayName,
    lastName,
    displayName,
    email: email ?? '',
    username,
    azureOid,
    azureUpn,
    jobTitle,
    department,
    location,
    phoneNumber,
    status,
    lastConnection,
    createdAt,
    updatedAt,
    groups,
    permissionOverrides: [],
  };

  if (numericId !== undefined) {
    user.databaseId = numericId;
  }

  const preferredLanguage = toNonEmptyString(
    getValue(record, ['preferedLanguage', 'preferredLanguage', 'language']),
  );
  const preferredTheme = toNonEmptyString(
    getValue(record, ['preferedTheme', 'preferredTheme', 'theme']),
  );
  const photoUrl = toNonEmptyString(getValue(record, ['photoSD', 'photo', 'avatar', 'picture']));

  if (preferredLanguage) {
    user.preferredLanguage = preferredLanguage;
  }
  if (preferredTheme) {
    user.preferredTheme = preferredTheme;
  }
  if (photoUrl) {
    user.photoUrl = photoUrl;
  }

  const superAdminValue = getValue(record, ['isSuperAdmin', 'superAdmin', 'is_admin', 'admin']);
  if (typeof superAdminValue === 'boolean') {
    user.isSuperAdmin = superAdminValue;
  } else if (typeof superAdminValue === 'number') {
    user.isSuperAdmin = superAdminValue !== 0;
  } else if (typeof superAdminValue === 'string') {
    const normalized = superAdminValue.trim().toLowerCase();
    if (['true', '1', 'yes', 'oui'].includes(normalized)) {
      user.isSuperAdmin = true;
    } else if (['false', '0', 'no', 'non'].includes(normalized)) {
      user.isSuperAdmin = false;
    }
  }

  return user;
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
  const [userRecords, membershipRecords] = await Promise.all([
    runDatabaseQuery(ADMIN_USERS_QUERY),
    runDatabaseQuery(ADMIN_GROUP_MEMBERS_QUERY),
  ]);

  const membershipByUserId = normalizeGroupMembership(membershipRecords);
  const fallbackTimestamp = '';

  const users = userRecords.map((record, index) => {
    const user = normalizeUserRecord(record, index, fallbackTimestamp);
    const numericId =
      user.databaseId ??
      toNumber(getValue(record, ['userId', 'userID', 'UserId', 'UserID', 'id', 'ID', 'Id']));

    const groupIds =
      (numericId !== undefined && membershipByUserId.get(numericId)) ??
      membershipByUserId.get(Number.parseInt(user.id, 10));

    if (groupIds) {
      user.groups = [...groupIds];
    }

    return user;
  });

  users.sort((left, right) =>
    left.displayName.localeCompare(right.displayName, 'fr', { sensitivity: 'base' }),
  );

  return users;
}

export async function fetchGroups(): Promise<GroupDefinition[]> {
  const records = await runDatabaseQuery(ADMIN_GROUPS_QUERY);
  const groups = records.map((record, index) => normalizeGroupRecord(record, index));

  groups.sort((left, right) => left.name.localeCompare(right.name, 'fr', { sensitivity: 'base' }));

  return groups;
}

export async function createGroup(name: string): Promise<GroupDefinition> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Le nom du groupe est requis.');
  }

  const escapedName = escapeSqlLiteral(trimmedName);
  const insertQuery = `
    INSERT INTO [userGroups] ([groupName])
    OUTPUT INSERTED.[groupId], INSERTED.[groupName]
    VALUES ('${escapedName}');
  `;

  const records = await runDatabaseQuery(insertQuery);
  if (!records.length) {
    throw new Error('La création du groupe a échoué : aucune ligne retournée.');
  }

  const [record] = records;
  return normalizeGroupRecord({ ...record, groupName: trimmedName }, 0);
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
  const numericUserId = Number.parseInt(payload.userId, 10);
  if (!Number.isFinite(numericUserId)) {
    throw new Error("Identifiant utilisateur invalide : impossible de synchroniser les groupes.");
  }

  const sanitizedGroupIds = Array.from(
    new Set(
      payload.groups
        .map((groupId) => Number.parseInt(groupId, 10))
        .filter((value) => Number.isFinite(value)),
    ),
  ) as number[];

  const valuesClause = sanitizedGroupIds
    .map((groupId) => `(${numericUserId}, ${groupId})`)
    .join(',\n        ');

  const statements = [
    'BEGIN TRY',
    '  BEGIN TRANSACTION;',
    `    DELETE FROM [userGroupMembers] WHERE [userId] = ${numericUserId};`,
    valuesClause ? `    INSERT INTO [userGroupMembers] ([userId], [groupId]) VALUES ${valuesClause};` : '',
    '  COMMIT TRANSACTION;',
    'END TRY',
    'BEGIN CATCH',
    '  IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;',
    '  THROW;',
    'END CATCH;',
  ]
    .filter(Boolean)
    .join('\n');

  await sendDatabaseQuery(statements);

  const users = await fetchUsers();
  const updatedUser =
    users.find((candidate) => candidate.databaseId === numericUserId) ??
    users.find((candidate) => candidate.id === payload.userId);

  if (!updatedUser) {
    throw new Error('Utilisateur mis à jour introuvable après synchronisation.');
  }

  return {
    ...updatedUser,
    permissionOverrides: [...(payload.permissionOverrides ?? [])],
  };
}

export type { UserAccount, PermissionOverride, AuditLogEntry, UpdateUserAccessPayload };
