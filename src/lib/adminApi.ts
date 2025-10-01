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
const ADMIN_USER_GROUP_MEMBERS_QUERY = 'SELECT [userId], [groupId] FROM [userGroupMembers];';

const GROUP_ACCENT_CLASSES = [
  'bg-primary/10 text-primary border-primary/40',
  'bg-sky-500/10 text-sky-600 border-sky-200',
  'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  'bg-amber-500/10 text-amber-600 border-amber-200',
  'bg-rose-500/10 text-rose-600 border-rose-200',
  'bg-violet-500/10 text-violet-600 border-violet-200',
];

function computeGroupAccent(id: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const normalized = Math.abs(hash) + index;
  return GROUP_ACCENT_CLASSES[normalized % GROUP_ACCENT_CLASSES.length];
}

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

type RawDatabaseUserRecord = Record<string, unknown>;

async function sendDatabaseQuery(query: string): Promise<DatabaseQueryResponse> {
  let response: Response;
  try {
    response = await fetch(ADMIN_DATABASE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
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
    throw new Error('Réponse inattendue lors de la récupération des données.');
  }

  if (payload.success === false) {
    const detail = payload.message ?? "La récupération des données a échoué.";
    throw new Error(detail);
  }

  return payload;
}

function extractRecords(payload: DatabaseQueryResponse): RawDatabaseUserRecord[] {
  return extractDatabaseRecords(payload.result ?? payload.data ?? payload.rows ?? payload);
}

function getValue(record: RawDatabaseUserRecord, keys: string[]): unknown {
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

function extractDatabaseRecords(payload: unknown): RawDatabaseUserRecord[] {
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

function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function normalizeUserRecord(
  record: RawDatabaseUserRecord,
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
  const [usersResult, membershipsResult] = await Promise.allSettled([
    sendDatabaseQuery(ADMIN_USERS_QUERY),
    sendDatabaseQuery(ADMIN_USER_GROUP_MEMBERS_QUERY),
  ]);

  if (usersResult.status !== 'fulfilled') {
    throw usersResult.reason instanceof Error
      ? usersResult.reason
      : new Error('La récupération des utilisateurs a échoué.');
  }

  const records = extractRecords(usersResult.value);
  let memberships: RawDatabaseUserRecord[] = [];
  if (membershipsResult.status === 'fulfilled') {
    memberships = extractRecords(membershipsResult.value);
  }

  const groupsByUser = new Map<string, string[]>();
  for (const entry of memberships) {
    const numericUserId = toNumber(getValue(entry, ['userId', 'userID', 'UserId', 'UserID']));
    const numericGroupId = toNumber(getValue(entry, ['groupId', 'groupID', 'GroupId', 'GroupID']));
    if (numericUserId === undefined || numericGroupId === undefined) {
      continue;
    }
    const userKey = String(numericUserId);
    const groupKey = String(numericGroupId);
    const current = groupsByUser.get(userKey) ?? [];
    current.push(groupKey);
    groupsByUser.set(userKey, current);
  }

  const fallbackTimestamp = '';

  const users = records.map((record, index) => {
    const user = normalizeUserRecord(record, index, fallbackTimestamp);
    const numericId =
      toNumber(getValue(record, ['userId', 'userID', 'UserId', 'UserID', 'id', 'ID', 'Id'])) ??
      (Number.isFinite(Number.parseInt(user.id, 10)) ? Number.parseInt(user.id, 10) : undefined);
    const membershipKey = numericId !== undefined ? String(numericId) : user.id;
    const membership = groupsByUser.get(membershipKey);
    if (membership) {
      membership.sort((left, right) => Number(left) - Number(right));
      user.groups = membership;
    }
    return user;
  });

  users.sort((left, right) =>
    left.displayName.localeCompare(right.displayName, 'fr', { sensitivity: 'base' }),
  );

  return users;
}

export async function fetchGroups(): Promise<GroupDefinition[]> {
  const [databaseResult, metadataResult] = await Promise.allSettled([
    sendDatabaseQuery(ADMIN_GROUPS_QUERY),
    requestJson<GroupDefinition[]>('/api/admin/groups'),
  ]);

  const databaseRecords: RawDatabaseUserRecord[] =
    databaseResult.status === 'fulfilled' ? extractRecords(databaseResult.value) : [];
  const metadata: GroupDefinition[] =
    metadataResult.status === 'fulfilled' && Array.isArray(metadataResult.value)
      ? metadataResult.value
      : [];

  const metadataById = new Map(metadata.map((group) => [group.id, group]));
  const metadataByName = new Map(
    metadata.map((group) => [normalizeLabel(group.name), group]),
  );
  for (const group of GROUP_DEFINITIONS) {
    if (!metadataById.has(group.id)) {
      metadataById.set(group.id, group);
    }
    const normalized = normalizeLabel(group.name);
    if (!metadataByName.has(normalized)) {
      metadataByName.set(normalized, group);
    }
  }

  const groups = databaseRecords.map((record, index): GroupDefinition => {
    const numericId = toNumber(getValue(record, ['groupId', 'GroupId', 'groupID', 'GroupID']));
    const idCandidate = toNonEmptyString(
      getValue(record, ['groupId', 'GroupId', 'groupID', 'GroupID', 'id', 'Id']),
    );
    const name =
      toNonEmptyString(getValue(record, ['groupName', 'GroupName', 'name', 'Name'])) ??
      (idCandidate ?? 'Groupe sans nom');
    const id = idCandidate ?? (numericId !== undefined ? String(numericId) : name.toLowerCase());

    const normalizedName = normalizeLabel(name);
    const metadataMatch = metadataById.get(id) ?? metadataByName.get(normalizedName);
    const accentColor = metadataMatch?.accentColor ?? computeGroupAccent(id, index);

    return {
      id,
      name,
      description:
        metadataMatch?.description ??
        "Groupe synchronisé depuis la base de données.",
      defaultPermissions: metadataMatch?.defaultPermissions ?? [],
      accentColor,
    };
  });

  if (!groups.length) {
    const fallback = metadata.length ? metadata : GROUP_DEFINITIONS;
    return fallback
      .map((group, index) => ({
        ...group,
        accentColor: group.accentColor ?? computeGroupAccent(group.id, index),
      }))
      .sort((left, right) => left.name.localeCompare(right.name, 'fr', { sensitivity: 'base' }));
  }

  groups.sort((left, right) => left.name.localeCompare(right.name, 'fr', { sensitivity: 'base' }));

  return groups;
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
    throw new Error("Identifiant d'utilisateur invalide");
  }

  const statements: string[] = [`DELETE FROM [userGroupMembers] WHERE [userId] = ${numericUserId};`];
  for (const groupId of payload.groups) {
    const numericGroupId = Number.parseInt(groupId, 10);
    if (!Number.isFinite(numericGroupId)) {
      continue;
    }
    statements.push(
      `INSERT INTO [userGroupMembers] ([userId], [groupId]) VALUES (${numericUserId}, ${numericGroupId});`,
    );
  }

  await sendDatabaseQuery(statements.join('\n'));

  const users = await fetchUsers();
  const updated = users.find((candidate) => candidate.id === payload.userId);
  if (!updated) {
    throw new Error('Utilisateur mis à jour introuvable après synchronisation.');
  }

  updated.permissionOverrides = [...payload.permissionOverrides];

  return updated;
}

export async function createGroup(name: string): Promise<GroupDefinition> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Le nom du groupe est requis.');
  }

  const escaped = trimmed.replace(/'/g, "''");
  const query = `INSERT INTO [userGroups] ([groupName])
OUTPUT inserted.groupId, inserted.groupName
VALUES (N'${escaped}');`;

  const payload = await sendDatabaseQuery(query);
  const [record] = extractRecords(payload);
  if (!record) {
    throw new Error('Impossible de créer le groupe.');
  }

  const groups = await fetchGroups();
  const createdId = toNonEmptyString(
    getValue(record, ['groupId', 'GroupId', 'groupID', 'GroupID', 'id', 'Id']),
  );
  const found = createdId ? groups.find((group) => group.id === createdId) : undefined;
  return (
    found ?? {
      id: createdId ?? trimmed.toLowerCase(),
      name: trimmed,
      description: "Groupe synchronisé depuis la base de données.",
      defaultPermissions: [],
      accentColor: computeGroupAccent(createdId ?? trimmed, 0),
    }
  );
}

export type { UserAccount, PermissionOverride, AuditLogEntry, UpdateUserAccessPayload };
