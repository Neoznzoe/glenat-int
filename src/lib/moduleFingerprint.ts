import type { PermissionDefinition } from '@/lib/access-control';

const RELEVANT_METADATA_KEYS = [
  'id',
  'slug',
  'path',
  'externalPath',
  'permissionKey',
  'isActive',
  'section',
  'order',
  'version',
  'updatedAt',
] as const;

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  return undefined;
}

export function createModuleFingerprint(modules: PermissionDefinition[]): string {
  const normalized = modules
    .filter((definition) => definition.type === 'module' || definition.type === undefined)
    .map((definition) => {
      const metadata =
        definition.metadata && typeof definition.metadata === 'object'
          ? (definition.metadata as Record<string, unknown>)
          : undefined;

      const sanitizedMetadata = metadata
        ? RELEVANT_METADATA_KEYS.reduce((accumulator, key) => {
            if (key in metadata) {
              const value = metadata[key];
              if (value !== undefined) {
                accumulator[key] = value;
              }
            }
            return accumulator;
          }, {} as Record<string, unknown>)
        : undefined;

      return {
        key: definition.key ?? null,
        type: definition.type ?? null,
        parentKey: definition.parentKey ?? null,
        label: definition.label ?? null,
        metadata: sanitizedMetadata,
      };
    })
    .sort((left, right) => {
      const leftKey = toNonEmptyString(left.key) ?? '';
      const rightKey = toNonEmptyString(right.key) ?? '';
      return leftKey.localeCompare(rightKey, 'fr', { sensitivity: 'base' });
    });

  return JSON.stringify(normalized);
}
