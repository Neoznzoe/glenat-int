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
}

export interface UpdateUserAccessPayload {
  userId: string;
  groups: string[];
  permissionOverrides: PermissionOverride[];
  actorId?: string;
}

const STORAGE_KEY = 'glenat-admin-database-v1';
const DB_VERSION = 2;
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

const FIRST_NAMES = [
  'Alice',
  'Benoît',
  'Chloé',
  'David',
  'Emma',
  'Fanny',
  'Gaël',
  'Hugo',
  'Inès',
  'Jules',
  'Katia',
  'Léon',
  'Maya',
  'Nina',
  'Olivier',
  'Paul',
  'Quentin',
  'Romy',
  'Simon',
  'Théo',
  'Ulysse',
  'Valentine',
  'William',
  'Xavier',
  'Yasmine',
  'Zoé',
];

const LAST_NAMES = [
  'Armand',
  'Barbier',
  'Carrel',
  'Duhamel',
  'Ernault',
  'Foucher',
  'Giraud',
  'Hamel',
  'Imbert',
  'Jacquet',
  'Kerouac',
  'Lafitte',
  'Monnier',
  'Noirot',
  'Ozenne',
  'Picard',
  'Quenot',
  'Roussel',
  'Saurin',
  'Taillet',
  'Urbain',
  'Vigier',
  'Weiss',
  'Xénard',
  'Yvernault',
  'Zola',
];

const JOB_TITLES = [
  'Chargé·e de communication',
  'Responsable éditorial',
  'Chef de projet digital',
  'Assistant·e RH',
  'Contrôleur de gestion',
  'Graphiste',
  'Technicien atelier',
  'Gestionnaire de production',
  'Commercial diffusion',
  'Chef de produit',
];

const DEPARTMENTS = [
  'Communication',
  'Éditorial',
  'Digital',
  'Ressources humaines',
  'Finance',
  'Studio graphique',
  'Atelier',
  'Production',
  'Diffusion',
  'Marketing',
];

const LOCATIONS = [
  'Grenoble',
  'Paris',
  'Lyon',
  'Bordeaux',
  'Toulouse',
  'Nantes',
  'Lille',
];

const PHONE_PREFIXES = ['01', '02', '03', '04', '05', '09'];

function pickFrom<T>(list: T[], index: number): T {
  const normalizedIndex = ((index % list.length) + list.length) % list.length;
  return list[normalizedIndex];
}

function shouldRepairDisplayName(displayName: string): boolean {
  if (!displayName) {
    return true;
  }
  const trimmed = displayName.trim();
  if (!trimmed) {
    return true;
  }
  const normalizedTrimmed = trimmed.toLowerCase();
  return normalizedTrimmed.includes('undefined');
}

function shouldRepairEmail(email: string): boolean {
  if (!email) {
    return true;
  }
  const normalized = email.trim().toLowerCase();
  return !normalized || normalized.includes('undefined');
}

function parseUserIndex(userId: string, fallback: number): number {
  const match = userId.match(/^user-(\d{1,})$/);
  if (!match) {
    return fallback;
  }
  const parsed = Number.parseInt(match[1] ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function repairUser(user: UserAccount, index: number): UserAccount {
  const normalizedLastNameRaw = typeof user.lastName === 'string' ? user.lastName.trim() : '';
  const normalizedLastName =
    normalizedLastNameRaw && normalizedLastNameRaw.toLowerCase() !== 'undefined'
      ? normalizedLastNameRaw
      : '';
  if (normalizedLastName) {
    const repaired: UserAccount = {
      ...user,
      lastName: normalizedLastName,
    };

    if (shouldRepairDisplayName(user.displayName)) {
      repaired.displayName = `${user.firstName} ${normalizedLastName}`;
    }

    if (shouldRepairEmail(user.email)) {
      const regeneratedEmail = createEmail(user.firstName, normalizedLastName);
      repaired.email = regeneratedEmail;
      repaired.azureUpn = regeneratedEmail;
    } else if (shouldRepairEmail(user.azureUpn)) {
      repaired.azureUpn = user.email;
    }

    return repaired;
  }

  const fallbackIndex = parseUserIndex(user.id, index);
  const regeneratedLastName = pickFrom(LAST_NAMES, fallbackIndex);
  const regeneratedEmail = createEmail(user.firstName, regeneratedLastName);

  return {
    ...user,
    lastName: regeneratedLastName,
    displayName: `${user.firstName} ${regeneratedLastName}`,
    email: regeneratedEmail,
    azureUpn: regeneratedEmail,
  };
}

function sanitizeDatabase(db: DatabaseSchema): DatabaseSchema {
  // First, repair obviously broken fields
  let sanitizedUsers = db.users.map((user, index) => repairUser(user, index));

  // Then, ensure uniqueness of display names (first + last) to avoid duplicates
  const seen = new Set<string>();
  sanitizedUsers = sanitizedUsers.map((user, index) => {
    const first = user.firstName;
    const normalizeLast = (ln: string) => (ln ?? '').trim();
    const last = normalizeLast(user.lastName);
    const makeKey = (fn: string, ln: string) => `${fn} ${ln}`.trim();

    const key = makeKey(first, last);
    if (last && !seen.has(key)) {
      seen.add(key);
      return user;
    }

    // Try to find a different last name that makes the combination unique
    for (let attempt = 0; attempt < LAST_NAMES.length; attempt += 1) {
      const candidateLast = pickFrom(LAST_NAMES, index + attempt);
      const candidateKey = makeKey(first, candidateLast);
      if (!seen.has(candidateKey)) {
        seen.add(candidateKey);
        const email = createEmail(first, candidateLast);
        return {
          ...user,
          lastName: candidateLast,
          displayName: `${first} ${candidateLast}`,
          email,
          azureUpn: email,
        };
      }
    }

    // Fallback: accept as is (should be rare)
    seen.add(key);
    return user;
  });

  return {
    ...db,
    users: sanitizedUsers,
  };
}

function createEmail(firstName: string, lastName: string): string {
  const normalized = `${firstName}.${lastName}`
    .toLowerCase()
    .replace(/[^a-z.]/g, '-')
    .replace(/-+/g, '-');
  return `${normalized}@glenat.fr`;
}

function createUsers(groups: GroupDefinition[], count = 120): UserAccount[] {
  const users: UserAccount[] = [];
  const now = Date.now();

  const superAdmin: UserAccount = {
    id: 'user-000',
    firstName: 'Admin',
    lastName: 'Glenat',
    displayName: 'Admin Glénat',
    email: 'admin@glenat.fr',
    azureOid: generateGuid(0),
    azureUpn: 'admin@glenat.fr',
    jobTitle: 'Responsable intranet',
    department: 'DSI',
    location: 'Grenoble',
    phoneNumber: '+33 4 76 00 00 00',
    status: 'active',
    lastConnection: new Date(now - 86_400_000).toISOString(),
    createdAt: new Date(now - 45 * 86_400_000).toISOString(),
    updatedAt: new Date(now - 86_400_000).toISOString(),
    groups: groups.map((group) => group.id),
    permissionOverrides: [],
    isSuperAdmin: true,
  };

  users.push(superAdmin);

  for (let index = 1; index <= count; index += 1) {
    // Ensure unique display names by enumerating combinations of
    // FIRST_NAMES x LAST_NAMES deterministically before repeating.
    const zeroBased = index - 1;
    const lastIndex = zeroBased % LAST_NAMES.length;
    const firstIndex = Math.floor(zeroBased / LAST_NAMES.length);

    const firstName = pickFrom(FIRST_NAMES, firstIndex);
    const lastName = pickFrom(LAST_NAMES, lastIndex);
    const displayName = `${firstName} ${lastName}`;
    const email = createEmail(firstName, lastName);
    const azureOid = generateGuid(index);
    const azureUpn = email;
    const jobTitle = pickFrom(JOB_TITLES, index + 3);
    const department = pickFrom(DEPARTMENTS, index + 5);
    const location = pickFrom(LOCATIONS, index + 7);
    const phonePrefix = pickFrom(PHONE_PREFIXES, index + 11);
    const phoneNumber = `+33 ${phonePrefix} ${String(10 + (index % 80)).padStart(2, '0')} ${String(
      10 + ((index * 3) % 80),
    ).padStart(2, '0')} ${String(10 + ((index * 7) % 80)).padStart(2, '0')} ${String(
      10 + ((index * 5) % 80),
    ).padStart(2, '0')}`;
    const createdAt = new Date(now - (index + 10) * 86_400_000).toISOString();
    const updatedAt = new Date(now - (index % 12) * 86_400_000).toISOString();
    const lastConnection = new Date(now - (index % 20) * 43_200_000).toISOString();

    const groupSelection = new Set<string>();
    groupSelection.add(pickFrom(groups, index).id);
    if (index % 4 === 0) {
      groupSelection.add(pickFrom(groups, index + 2).id);
    }
    if (index % 11 === 0) {
      groupSelection.add(pickFrom(groups, index + 5).id);
    }

    const overrides: PermissionOverride[] = [];
    if (index % 6 === 0) {
      overrides.push({ key: 'temps', mode: 'allow' });
    }
    if (index % 5 === 0) {
      overrides.push({ key: 'atelier', mode: 'deny' });
    }
    if (index % 7 === 0) {
      overrides.push({ key: 'administration', mode: 'allow' });
    }
    if (index % 9 === 0) {
      overrides.push({ key: 'annonces', mode: 'deny' });
    }

    const status: 'active' | 'inactive' = index % 23 === 0 ? 'inactive' : 'active';

    users.push({
      id: `user-${String(index).padStart(3, '0')}`,
      firstName,
      lastName,
      displayName,
      email,
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
      groups: Array.from(groupSelection),
      permissionOverrides: overrides,
    });
  }

  return users;
}

function createSeedDatabase(): DatabaseSchema {
  const groups = GROUP_DEFINITIONS.map((group) => ({ ...group }));
  const permissions = PERMISSION_DEFINITIONS.map((permission) => ({ ...permission }));
  const users = createUsers(groups, 110);

  return {
    version: DB_VERSION,
    createdAt: new Date().toISOString(),
    currentUserId: 'user-000',
    users,
    groups,
    permissions,
    auditLog: [
      {
        id: 'log-0001',
        userId: 'user-003',
        actorId: 'user-000',
        actorName: 'Admin Glénat',
        message: 'Initialisation des accès – ajout des groupes de base.',
        timestamp: new Date(Date.now() - 3 * 86_400_000).toISOString(),
        groupChanges: {
          added: ['editions-glenat', 'glenat-prod'],
          removed: [],
        },
      },
      {
        id: 'log-0002',
        userId: 'user-012',
        actorId: 'user-000',
        actorName: 'Admin Glénat',
        message: 'Ajout d’une exception pour la saisie des temps.',
        timestamp: new Date(Date.now() - 2 * 86_400_000).toISOString(),
        overrideChanges: {
          added: [{ key: 'temps', mode: 'allow' }],
          removed: [],
          changed: [],
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
