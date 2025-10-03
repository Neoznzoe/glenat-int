import {
  type AuditLogEntry,
  type PermissionOverride,
  type UpdateUserAccessPayload,
  type UserAccount,
} from './mockDb';
import {
  type GroupDefinition,
  type PermissionDefinition,
  type PermissionKey,
  PERMISSION_DEFINITIONS,
} from './access-control';
import { encryptUrlPayload, isUrlEncryptionConfigured } from './urlEncryption';

const ADMIN_DATABASE_ENDPOINT =
  import.meta.env.VITE_ADMIN_DATABASE_ENDPOINT ??
  'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase';

const ADMIN_USERS_QUERY = 'SELECT * FROM [users];';
const ADMIN_MODULES_QUERY = 'SELECT * FROM [modules];';
const ADMIN_PAGES_QUERY = 'SELECT * FROM [pages];';
const ADMIN_MODULE_PAGES_QUERY = 'SELECT * FROM [modulesPages];';
const ADMIN_GROUPS_QUERY = 'SELECT * FROM [userGroups];';
const ADMIN_USER_GROUP_MEMBERS_QUERY = 'SELECT * FROM [userGroupMembers];';
const MODULE_PERMISSION_TYPE = 'MODULE';
const MODULE_PERMISSION_FILTER =
  "UPPER(LTRIM(RTRIM(ISNULL([permissionType], '')))) IN ('', 'MODULE')";
const MODULE_PERMISSION_WHERE = `[moduleId] IS NOT NULL AND ${MODULE_PERMISSION_FILTER}`;
const ADMIN_USER_PERMISSIONS_QUERY =
  `SELECT * FROM [userPermissions] WHERE ${MODULE_PERMISSION_WHERE};`;

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

interface ModuleAssociation {
  moduleId: string;
  pageId: string;
  defaultPage: boolean;
}

const GROUP_ACCENT_COLORS = [
  'bg-rose-500/10 text-rose-600 border-rose-200',
  'bg-sky-500/10 text-sky-600 border-sky-200',
  'bg-amber-500/10 text-amber-600 border-amber-200',
  'bg-slate-500/10 text-slate-600 border-slate-200',
  'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  'bg-purple-500/10 text-purple-600 border-purple-200',
  'bg-blue-500/10 text-blue-600 border-blue-200',
  'bg-orange-500/10 text-orange-600 border-orange-200',
  'bg-cyan-500/10 text-cyan-600 border-cyan-200',
  'bg-pink-500/10 text-pink-600 border-pink-200',
];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function assignAccentColor(id: string, index: number): string {
  const paletteIndex = Math.abs(hashString(id || `group-${index + 1}`)) % GROUP_ACCENT_COLORS.length;
  return GROUP_ACCENT_COLORS[paletteIndex];
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

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }
    if (['1', 'true', 'yes', 'oui', 'on', 'visible'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'no', 'non', 'off', 'invisible'].includes(normalized)) {
      return false;
    }
  }
  return undefined;
}

function toRecordIdentifier(value: unknown): string | undefined {
  const stringValue = toNonEmptyString(value);
  if (stringValue) {
    return stringValue;
  }
  const numericValue = toNumber(value);
  if (numericValue !== undefined) {
    return numericValue.toString();
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

function normalizeKey(value: string | undefined, fallback: string): string {
  const source = typeof value === 'string' ? value : '';
  const normalized = source
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9:_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  if (normalized) {
    return normalized;
  }
  if (fallback === value) {
    return fallback;
  }
  if (fallback) {
    return normalizeKey(fallback, fallback);
  }
  return fallback;
}

function registerPermissionLookupKey(
  map: Map<string, PermissionKey>,
  candidate: string | undefined,
  target: PermissionKey,
): void {
  if (!candidate) {
    return;
  }

  const lowered = candidate.toLowerCase();
  if (lowered) {
    map.set(lowered, target);
    const compact = lowered.replace(/[^a-z0-9]/g, '');
    if (compact) {
      map.set(compact, target);
    }
  }
}

const PERMISSION_KEY_LOOKUP: Map<string, PermissionKey> = (() => {
  const lookup = new Map<string, PermissionKey>();

  for (const definition of PERMISSION_DEFINITIONS) {
    registerPermissionLookupKey(lookup, definition.key, definition.key);
    registerPermissionLookupKey(lookup, normalizeKey(definition.key, definition.key), definition.key);
    registerPermissionLookupKey(
      lookup,
      normalizeKey(definition.label, definition.key),
      definition.key,
    );
    registerPermissionLookupKey(
      lookup,
      normalizeKey(definition.label, definition.key).replace(/-/g, ''),
      definition.key,
    );
    const slug = toNonEmptyString(definition.metadata?.slug);
    if (slug) {
      const normalizedSlug = normalizeKey(slug, slug);
      registerPermissionLookupKey(lookup, normalizedSlug, definition.key);
      registerPermissionLookupKey(lookup, normalizedSlug.replace(/-/g, ''), definition.key);
    }
  }

  const aliasEntries: Array<[string, PermissionKey]> = [['kiosque', 'catalogue']];
  for (const [alias, key] of aliasEntries) {
    registerPermissionLookupKey(lookup, alias, key);
    registerPermissionLookupKey(lookup, normalizeKey(alias, alias), key);
  }

  return lookup;
})();

function collectLookupCandidates(...values: Array<unknown>): string[] {
  const candidates = new Set<string>();

  for (const value of values) {
    const raw = toNonEmptyString(value);
    if (!raw) {
      continue;
    }

    const trimmed = raw.trim();
    if (!trimmed) {
      continue;
    }

    const lowered = trimmed.toLowerCase();
    candidates.add(lowered);

    const normalized = normalizeKey(trimmed, trimmed);
    candidates.add(normalized);

    const compact = normalized.replace(/-/g, '');
    if (compact) {
      candidates.add(compact);
    }

    const alphanumeric = lowered.replace(/[^a-z0-9]/g, '');
    if (alphanumeric) {
      candidates.add(alphanumeric);
    }
  }

  return Array.from(candidates);
}

function resolveCanonicalModulePermissionKey(
  definition: PermissionDefinition,
): PermissionKey | null {
  const candidates = collectLookupCandidates(
    definition.key,
    definition.label,
    definition.metadata?.slug,
  );

  for (const candidate of candidates) {
    const permission = PERMISSION_KEY_LOOKUP.get(candidate);
    if (permission) {
      return permission;
    }
  }

  return null;
}

function humanizeLabel(value: string): string {
  const spaced = value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-zàâçéèêëîïôûùüÿñæœ])([A-ZÀÂÇÉÈÊËÎÏÔÛÙÜŸÑÆŒ])/g, '$1 $2');
  const cleaned = spaced.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return value;
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
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

function buildGroupMembershipMap(
  records: RawDatabaseUserRecord[],
): Map<string, string[]> {
  const memberships = new Map<string, string[]>();

  for (const record of records) {
    const userId = toRecordIdentifier(getValue(record, ['userId', 'UserId', 'userID', 'UserID']));
    const groupId = toRecordIdentifier(
      getValue(record, ['groupId', 'GroupId', 'groupID', 'GroupID']),
    );

    if (!userId || !groupId) {
      continue;
    }

    if (!memberships.has(userId)) {
      memberships.set(userId, []);
    }

    memberships.get(userId)!.push(groupId);
  }

  for (const [userId, groupIds] of memberships) {
    const unique = Array.from(new Set(groupIds));
    unique.sort((left, right) =>
      left.localeCompare(right, 'fr', { sensitivity: 'base', numeric: true }),
    );
    memberships.set(userId, unique);
  }

  return memberships;
}

interface ModulePermissionMappings {
  moduleIdToKey: Map<number, string>;
  keyToModuleId: Map<string, number>;
}

async function loadModulePermissionMappings(): Promise<ModulePermissionMappings> {
  const moduleRecords = await runDatabaseQuery(ADMIN_MODULES_QUERY, 'modules');
  const moduleIdToKey = new Map<number, string>();
  const keyToModuleId = new Map<string, number>();

  moduleRecords.forEach((record, index) => {
    const definition = normalizeModuleDefinition(record, index);
    const canonicalKey = resolveCanonicalModulePermissionKey(definition) ?? definition.key;
    const metadataId = definition.metadata?.id;
    if (typeof metadataId !== 'string') {
      return;
    }
    const moduleId = toDatabaseIntegerId(metadataId);
    if (moduleId === null) {
      return;
    }
    moduleIdToKey.set(moduleId, canonicalKey);
    keyToModuleId.set(canonicalKey, moduleId);
  });

  return { moduleIdToKey, keyToModuleId };
}

function buildOverridesFromRecords(
  records: RawDatabaseUserRecord[],
  moduleIdToKey: Map<number, string>,
): PermissionOverride[] {
  const overridesByKey = new Map<string, PermissionOverride>();

  for (const record of records) {
    const moduleIdentifier = toRecordIdentifier(
      getValue(record, ['moduleId', 'moduleID', 'ModuleId', 'ModuleID', 'module_id']),
    );
    const moduleId = moduleIdentifier ? toDatabaseIntegerId(moduleIdentifier) : null;
    if (moduleId === null) {
      continue;
    }

    const permissionKey = moduleIdToKey.get(moduleId);
    if (!permissionKey) {
      continue;
    }

    const canViewValue = getValue(
      record,
      ['canView', 'CanView', 'can_view', 'visible', 'Visible', 'isVisible'],
    );
    const canView = toBoolean(canViewValue);
    if (canView === undefined) {
      continue;
    }

    overridesByKey.set(permissionKey, {
      key: permissionKey,
      mode: canView ? 'allow' : 'deny',
    });
  }

  const overrides = Array.from(overridesByKey.values());
  overrides.sort((left, right) =>
    left.key.localeCompare(right.key, 'fr', { sensitivity: 'base' }),
  );

  return overrides;
}

async function loadUserPermissionOverrides(): Promise<
  Map<string, PermissionOverride[]>
> {
  const { moduleIdToKey } = await loadModulePermissionMappings();

  if (moduleIdToKey.size === 0) {
    return new Map();
  }

  const permissionRecords = await runDatabaseQuery(
    ADMIN_USER_PERMISSIONS_QUERY,
    'droits personnalisés',
  );

  const overridesByUser = new Map<string, Map<string, PermissionOverride>>();

  for (const record of permissionRecords) {
    const userId = toRecordIdentifier(
      getValue(record, ['userId', 'UserId', 'userID', 'UserID', 'utilisateurId']),
    );
    if (!userId) {
      continue;
    }

    const moduleIdentifier = toRecordIdentifier(
      getValue(record, ['moduleId', 'moduleID', 'ModuleId', 'ModuleID', 'module_id']),
    );
    const moduleId = moduleIdentifier ? toDatabaseIntegerId(moduleIdentifier) : null;
    if (moduleId === null) {
      continue;
    }

    const permissionKey = moduleIdToKey.get(moduleId);
    if (!permissionKey) {
      continue;
    }

    const canViewValue = getValue(
      record,
      ['canView', 'CanView', 'can_view', 'visible', 'Visible', 'isVisible'],
    );
    const canView = toBoolean(canViewValue);
    if (canView === undefined) {
      continue;
    }

    if (!overridesByUser.has(userId)) {
      overridesByUser.set(userId, new Map());
    }

    overridesByUser.get(userId)!.set(permissionKey, {
      key: permissionKey,
      mode: canView ? 'allow' : 'deny',
    });
  }

  const hydrated = new Map<string, PermissionOverride[]>();

  for (const [userId, overridesMap] of overridesByUser) {
    const overrides = Array.from(overridesMap.values());
    overrides.sort((left, right) =>
      left.key.localeCompare(right.key, 'fr', { sensitivity: 'base' }),
    );
    hydrated.set(userId, overrides);
  }

  return hydrated;
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

async function runDatabaseQuery(query: string, context: string): Promise<RawDatabaseUserRecord[]> {
  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    credentials: 'include',
  };

  const encrypted = await withEncryptedUrl(ADMIN_DATABASE_ENDPOINT, requestInit);

  let response: Response;
  try {
    response = await fetch(encrypted.input, encrypted.init);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Erreur réseau inconnue';
    throw new Error(`Impossible de contacter la base ${context} : ${detail}`);
  }

  if (!response.ok) {
    throw new Error(`Requête ${context} échouée (${response.status}) ${response.statusText}`);
  }

  let payload: DatabaseQueryResponse;
  try {
    payload = (await response.json()) as DatabaseQueryResponse;
  } catch {
    throw new Error(`Réponse inattendue lors de la récupération des ${context}.`);
  }

  if (payload.success === false) {
    const detail = payload.message ?? `La récupération des ${context} a échoué.`;
    throw new Error(detail);
  }

  return extractDatabaseRecords(payload.result ?? payload.data ?? payload.rows ?? payload);
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

function normalizeModuleDefinition(
  record: RawDatabaseUserRecord,
  index: number,
): PermissionDefinition {
  const idValue = getValue(record, ['id', 'ID', 'moduleId', 'ModuleId', 'moduleID', 'ModuleID']);
  const numericId = toNumber(idValue);
  const id =
    toNonEmptyString(idValue) ??
    (numericId !== undefined ? numericId.toString() : `module-${index + 1}`);
  const slugSource =
    toNonEmptyString(getValue(record, ['name', 'Name', 'slug', 'Slug'])) ?? id ?? `module-${index + 1}`;
  const key = normalizeKey(slugSource, `module-${index + 1}`);
  const labelSource =
    toNonEmptyString(getValue(record, ['name', 'Name', 'label', 'Label'])) ??
    toNonEmptyString(getValue(record, ['description', 'Description'])) ??
    slugSource;
  const label = humanizeLabel(labelSource);
  const description =
    toNonEmptyString(
      getValue(record, ['supportMultilingual', 'SupportMultilingual', 'description', 'Description']),
    ) ?? '';

  const metadata: Record<string, unknown> = {
    id,
    slug: slugSource,
  };

  const isActiveValue = getValue(record, ['isActive', 'IsActive', 'active', 'Active']);
  if (isActiveValue !== undefined) {
    metadata.isActive = isActiveValue;
  }
  const versionValue = getValue(record, ['version', 'Version']);
  if (versionValue !== undefined) {
    metadata.version = versionValue;
  }

  return {
    key,
    label,
    description,
    category: 'Module',
    type: 'module',
    parentKey: null,
    metadata,
  };
}

function normalizePageDefinition(record: RawDatabaseUserRecord, index: number): PermissionDefinition {
  const idValue = getValue(record, ['id', 'ID', 'pageId', 'PageId', 'pageID', 'PageID']);
  const numericId = toNumber(idValue);
  const id =
    toNonEmptyString(idValue) ??
    (numericId !== undefined ? numericId.toString() : `page-${index + 1}`);
  const slugSource =
    toNonEmptyString(getValue(record, ['name', 'Name', 'slug', 'Slug'])) ?? id ?? `page-${index + 1}`;
  const key = `page:${normalizeKey(slugSource, `page-${index + 1}`)}`;
  const labelSource =
    toNonEmptyString(getValue(record, ['metaTitle', 'MetaTitle'])) ??
    toNonEmptyString(getValue(record, ['name', 'Name'])) ??
    slugSource;
  const label = humanizeLabel(labelSource);
  const description =
    toNonEmptyString(getValue(record, ['metaDescription', 'MetaDescription'])) ?? '';

  const metadata: Record<string, unknown> = {
    id,
    slug: slugSource,
  };

  const isPublishedValue = getValue(record, ['isPublished', 'IsPublished']);
  if (isPublishedValue !== undefined) {
    metadata.isPublished = isPublishedValue;
  }
  const needUserConnectedValue = getValue(record, ['needUserConnected', 'NeedUserConnected']);
  if (needUserConnectedValue !== undefined) {
    metadata.needUserConnected = needUserConnectedValue;
  }

  return {
    key,
    label,
    description,
    category: 'Page',
    type: 'page',
    parentKey: null,
    metadata,
  };
}

function normalizeModulePageRecord(record: RawDatabaseUserRecord): ModuleAssociation | null {
  const moduleIdValue = getValue(record, ['moduleId', 'ModuleId', 'moduleID', 'ModuleID', 'module_id']);
  const pageIdValue = getValue(record, ['pageId', 'PageId', 'pageID', 'PageID', 'page_id']);
  const moduleNumeric = toNumber(moduleIdValue);
  const pageNumeric = toNumber(pageIdValue);
  const moduleId =
    toNonEmptyString(moduleIdValue) ??
    (moduleNumeric !== undefined ? moduleNumeric.toString() : undefined);
  const pageId =
    toNonEmptyString(pageIdValue) ??
    (pageNumeric !== undefined ? pageNumeric.toString() : undefined);

  if (!moduleId || !pageId) {
    return null;
  }

  const defaultValue = getValue(record, ['defaultPage', 'DefaultPage', 'isDefault']);
  const defaultPage =
    defaultValue === true ||
    defaultValue === 1 ||
    defaultValue === '1' ||
    (typeof defaultValue === 'string' && defaultValue.toLowerCase() === 'true');

  return { moduleId, pageId, defaultPage };
}

function normalizeGroupRecord(record: RawDatabaseUserRecord, index: number): GroupDefinition {
  const groupIdValue = getValue(record, ['groupId', 'GroupId', 'groupID', 'GroupID', 'id']);
  const numericId = toNumber(groupIdValue);
  const id =
    toNonEmptyString(groupIdValue) ??
    (numericId !== undefined ? numericId.toString() : `group-${index + 1}`);
  const name =
    toNonEmptyString(getValue(record, ['groupName', 'GroupName', 'name', 'Name'])) ??
    `Groupe ${index + 1}`;
  const description =
    toNonEmptyString(getValue(record, ['description', 'Description', 'groupDescription'])) ?? '';
  const defaultPermissions: string[] = [];

  return {
    id,
    name,
    description,
    defaultPermissions,
    accentColor: assignAccentColor(id, index),
  };
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
  const userRecords = await runDatabaseQuery(ADMIN_USERS_QUERY, 'utilisateurs');

  let membershipsByUser = new Map<string, string[]>();
  try {
    const membershipRecords = await runDatabaseQuery(
      ADMIN_USER_GROUP_MEMBERS_QUERY,
      'membres des groupes utilisateurs',
    );
    membershipsByUser = buildGroupMembershipMap(membershipRecords);
  } catch (error) {
    console.error('Impossible de récupérer les appartenances aux groupes.', error);
  }

  let permissionOverridesByUser = new Map<string, PermissionOverride[]>();
  try {
    permissionOverridesByUser = await loadUserPermissionOverrides();
  } catch (error) {
    console.error('Impossible de récupérer les droits personnalisés.', error);
  }

  const fallbackTimestamp = '';

  const users = userRecords.map((record, index) => {
    const user = normalizeUserRecord(record, index, fallbackTimestamp);
    const memberships = membershipsByUser.get(user.id);
    if (memberships) {
      user.groups = memberships;
    }
    const overrides = permissionOverridesByUser.get(user.id);
    if (overrides) {
      user.permissionOverrides = overrides.map((override) => ({ ...override }));
    }
    return user;
  });

  users.sort((left, right) =>
    left.displayName.localeCompare(right.displayName, 'fr', { sensitivity: 'base' }),
  );

  return users;
}

export async function fetchGroups(): Promise<GroupDefinition[]> {
  const groupRecords = await runDatabaseQuery(ADMIN_GROUPS_QUERY, 'groupes');

  const groups = groupRecords.map((record, index) => normalizeGroupRecord(record, index));

  groups.sort((left, right) => left.name.localeCompare(right.name, 'fr', { sensitivity: 'base' }));

  return groups;
}

export async function fetchPermissions(): Promise<PermissionDefinition[]> {
  const [moduleRecords, pageRecords, modulePageRecords] = await Promise.all([
    runDatabaseQuery(ADMIN_MODULES_QUERY, 'modules'),
    runDatabaseQuery(ADMIN_PAGES_QUERY, 'pages'),
    runDatabaseQuery(ADMIN_MODULE_PAGES_QUERY, 'associations modules/pages'),
  ]);

  const modules = moduleRecords
    .map((record, index) => normalizeModuleDefinition(record, index))
    .map((definition) => {
      const canonicalKey = resolveCanonicalModulePermissionKey(definition);
      if (canonicalKey && canonicalKey !== definition.key) {
        return { ...definition, key: canonicalKey };
      }
      return definition;
    });
  const pages = pageRecords.map((record, index) => normalizePageDefinition(record, index));
  const associations = modulePageRecords
    .map((record) => normalizeModulePageRecord(record))
    .filter((value): value is ModuleAssociation => Boolean(value));

  const moduleById = new Map<string, PermissionDefinition>();
  for (const moduleDefinition of modules) {
    const metadataId = moduleDefinition.metadata?.id;
    if (typeof metadataId === 'string') {
      moduleById.set(metadataId, moduleDefinition);
    }
  }

  const associationByPage = new Map<string, ModuleAssociation>();
  for (const association of associations) {
    const existing = associationByPage.get(association.pageId);
    if (!existing || (!existing.defaultPage && association.defaultPage)) {
      associationByPage.set(association.pageId, association);
    }
  }

  const pagesWithParent = pages.map((pageDefinition) => {
    const metadataId = pageDefinition.metadata?.id;
    const pageId = typeof metadataId === 'string' ? metadataId : undefined;
    if (!pageId) {
      return pageDefinition;
    }
    const association = associationByPage.get(pageId);
    if (!association) {
      return pageDefinition;
    }
    const moduleDefinition = moduleById.get(association.moduleId);
    if (!moduleDefinition) {
      return pageDefinition;
    }
    return {
      ...pageDefinition,
      parentKey: moduleDefinition.key,
      category: moduleDefinition.label,
      metadata: {
        ...(pageDefinition.metadata ?? {}),
        moduleId: association.moduleId,
        defaultPage: association.defaultPage,
      },
    };
  });

  const sortKey = (definition: PermissionDefinition): number => {
    const rawId = definition.metadata?.id;
    if (typeof rawId === 'string') {
      const parsed = Number.parseInt(rawId, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return Number.MAX_SAFE_INTEGER;
  };

  const uniqueModules: PermissionDefinition[] = [];
  const seenModuleKeys = new Set<string>();
  for (const definition of modules) {
    if (seenModuleKeys.has(definition.key)) {
      continue;
    }
    seenModuleKeys.add(definition.key);
    uniqueModules.push(definition);
  }

  uniqueModules.sort((left, right) => {
    const diff = sortKey(left) - sortKey(right);
    if (diff !== 0) {
      return diff;
    }
    return left.label.localeCompare(right.label, 'fr', { sensitivity: 'base' });
  });

  return [...uniqueModules, ...pagesWithParent];
}

export async function createGroup(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Le nom du groupe est requis.');
  }

  const escapedName = escapeSqlLiteral(trimmed);

  const existing = await runDatabaseQuery(
    `SET NOCOUNT ON;
SELECT TOP (1) [groupId]
FROM [userGroups]
WHERE LOWER(LTRIM(RTRIM([groupName]))) = LOWER(N'${escapedName}');`,
    'vérification des groupes',
  );

  if (existing.length) {
    throw new Error('Un groupe avec ce nom existe déjà.');
  }

  const query = `SET NOCOUNT ON;
INSERT INTO [userGroups] ([groupName]) VALUES (N'${escapedName}');
SELECT CAST(SCOPE_IDENTITY() AS INT) AS [groupId], N'${escapedName}' AS [groupName];`;

  const inserted = await runDatabaseQuery(query, 'création du groupe');
  if (!inserted.length) {
    throw new Error("La création du groupe n'a retourné aucun résultat.");
  }
}

export async function fetchAuditLog(limit = 25): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  return requestJson<AuditLogEntry[]>(`/api/admin/audit-log?${params.toString()}`);
}

export async function fetchCurrentUser(): Promise<UserAccount> {
  const user = await requestJson<UserAccount>('/api/admin/current-user');

  try {
    const permissionOverridesByUser = await loadUserPermissionOverrides();
    const overrides = permissionOverridesByUser.get(user.id);
    if (overrides) {
      user.permissionOverrides = overrides.map((override) => ({ ...override }));
    }
  } catch (error) {
    console.error('Impossible de récupérer les droits personnalisés.', error);
  }

  return user;
}

function toDatabaseIntegerId(value: string | undefined): number | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!/^[0-9]+$/.test(trimmed)) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isSafeInteger(parsed)) {
    return null;
  }
  return parsed;
}

async function syncUserGroupMemberships(userId: number, groupIds: number[]): Promise<string[]> {
  const uniqueGroupIds = Array.from(new Set(groupIds));
  uniqueGroupIds.sort((left, right) => left - right);

  const statements = [
    'SET NOCOUNT ON;',
    `DELETE FROM [userGroupMembers] WHERE [userId] = ${userId};`,
  ];

  if (uniqueGroupIds.length > 0) {
    const values = uniqueGroupIds.map((groupId) => `(${userId}, ${groupId})`).join(',\n');
    statements.push(`INSERT INTO [userGroupMembers] ([userId], [groupId]) VALUES ${values};`);
  }

  statements.push(
    `SELECT [groupId] FROM [userGroupMembers] WHERE [userId] = ${userId} ORDER BY [groupId];`,
  );

  const membershipRecords = await runDatabaseQuery(
    statements.join('\n'),
    'mise à jour des membres de groupe',
  );

  const appliedGroupIds = membershipRecords
    .map((record) =>
      toRecordIdentifier(getValue(record, ['groupId', 'GroupId', 'groupID', 'GroupID'])),
    )
    .filter((identifier): identifier is string => Boolean(identifier));

  const uniqueApplied = Array.from(new Set(appliedGroupIds));
  uniqueApplied.sort((left, right) =>
    left.localeCompare(right, 'fr', { sensitivity: 'base', numeric: true }),
  );

  return uniqueApplied;
}

async function syncUserPermissionOverrides(
  userId: number,
  overrides: PermissionOverride[],
): Promise<PermissionOverride[]> {
  const { moduleIdToKey, keyToModuleId } = await loadModulePermissionMappings();

  if (moduleIdToKey.size === 0) {
    return [];
  }

  const existingRecords = await runDatabaseQuery(
    `SET NOCOUNT ON;
SELECT [moduleId], [canView]
FROM [userPermissions]
WHERE [userId] = ${userId} AND ${MODULE_PERMISSION_WHERE};`,
    'droits personnalisés de l’utilisateur',
  );

  const existingByModule = new Map<number, boolean>();
  for (const record of existingRecords) {
    const moduleIdentifier = toRecordIdentifier(
      getValue(record, ['moduleId', 'moduleID', 'ModuleId', 'ModuleID', 'module_id']),
    );
    const moduleId = moduleIdentifier ? toDatabaseIntegerId(moduleIdentifier) : null;
    if (moduleId === null) {
      continue;
    }

    const canViewValue = getValue(
      record,
      ['canView', 'CanView', 'can_view', 'visible', 'Visible', 'isVisible'],
    );
    const canView = toBoolean(canViewValue);
    if (canView === undefined) {
      continue;
    }

    existingByModule.set(moduleId, canView);
  }

  const desiredByModule = new Map<number, boolean>();
  for (const override of overrides) {
    const moduleId = keyToModuleId.get(override.key);
    if (moduleId === undefined) {
      continue;
    }
    const canView = override.mode !== 'deny';
    desiredByModule.set(moduleId, canView);
  }

  const deletes: number[] = [];
  const updates: Array<{ moduleId: number; canView: boolean }> = [];
  for (const [moduleId, canView] of existingByModule) {
    if (!desiredByModule.has(moduleId)) {
      deletes.push(moduleId);
      continue;
    }

    const desiredCanView = desiredByModule.get(moduleId)!;
    if (desiredCanView !== canView) {
      updates.push({ moduleId, canView: desiredCanView });
    }
  }

  const inserts: Array<{ moduleId: number; canView: boolean }> = [];
  for (const [moduleId, canView] of desiredByModule) {
    if (!existingByModule.has(moduleId)) {
      inserts.push({ moduleId, canView });
    }
  }

  deletes.sort((left, right) => left - right);
  updates.sort((left, right) => left.moduleId - right.moduleId);
  inserts.sort((left, right) => left.moduleId - right.moduleId);

  const statements = ['SET NOCOUNT ON;'];

  statements.push(
    `UPDATE [userPermissions]\n` +
      `SET [permissionType] = '${MODULE_PERMISSION_TYPE}'\n` +
      `WHERE [userId] = ${userId}\n` +
      `  AND [moduleId] IS NOT NULL\n` +
      `  AND ${MODULE_PERMISSION_FILTER}\n` +
      `  AND [permissionType] <> '${MODULE_PERMISSION_TYPE}';`,
  );

  if (deletes.length > 0) {
    const deleteList = deletes.join(', ');
    statements.push(
      `DELETE FROM [userPermissions]\n` +
        `WHERE [userId] = ${userId} AND ${MODULE_PERMISSION_WHERE} AND [moduleId] IN (${deleteList});`,
    );
  }

  for (const update of updates) {
    statements.push(
      `UPDATE [userPermissions] SET [canView] = ${update.canView ? 1 : 0}\n` +
        `WHERE [userId] = ${userId} AND ${MODULE_PERMISSION_WHERE} AND [moduleId] = ${update.moduleId};`,
    );
  }

  if (inserts.length > 0) {
    const values = inserts
      .map(
        ({ moduleId, canView }) =>
          `(${userId}, '${MODULE_PERMISSION_TYPE}', ${moduleId}, ${canView ? 1 : 0})`,
      )
      .join(',\n');
    statements.push(
      `INSERT INTO [userPermissions] ([userId], [permissionType], [moduleId], [canView]) VALUES ${values};`,
    );
  }

  statements.push(
    `SELECT [moduleId], [canView]\n` +
      `FROM [userPermissions]\n` +
      `WHERE [userId] = ${userId} AND ${MODULE_PERMISSION_WHERE}\n` +
      `ORDER BY [moduleId];`,
  );

  const appliedRecords = await runDatabaseQuery(
    statements.join('\n'),
    'mise à jour des droits personnalisés',
  );

  return buildOverridesFromRecords(appliedRecords, moduleIdToKey);
}

export async function persistUserAccess(
  payload: UpdateUserAccessPayload,
): Promise<UserAccount> {
  const numericUserId = toDatabaseIntegerId(payload.userId);

  if (numericUserId === null) {
    const { userId, ...body } = payload;
    return requestJson<UserAccount>(`/api/admin/users/${encodeURIComponent(userId)}/access`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  const numericGroupIds = payload.groups
    .map((groupId) => toDatabaseIntegerId(groupId))
    .filter((value): value is number => value !== null);

  const appliedGroupIds = await syncUserGroupMemberships(numericUserId, numericGroupIds);

  const userRecords = await runDatabaseQuery(
    `SET NOCOUNT ON;
SELECT TOP (1) *
FROM [users]
WHERE [userId] = ${numericUserId};`,
    'récupération de l’utilisateur',
  );

  if (!userRecords.length) {
    throw new Error("Impossible de récupérer l'utilisateur mis à jour.");
  }

  const updatedUser = normalizeUserRecord(userRecords[0], 0, '');
  updatedUser.groups = appliedGroupIds;
  updatedUser.permissionOverrides = await syncUserPermissionOverrides(
    numericUserId,
    payload.permissionOverrides,
  );

  return updatedUser;
}

export type { UserAccount, PermissionOverride, AuditLogEntry, UpdateUserAccessPayload };
