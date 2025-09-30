import {
  BASE_PERMISSIONS,
  GROUP_DEFINITIONS,
  PERMISSION_DEFINITIONS,
  type GroupDefinition,
  type PermissionDefinition,
  type PermissionKey,
} from './access-control';

export type PermissionOverrideMode = 'allow' | 'deny';

export interface PermissionOverride {
  key: PermissionKey;
  mode: PermissionOverrideMode;
  note?: string;
}

export type PermissionEvaluationOrigin =
  | 'superadmin'
  | 'override-allow'
  | 'override-deny'
  | 'group'
  | 'base'
  | 'none';

export interface PermissionEvaluation {
  key: PermissionKey;
  effective: boolean;
  origin: PermissionEvaluationOrigin;
  inheritedFrom: string[];
  basePermission: boolean;
  overrideMode?: PermissionOverrideMode;
}

export interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  azureOid: string;
  azureUpn: string;
  jobTitle: string;
  department: string;
  location: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
  lastConnection: string;
  createdAt: string;
  updatedAt: string;
  groups: string[];
  permissionOverrides: PermissionOverride[];
  isSuperAdmin?: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  actorId: string;
  actorName: string;
  message: string;
  timestamp: string;
  groupChanges?: {
    added: string[];
    removed: string[];
  };
  overrideChanges?: {
    added: PermissionOverride[];
    removed: PermissionOverride[];
    changed: Array<{
      key: PermissionKey;
      from: PermissionOverrideMode;
      to: PermissionOverrideMode;
    }>;
  };
}

interface DatabaseSchema {
  version: number;
  createdAt: string;
  currentUserId: string;
  users: UserAccount[];
  groups: GroupDefinition[];
  permissions: PermissionDefinition[];
  auditLog: AuditLogEntry[];
  userGroups: SqlUserGroupRecord[];
  userPermissions: SqlUserPermissionRecord[];
  pages: PageDefinition[];
}

export interface UpdateUserAccessPayload {
  userId: string;
  groups: string[];
  permissionOverrides: PermissionOverride[];
  actorId?: string;
}

interface SqlUserRecord {
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string | null;
  email: string;
  photoSd: string | null;
  preferedLanguage: string;
  preferedTheme: string;
}

interface SqlUserGroupRecord {
  userId: number;
  groupId: string;
}

interface SqlUserPermissionRecord {
  permissionId: number;
  userId: number;
  permissionType: 'page' | 'module';
  pageId?: number | null;
  permissionKey?: PermissionKey;
  canView: boolean;
}

export interface PageDefinition {
  id: number;
  name: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  publishedAt: string | null;
  needUserConnected: boolean;
  componentKey: string;
}

const SQL_USERS: SqlUserRecord[] = [
  {
    userId: 1,
    firstName: 'Nicolas',
    lastName: 'MERCIER',
    username: 'nicolas',
    password: null,
    email: 'nicolas.mercier@glenat.com',
    photoSd: 'default/UserImage.png',
    preferedLanguage: 'fr',
    preferedTheme: 'light',
  },
  {
    userId: 2,
    firstName: 'Stéphane',
    lastName: 'CHERMETTE',
    username: 'stephane',
    password: null,
    email: 'stephane.chermette@glenat.com',
    photoSd: 'default/UserImage.png',
    preferedLanguage: 'fr',
    preferedTheme: 'light',
  },
  {
    userId: 3,
    firstName: 'Mathilde',
    lastName: 'NICOLAS',
    username: 'mathilde',
    password: null,
    email: 'mathilde.nicolas@glenat.com',
    photoSd: 'default/UserImage.png',
    preferedLanguage: 'fr',
    preferedTheme: 'light',
  },
  {
    userId: 4,
    firstName: 'Valentin',
    lastName: 'OGAN',
    username: 'valentin',
    password: null,
    email: 'valentin.ogan@glenat.com',
    photoSd: 'default/UserImage.png',
    preferedLanguage: 'fr',
    preferedTheme: 'light',
  },
  {
    userId: 5,
    firstName: 'Damien',
    lastName: 'BONIS',
    username: 'damien',
    password: null,
    email: 'damien.bonis@glenat.com',
    photoSd: 'default/UserImage.png',
    preferedLanguage: 'fr',
    preferedTheme: 'light',
  },
  {
    userId: 6,
    firstName: 'Victor',
    lastName: 'BESSON',
    username: 'victor',
    password: null,
    email: 'victor.besson@glenat.com',
    photoSd: 'default/UserImage.png',
    preferedLanguage: 'fr',
    preferedTheme: 'light',
  },
];

const SQL_USER_PROFILE_DETAILS: Record<
  number,
  { jobTitle: string; department: string; location: string; phoneNumber: string }
> = {
  1: {
    jobTitle: 'Responsable communication',
    department: 'Communication',
    location: 'Grenoble',
    phoneNumber: '+33 4 76 00 00 01',
  },
  2: {
    jobTitle: 'Directeur financier',
    department: 'Finance',
    location: 'Grenoble',
    phoneNumber: '+33 4 76 00 00 02',
  },
  3: {
    jobTitle: 'Coordinatrice RH',
    department: 'Ressources humaines',
    location: 'Grenoble',
    phoneNumber: '+33 4 76 00 00 03',
  },
  4: {
    jobTitle: 'Chef de projet digital',
    department: 'Digital',
    location: 'Paris',
    phoneNumber: '+33 1 42 00 00 04',
  },
  5: {
    jobTitle: 'Responsable production',
    department: 'Production',
    location: 'Grenoble',
    phoneNumber: '+33 4 76 00 00 05',
  },
  6: {
    jobTitle: 'Chargé de mission',
    department: 'Atelier',
    location: 'Grenoble',
    phoneNumber: '+33 4 76 00 00 06',
  },
};

const SQL_USER_GROUPS: SqlUserGroupRecord[] = [
  { userId: 1, groupId: 'editions-glenat' },
  { userId: 2, groupId: 'ged' },
  { userId: 3, groupId: 'hugo-digital' },
  { userId: 4, groupId: 'glenat-prod' },
  { userId: 5, groupId: 'glenat-prod' },
  { userId: 6, groupId: 'glenat-prod' },
  { userId: 6, groupId: 'glenat-diffusion' },
];

const SQL_USER_PERMISSIONS: SqlUserPermissionRecord[] = [
  // Page level permissions
  { permissionId: 1, userId: 1, permissionType: 'page', pageId: 1, canView: true },
  { permissionId: 2, userId: 1, permissionType: 'page', pageId: 2, canView: true },
  { permissionId: 3, userId: 2, permissionType: 'page', pageId: 1, canView: true },
  { permissionId: 4, userId: 2, permissionType: 'page', pageId: 2, canView: true },
  { permissionId: 5, userId: 3, permissionType: 'page', pageId: 1, canView: true },
  { permissionId: 6, userId: 3, permissionType: 'page', pageId: 2, canView: true },
  { permissionId: 7, userId: 4, permissionType: 'page', pageId: 1, canView: true },
  { permissionId: 8, userId: 4, permissionType: 'page', pageId: 2, canView: true },
  { permissionId: 9, userId: 5, permissionType: 'page', pageId: 1, canView: true },
  { permissionId: 10, userId: 5, permissionType: 'page', pageId: 2, canView: true },
  { permissionId: 11, userId: 6, permissionType: 'page', pageId: 1, canView: true },
  { permissionId: 12, userId: 6, permissionType: 'page', pageId: 2, canView: true },
  // Module level permissions and overrides
  { permissionId: 101, userId: 1, permissionType: 'module', permissionKey: 'administration', canView: true },
  { permissionId: 102, userId: 2, permissionType: 'module', permissionKey: 'contrats', canView: true },
  { permissionId: 103, userId: 3, permissionType: 'module', permissionKey: 'rh', canView: true },
  { permissionId: 104, userId: 4, permissionType: 'module', permissionKey: 'temps', canView: true },
  { permissionId: 105, userId: 5, permissionType: 'module', permissionKey: 'atelier', canView: true },
  { permissionId: 106, userId: 6, permissionType: 'module', permissionKey: 'administration', canView: true },
  { permissionId: 107, userId: 6, permissionType: 'module', permissionKey: 'catalogue', canView: true },
  { permissionId: 108, userId: 6, permissionType: 'module', permissionKey: 'contrats', canView: false },
  { permissionId: 109, userId: 6, permissionType: 'module', permissionKey: 'rh', canView: false },
  { permissionId: 110, userId: 6, permissionType: 'module', permissionKey: 'temps', canView: false },
  { permissionId: 111, userId: 6, permissionType: 'module', permissionKey: 'atelier', canView: false },
];

const SQL_PAGES: PageDefinition[] = [
  {
    id: 1,
    name: 'home.tsx',
    componentKey: 'home',
    metaTitle: 'Accueil',
    metaDescription: "Page d'accueil de l'intranet Glénat.",
    isPublished: true,
    publishedAt: new Date('2024-01-08T09:00:00Z').toISOString(),
    needUserConnected: true,
  },
  {
    id: 2,
    name: 'office.tsx',
    componentKey: 'office',
    metaTitle: 'Prochaines offices',
    metaDescription: 'Accès aux prochaines offices du catalogue.',
    isPublished: true,
    publishedAt: new Date('2024-01-08T09:15:00Z').toISOString(),
    needUserConnected: true,
  },
];

const DEFAULT_CURRENT_USER_EMAIL = 'victor.besson@glenat.com';

function formatUserAccountId(sqlUserId: number): string {
  return `user-${String(sqlUserId).padStart(3, '0')}`;
}

function parseUserAccountId(userId: string): number | null {
  const match = userId.match(/^user-(\d{3})$/);
  if (!match) {
    return null;
  }
  const parsed = Number.parseInt(match[1] ?? '', 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeLastName(value: string): string {
  if (!value) {
    return value;
  }
  return value
    .toLowerCase()
    .split(/[-\s]/u)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const STORAGE_KEY = 'glenat-admin-database-v1';
const DB_VERSION = 3;
let inMemoryDb: DatabaseSchema | null = null;

function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Local storage unavailable, using in-memory database only.', error);
    return null;
  }
}

function persistDatabase(db: DatabaseSchema) {
  inMemoryDb = db;
  const storage = getStorage();
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}

function generateGuid(index: number): string {
  const base = (0x1000000000000 + index).toString(16).slice(-12);
  return `00000000-0000-4000-8000-${base.padStart(12, '0')}`;
}

function getJobDetails(sqlUserId: number) {
  return (
    SQL_USER_PROFILE_DETAILS[sqlUserId] ?? {
      jobTitle: 'Collaborateur',
      department: 'Général',
      location: 'Grenoble',
      phoneNumber: '+33 4 76 00 00 00',
    }
  );
}

function buildUserAccount(
  row: SqlUserRecord,
  groups: GroupDefinition[],
  userGroups: SqlUserGroupRecord[],
  userPermissions: SqlUserPermissionRecord[],
  index: number,
): UserAccount {
  const jobDetails = getJobDetails(row.userId);
  const normalizedLastName = normalizeLastName(row.lastName);
  const displayName = `${row.firstName} ${normalizedLastName}`;
  const accountGroups = userGroups
    .filter((relation) => relation.userId === row.userId)
    .map((relation) => relation.groupId)
    .filter((groupId) => groups.some((group) => group.id === groupId));

  const overrides: PermissionOverride[] = userPermissions
    .filter(
      (permission) =>
        permission.userId === row.userId &&
        permission.permissionType === 'module' &&
        permission.permissionKey,
    )
    .map((permission) => ({
      key: permission.permissionKey!,
      mode: permission.canView ? 'allow' : 'deny',
    }));

  const now = Date.now();
  const createdAt = new Date(now - (index + 5) * 86_400_000).toISOString();
  const updatedAt = new Date(now - (index + 1) * 43_200_000).toISOString();
  const lastConnection = new Date(now - (index + 1) * 21_600_000).toISOString();

  const account: UserAccount = {
    id: formatUserAccountId(row.userId),
    firstName: row.firstName,
    lastName: normalizedLastName,
    displayName,
    email: row.email,
    azureOid: generateGuid(row.userId),
    azureUpn: row.email,
    jobTitle: jobDetails.jobTitle,
    department: jobDetails.department,
    location: jobDetails.location,
    phoneNumber: jobDetails.phoneNumber,
    status: 'active',
    lastConnection,
    createdAt,
    updatedAt,
    groups: accountGroups,
    permissionOverrides: overrides,
  };

  if (row.userId == 1) {
    account.isSuperAdmin = true;
  }

  return account;
}

function createUsersFromSql(
  groups: GroupDefinition[],
  userGroups: SqlUserGroupRecord[],
  userPermissions: SqlUserPermissionRecord[],
): UserAccount[] {
  return SQL_USERS.map((row, index) =>
    buildUserAccount(row, groups, userGroups, userPermissions, index),
  );
}

function sanitizeDatabase(db: DatabaseSchema): DatabaseSchema {
  const sanitizedUsers = db.users.map((user) => ({
    ...user,
    groups: Array.from(new Set(user.groups)),
    permissionOverrides: sanitizeOverrides(user.permissionOverrides),
  }));
  return {
    ...db,
    users: sanitizedUsers,
    userGroups: Array.isArray(db.userGroups) ? db.userGroups : [],
    userPermissions: Array.isArray(db.userPermissions) ? db.userPermissions : [],
    pages: Array.isArray(db.pages) ? db.pages : [],
  };
}

function createSeedDatabase(): DatabaseSchema {
  const groups = GROUP_DEFINITIONS.map((group) => ({ ...group }));
  const permissions = PERMISSION_DEFINITIONS.map((permission) => ({ ...permission }));
  const userGroups = SQL_USER_GROUPS.map((relation) => ({ ...relation }));
  const userPermissions = SQL_USER_PERMISSIONS.map((permission) => ({ ...permission }));
  const pages = SQL_PAGES.map((page) => ({ ...page }));

  const users = createUsersFromSql(groups, userGroups, userPermissions);
  const currentUser =
    users.find((user) => user.email.toLowerCase() === DEFAULT_CURRENT_USER_EMAIL) ?? users[0];

  const actor = users.find((user) => user.isSuperAdmin) ?? currentUser;

  return {
    version: DB_VERSION,
    createdAt: new Date().toISOString(),
    currentUserId: currentUser?.id ?? users[0]?.id ?? '',
    users,
    groups,
    permissions,
    userGroups,
    userPermissions,
    pages,
    auditLog: [
      {
        id: 'log-0001',
        userId: currentUser?.id ?? formatUserAccountId(6),
        actorId: actor?.id ?? currentUser?.id ?? formatUserAccountId(6),
        actorName: actor?.displayName ?? 'Système',
        message: 'Synchronisation initiale des groupes depuis la base SQL.',
        timestamp: new Date(Date.now() - 3 * 86_400_000).toISOString(),
        groupChanges: {
          added: SQL_USER_GROUPS.filter((relation) => relation.userId === 6).map(
            (relation) => relation.groupId,
          ),
          removed: [],
        },
      },
      {
        id: 'log-0002',
        userId: formatUserAccountId(6),
        actorId: actor?.id ?? currentUser?.id ?? formatUserAccountId(6),
        actorName: actor?.displayName ?? 'Système',
        message: 'Application des droits personnalisés pour Victor Besson.',
        timestamp: new Date(Date.now() - 2 * 86_400_000).toISOString(),
        overrideChanges: {
          added: [
            { key: 'administration', mode: 'allow' as const },
            { key: 'catalogue', mode: 'allow' as const },
          ],
          removed: [],
          changed: [
            { key: 'contrats', from: 'allow' as const, to: 'deny' as const },
            { key: 'rh', from: 'allow' as const, to: 'deny' as const },
            { key: 'temps', from: 'allow' as const, to: 'deny' as const },
            { key: 'atelier', from: 'allow' as const, to: 'deny' as const },
          ],
        },
      },
    ],
  };
}

function readDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  const storage = getStorage();
  if (storage) {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (parsed.version === DB_VERSION) {
          const sanitized = sanitizeDatabase(parsed);
          persistDatabase(sanitized);
          return sanitized;
        }
      } catch (error) {
        console.warn('Invalid database in localStorage, seeding a fresh copy.', error);
      }
    }
  }

  const seeded = createSeedDatabase();
  persistDatabase(seeded);
  return seeded;
}

export function ensureDatabaseSeeded() {
  readDatabase();
}

function simulateLatency<T>(value: T, delay = 200): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(deepClone(value)), delay);
  });
}

export async function listUsers(): Promise<UserAccount[]> {
  const db = readDatabase();
  const sorted = [...db.users].sort((left, right) => {
    const leftLastName = left.lastName?.trim() ?? '';
    const rightLastName = right.lastName?.trim() ?? '';
    const comparison = leftLastName.localeCompare(rightLastName, 'fr');
    if (comparison !== 0) {
      return comparison;
    }
    return left.firstName.localeCompare(right.firstName, 'fr');
  });
  return simulateLatency(sorted);
}

export async function listGroups(): Promise<GroupDefinition[]> {
  const db = readDatabase();
  return simulateLatency(db.groups.map((group) => ({ ...group })));
}

export async function listPermissions(): Promise<PermissionDefinition[]> {
  const db = readDatabase();
  return simulateLatency(db.permissions.map((permission) => ({ ...permission })));
}

export async function listAuditLog(limit = 25): Promise<AuditLogEntry[]> {
  const db = readDatabase();
  const entries = [...db.auditLog]
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
    .slice(0, limit);
  return simulateLatency(entries);
}

function resolveAccessiblePages(db: DatabaseSchema, userId: string | null): PageDefinition[] {
  const sqlId = userId ? parseUserAccountId(userId) : null;
  const overrides = new Map<number, boolean>();

  if (sqlId) {
    for (const permission of db.userPermissions) {
      if (permission.userId !== sqlId || permission.permissionType !== 'page') {
        continue;
      }
      if (typeof permission.pageId !== 'number') {
        continue;
      }
      overrides.set(permission.pageId, permission.canView);
    }
  }

  return db.pages.filter((page) => {
    const explicit = overrides.get(page.id);
    if (explicit === false) {
      return false;
    }
    if (explicit === true) {
      return page.isPublished;
    }
    if (!page.needUserConnected) {
      return page.isPublished;
    }
    return page.isPublished && Boolean(userId);
  });
}

export async function listAccessiblePagesForCurrentUser(): Promise<PageDefinition[]> {
  const db = readDatabase();
  const pages = resolveAccessiblePages(db, db.currentUserId);
  return simulateLatency(pages.map((page) => ({ ...page })));
}

export async function listAllPages(): Promise<PageDefinition[]> {
  const db = readDatabase();
  return simulateLatency(db.pages.map((page) => ({ ...page })));
}

export async function getUserById(userId: string): Promise<UserAccount | undefined> {
  const db = readDatabase();
  const user = db.users.find((candidate) => candidate.id === userId);
  return simulateLatency(user ?? undefined);
}

export async function getCurrentUser(): Promise<UserAccount> {
  const db = readDatabase();
  const user = db.users.find((candidate) => candidate.id === db.currentUserId);
  if (!user) {
    throw new Error('Current user not found in database');
  }
  return simulateLatency(user);
}

function sanitizeGroups(
  db: DatabaseSchema,
  groups: string[],
): { validGroups: string[]; removed: string[] } {
  const validIds = new Set(db.groups.map((group) => group.id));
  const unique = Array.from(new Set(groups));
  const validGroups = unique.filter((groupId) => validIds.has(groupId));
  const removed = unique.filter((groupId) => !validIds.has(groupId));
  return { validGroups, removed };
}

function sanitizeOverrides(overrides: PermissionOverride[]): PermissionOverride[] {
  const map = new Map<PermissionKey, PermissionOverride>();
  for (const override of overrides) {
    if (!override || !PERMISSION_DEFINITIONS.some((definition) => definition.key === override.key)) {
      continue;
    }
    map.set(override.key, { key: override.key, mode: override.mode, note: override.note });
  }
  return Array.from(map.values());
}

function diffArrays(before: string[], after: string[]) {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  const added: string[] = [];
  const removed: string[] = [];
  for (const value of afterSet) {
    if (!beforeSet.has(value)) {
      added.push(value);
    }
  }
  for (const value of beforeSet) {
    if (!afterSet.has(value)) {
      removed.push(value);
    }
  }
  return { added, removed };
}

function diffOverrides(
  before: PermissionOverride[],
  after: PermissionOverride[],
): AuditLogEntry['overrideChanges'] {
  const beforeMap = new Map(before.map((item) => [item.key, item]));
  const afterMap = new Map(after.map((item) => [item.key, item]));
  const added: PermissionOverride[] = [];
  const removed: PermissionOverride[] = [];
  const changed: Array<{ key: PermissionKey; from: PermissionOverrideMode; to: PermissionOverrideMode }> = [];

  for (const [key, value] of afterMap) {
    if (!beforeMap.has(key)) {
      added.push(value);
      continue;
    }
    const previous = beforeMap.get(key)!;
    if (previous.mode !== value.mode) {
      changed.push({ key, from: previous.mode, to: value.mode });
    }
  }

  for (const [key, value] of beforeMap) {
    if (!afterMap.has(key)) {
      removed.push(value);
    }
  }

  if (!added.length && !removed.length && !changed.length) {
    return undefined;
  }

  return { added, removed, changed };
}

function buildAuditMessage(diff: {
  groups: ReturnType<typeof diffArrays>;
  overrides?: AuditLogEntry['overrideChanges'];
}): string {
  const sections: string[] = [];
  if (diff.groups.added.length || diff.groups.removed.length) {
    const parts: string[] = [];
    if (diff.groups.added.length) {
      parts.push(`+${diff.groups.added.length}`);
    }
    if (diff.groups.removed.length) {
      parts.push(`-${diff.groups.removed.length}`);
    }
    sections.push(`Groupes (${parts.join(' / ') || '0'})`);
  }
  if (diff.overrides) {
    const { added = [], removed = [], changed = [] } = diff.overrides;
    const total = added.length + removed.length + changed.length;
    sections.push(`Exceptions (${total})`);
  }
  return sections.length ? sections.join(' • ') : 'Profil mis à jour';
}

export function evaluatePermission(
  user: UserAccount,
  groups: GroupDefinition[],
  key: PermissionKey,
): PermissionEvaluation {
  const inheritedFrom = groups
    .filter(
      (group) => user.groups.includes(group.id) && group.defaultPermissions.includes(key),
    )
    .map((group) => group.name);
  const basePermission = BASE_PERMISSIONS.includes(key);

  if (user.isSuperAdmin) {
    return {
      key,
      effective: true,
      origin: 'superadmin' as const,
      inheritedFrom,
      basePermission,
    };
  }

  const override = user.permissionOverrides.find((candidate) => candidate.key === key);
  if (override) {
    const origin: PermissionEvaluationOrigin =
      override.mode === 'allow' ? 'override-allow' : 'override-deny';
    return {
      key,
      effective: override.mode === 'allow',
      origin,
      overrideMode: override.mode,
      inheritedFrom,
      basePermission,
    };
  }

  if (basePermission) {
    return {
      key,
      effective: true,
      origin: 'base' as const,
      inheritedFrom,
      basePermission,
    };
  }

  if (inheritedFrom.length > 0) {
    return {
      key,
      effective: true,
      origin: 'group' as const,
      inheritedFrom,
      basePermission,
    };
  }

  return {
    key,
    effective: false,
    origin: 'none' as const,
    inheritedFrom,
    basePermission,
  };
}

export function computeEffectivePermissions(
  user: UserAccount,
  groups: GroupDefinition[],
): PermissionKey[] {
  if (user.isSuperAdmin) {
    return PERMISSION_DEFINITIONS.map((permission) => permission.key);
  }

  const effective: PermissionKey[] = [];
  for (const definition of PERMISSION_DEFINITIONS) {
    const evaluation = evaluatePermission(user, groups, definition.key);
    if (evaluation.effective) {
      effective.push(definition.key);
    }
  }
  return effective;
}

export async function updateUserAccess(payload: UpdateUserAccessPayload): Promise<UserAccount> {
  const db = readDatabase();
  const userIndex = db.users.findIndex((candidate) => candidate.id === payload.userId);
  if (userIndex === -1) {
    throw new Error('Utilisateur introuvable');
  }

  const current = db.users[userIndex];
  const { validGroups } = sanitizeGroups(db, payload.groups);
  const sanitizedOverrides = sanitizeOverrides(payload.permissionOverrides);
  const updatedAt = new Date().toISOString();

  const updated: UserAccount = {
    ...current,
    groups: validGroups,
    permissionOverrides: sanitizedOverrides,
    updatedAt,
  };

  db.users[userIndex] = updated;

  const groupDiff = diffArrays(current.groups, validGroups);
  const overridesDiff = diffOverrides(current.permissionOverrides, sanitizedOverrides);
  const actorId = payload.actorId ?? db.currentUserId;
  const actor = db.users.find((candidate) => candidate.id === actorId);

  db.auditLog.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 10_000)}`,
    userId: current.id,
    actorId,
    actorName: actor?.displayName ?? 'Système',
    message: buildAuditMessage({ groups: groupDiff, overrides: overridesDiff }),
    timestamp: updatedAt,
    groupChanges: groupDiff,
    overrideChanges: overridesDiff,
  });
  db.auditLog = db.auditLog.slice(0, 100);

  persistDatabase(db);
  return simulateLatency(updated);
}

export async function resetDatabase(): Promise<DatabaseSchema> {
  const seeded = createSeedDatabase();
  persistDatabase(seeded);
  return simulateLatency(seeded);
}
