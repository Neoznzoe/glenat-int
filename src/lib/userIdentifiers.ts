import type { DatabaseUserLookupResponse } from '@/lib/internalUserLookup';

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

function collectInternalUserRecords(value: unknown): Record<string, unknown>[] {
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
    for (const key of [
      'result',
      'Result',
      'Recordset',
      'recordset',
      'records',
      'rows',
      'data',
    ]) {
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

export function extractInternalUserId(
  internalUser?: DatabaseUserLookupResponse | null,
): number | undefined {
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
    const possibleId =
      candidate['userId'] ??
      candidate['UserId'] ??
      candidate['userID'] ??
      candidate['USERID'] ??
      candidate['id'] ??
      candidate['ID'];
    const numericId = toNumberValue(possibleId);
    if (numericId !== undefined) {
      return numericId;
    }
  }

  return undefined;
}

export function toNumericId(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

