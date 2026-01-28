import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DatabaseUserLookupResponse } from '@/lib/internalUserLookup';

type ModuleMetadata = Record<string, unknown>;

export function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  return undefined;
}

export function toNumberValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number.parseFloat(trimmed);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

export function resolveBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return fallback;
    }
    if (['0', 'false', 'non', 'no', 'off'].includes(normalized)) {
      return false;
    }
    if (['1', 'true', 'oui', 'yes', 'on'].includes(normalized)) {
      return true;
    }
  }
  return fallback;
}

export function toNumericId(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function collectInternalUserRecords(value: unknown): Record<string, unknown>[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter(
      (entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null,
    );
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nested: Record<string, unknown>[] = [];
    for (const key of ['result', 'Result', 'Recordset', 'recordset', 'records', 'rows', 'data']) {
      if (key in record) {
        nested.push(...collectInternalUserRecords(record[key]));
      }
    }
    if (nested.length > 0) {
      return nested;
    }
    return [record];
  }
  return [];
}

export function extractInternalUserId(internalUser?: DatabaseUserLookupResponse | null): number | undefined {
  if (!internalUser) {
    return undefined;
  }

  const record = internalUser as Record<string, unknown>;
  const resultBuckets: Record<string, unknown>[] = [];

  if ('result' in record) {
    resultBuckets.push(...collectInternalUserRecords(record['result']));
  }
  if ('Result' in record) {
    resultBuckets.push(...collectInternalUserRecords(record['Result']));
  }

  const candidates = resultBuckets.length ? resultBuckets : collectInternalUserRecords(record);

  if (!candidates.length) {
    for (const key of ['Recordset', 'recordset', 'records', 'rows', 'data']) {
      if (key in record) {
        candidates.push(...collectInternalUserRecords(record[key]));
      }
      if (candidates.length) {
        break;
      }
    }
  }

  for (const candidate of candidates) {
    const possibleId = candidate['userId'] ?? candidate['UserId'] ?? candidate['userID'] ?? candidate['USERID'] ?? candidate['id'] ?? candidate['ID'];
    const numericId = toNumberValue(possibleId);
    if (numericId !== undefined) {
      return numericId;
    }
  }

  return undefined;
}

export function normalizeRoute(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/^[a-z]+:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed === '/') {
    return '/';
  }
  const normalized = trimmed.replace(/^\/+/, '');
  const route = `/${normalized}`;
  const normalizedRoute = route.toLowerCase();
  if (normalizedRoute === '/calendar' || normalizedRoute === '/calendrier') {
    return '/agenda';
  }
  return route;
}

export function extractModulePath(metadata: ModuleMetadata, key: string): string | null {
  const candidates = [
    toNonEmptyString(metadata.path),
    toNonEmptyString(metadata.url),
    toNonEmptyString(metadata.href),
    toNonEmptyString(metadata.route),
    toNonEmptyString(metadata.externalPath),
    toNonEmptyString(metadata.slug),
    key,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const normalized = normalizeRoute(candidate);
    if (normalized) {
      return normalized;
    }
  }

  if (key && key.trim().toLowerCase() === 'home') {
    return '/';
  }

  return null;
}

export function resolveBadgeValue(badge: unknown, jobCount?: number): number | string | undefined {
  const normalizedJobCount = typeof jobCount === 'number' && Number.isFinite(jobCount) && jobCount > 0 ? Math.trunc(jobCount) : undefined;

  const resolvePrimitive = (value: unknown): number | string | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      if (value <= 0) {
        return undefined;
      }
      if (value === 1 && normalizedJobCount !== undefined) {
        return normalizedJobCount;
      }
      return Math.trunc(value);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return undefined;
      }
      const numeric = Number.parseFloat(trimmed);
      if (!Number.isNaN(numeric)) {
        if (numeric <= 0) {
          return undefined;
        }
        if (numeric === 1 && normalizedJobCount !== undefined) {
          return normalizedJobCount;
        }
        return Math.trunc(numeric);
      }
      if (normalizedJobCount !== undefined && trimmed.toLowerCase() === 'jobcount') {
        return normalizedJobCount;
      }
      return trimmed;
    }
    return undefined;
  };

  if (badge === null || badge === undefined) {
    return undefined;
  }

  const primitiveValue = resolvePrimitive(badge);
  if (primitiveValue !== undefined) {
    return primitiveValue;
  }

  if (typeof badge === 'object') {
    const badgeRecord = badge as Record<string, unknown>;

    if (normalizedJobCount !== undefined) {
      const typeValue = toNonEmptyString(badgeRecord.type)?.toLowerCase();
      if (typeValue && ['jobcount', 'count', 'job-count'].includes(typeValue)) {
        return normalizedJobCount;
      }
    }

    if ('value' in badgeRecord) {
      return resolvePrimitive(badgeRecord.value);
    }
  }

  return undefined;
}

export const ICON_ALIAS_MAP: Record<string, keyof typeof LucideIcons> = {
  home: 'Home',
  accueil: 'Home',
  dashboard: 'LayoutDashboard',
  annuaire: 'Users',
  collaborateurs: 'Users',
  'qui-fait-quoi': 'Users',
  catalogue: 'BookOpen',
  kiosque: 'Newspaper',
  kiosk: 'Newspaper',
  actualites: 'Newspaper',
  news: 'Newspaper',
  agenda: 'CalendarDays',
  planning: 'CalendarCheck',
  evenement: 'CalendarCheck',
  events: 'CalendarCheck',
  emploi: 'BriefcaseBusiness',
  jobs: 'BriefcaseBusiness',
  recrutement: 'BriefcaseBusiness',
  ressources: 'Boxes',
  ressourceshumaines: 'UserCog',
  rh: 'UserCog',
  formations: 'GraduationCap',
  communication: 'Megaphone',
  contact: 'AtSign',
  annonce: 'Megaphone',
  outils: 'Wrench',
  documentation: 'Files',
  documents: 'Files',
  doc: 'Files',
  support: 'LifeBuoy',
  admin: 'Settings',
  administration: 'Settings',
  parametres: 'Settings',
  configuration: 'SlidersHorizontal',
  statistiques: 'BarChart3',
  rapports: 'BarChart3',
  rapport: 'BarChart3',
  glenart: 'Palette',
  kiosquedoc: 'Newspaper',
  service: 'Building2',
  services: 'Building2',
  operations: 'Workflow',
  procedure: 'Workflow',
  processus: 'Workflow',
  facturation: 'Receipt',
  finance: 'PieChart',
  partenaires: 'Handshake',
};

export function normalizeIconKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function resolveLucideIcon(name?: string): LucideIcon | null {
  if (!name) {
    return null;
  }
  const normalized = name.trim();
  if (!normalized) {
    return null;
  }

  const sanitized = normalized
    .replace(/^lucide[:\s_-]*/i, '')
    .replace(/^icon[:\s_-]*/i, '')
    .replace(/^uil[:\s_-]*/i, '')
    .replace(/^fa[:\s_-]*/i, '')
    .replace(/icon$/i, '')
    .replace(/[-_\s]+icon$/i, '')
    .replace(/^[^a-z0-9]+/i, '')
    .replace(/[^a-z0-9]+$/i, '');

  const base = sanitized || normalized;
  const segments = base.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const pascal = segments.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('');
  const camel = pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : '';
  const upper = base.toUpperCase();
  const lower = base.toLowerCase();
  const kebab = segments.map((part) => part.toLowerCase()).join('-');

  const aliasCandidates = [normalized, sanitized, base, kebab];
  for (const candidate of aliasCandidates) {
    if (!candidate) {
      continue;
    }
    const alias = ICON_ALIAS_MAP[normalizeIconKey(candidate)];
    if (alias) {
      const iconCandidate = LucideIcons[alias as keyof typeof LucideIcons];
      if (iconCandidate) {
        return iconCandidate as LucideIcon;
      }
    }
  }

  const variants = new Set<string>([normalized, sanitized, base, pascal, camel, lower, upper, kebab]);

  if (pascal) {
    variants.add(pascal.replace(/\d+$/, (match) => match));
  }

  if (segments.length > 1) {
    variants.add(segments.join(''));
  }

  for (const candidate of variants) {
    if (!candidate) {
      continue;
    }
    const iconCandidate = LucideIcons[candidate as keyof typeof LucideIcons];
    if (iconCandidate) {
      return iconCandidate as LucideIcon;
    }
  }

  return null;
}

export interface SidebarModuleEntry {
  id: string;
  label: string;
  path: string;
  permission: string;
  icon: LucideIcon | null;
  badge?: number | string;
  order: number;
  section?: string;
}

export function isAdministrationModule(module: SidebarModuleEntry): boolean {
  if (module.section) {
    const normalized = module.section.toLowerCase();
    if (normalized === 'administration' || normalized === 'admin') {
      return true;
    }
  }
  return module.permission.toLowerCase() === 'administration';
}
