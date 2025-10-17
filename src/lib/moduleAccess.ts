import type { PermissionDefinition, PermissionKey } from '@/lib/access-control';

export type ModuleMetadata = Record<string, unknown>;

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
  return `/${normalized}`;
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

export function resolveModulePermissionKey(definition: PermissionDefinition): PermissionKey {
  const metadata = (definition.metadata ?? {}) as ModuleMetadata;
  const permissionCandidate = toNonEmptyString(metadata.permissionKey);
  const rawKey = (permissionCandidate ?? definition.key) as string;
  return rawKey.trim().toLowerCase() as PermissionKey;
}

export function resolveModuleVisibility(metadata: ModuleMetadata): boolean | undefined {
  const value =
    metadata.isUserVisible ?? metadata.userVisible ?? metadata.visible ?? metadata.isVisible;

  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }
    if (['1', 'true', 'oui', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'non', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}
