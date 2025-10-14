const MODULES_ENDPOINT = import.meta.env.DEV
  ? '/intranet/call-database'
  : 'https://api-dev.groupe-glenat.com/Api/v1.0/Intranet/callDatabase';

const MODULES_QUERY = 'SELECT * FROM [modules];';

export interface RawModuleRecord {
  [key: string]: unknown;
}

export interface ModuleRecord {
  id: string;
  key: string;
  slug: string;
  displayName?: string;
  description?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

interface DatabaseModulesResponse {
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

function normalizeId(value: unknown, index: number): string {
  const candidate = toNonEmptyString(value);
  if (candidate) {
    return candidate;
  }
  return `module-${index + 1}`;
}

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function toOptionalBoolean(value: unknown): boolean | undefined {
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
      return undefined;
    }
    if (['1', 'true', 'yes', 'oui', 'active'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'no', 'non', 'inactive'].includes(normalized)) {
      return false;
    }
  }
  return undefined;
}

function humanizeFallback(slug: string): string {
  if (!slug) {
    return '';
  }
  const spaced = slug
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractArray(payload: unknown): RawModuleRecord[] {
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
    ? (arrayCandidate.filter((item) => item && typeof item === 'object') as RawModuleRecord[])
    : [];
}

function normalizeModule(record: RawModuleRecord, index: number): ModuleRecord | null {
  const rawName =
    toNonEmptyString(record.name) ??
    toNonEmptyString((record as Record<string, unknown>).Name) ??
    toNonEmptyString(record.slug) ??
    toNonEmptyString((record as Record<string, unknown>).Slug);

  if (!rawName) {
    return null;
  }

  const id = normalizeId(
    record.id ?? (record as Record<string, unknown>).ID ?? record.moduleId ?? record.ModuleId,
    index,
  );
  const slug = normalizeKey(rawName);

  const displayName =
    toNonEmptyString(
      record.displayName ??
        (record as Record<string, unknown>).DisplayName ??
        record.label ??
        (record as Record<string, unknown>).Label ??
        record.title ??
        (record as Record<string, unknown>).Title ??
        record.supportMultilingual ??
        (record as Record<string, unknown>).SupportMultilingual,
    ) ?? humanizeFallback(rawName);

  const description =
    toNonEmptyString(record.description ?? (record as Record<string, unknown>).Description) ??
    undefined;
  const isActive = toOptionalBoolean(record.isActive ?? (record as Record<string, unknown>).IsActive);

  const knownKeys = new Set([
    'id',
    'ID',
    'moduleId',
    'ModuleId',
    'moduleID',
    'ModuleID',
    'name',
    'Name',
    'slug',
    'Slug',
    'displayName',
    'DisplayName',
    'label',
    'Label',
    'title',
    'Title',
    'supportMultilingual',
    'SupportMultilingual',
    'description',
    'Description',
    'isActive',
    'IsActive',
  ]);

  const metadataEntries = Object.entries(record).filter(([key]) => !knownKeys.has(key));
  const metadata = {
    ...(metadataEntries.length ? Object.fromEntries(metadataEntries) : {}),
    rawName,
  };

  return {
    id,
    key: slug,
    slug,
    displayName,
    description,
    isActive,
    metadata,
  };
}

export async function fetchModules(): Promise<ModuleRecord[]> {
  const response = await fetch(MODULES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: MODULES_QUERY }),
  });

  if (!response.ok) {
    throw new Error(
      `La récupération des modules a échoué (${response.status}) ${response.statusText}`,
    );
  }

  const data = (await response.json()) as DatabaseModulesResponse;
  if (data.success === false) {
    throw new Error(data.message || 'La récupération des modules a échoué.');
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

  const modules: ModuleRecord[] = [];
  rawRecords.forEach((record, index) => {
    const normalized = normalizeModule(record, index);
    if (normalized) {
      modules.push(normalized);
    }
  });

  modules.sort((left, right) => left.key.localeCompare(right.key, 'fr', { numeric: true }));

  return modules;
}

export const MODULES_QUERY_KEY = ['modules'] as const;

export { MODULES_ENDPOINT, MODULES_QUERY };
