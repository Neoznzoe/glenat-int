import {
  type AuditLogEntry,
  type PermissionOverride,
  type UpdateUserAccessPayload,
  type UserAccount,
} from './mockDb';
import { type GroupDefinition, type PermissionDefinition } from './access-control';
import { encryptUrlPayload, isUrlEncryptionConfigured } from './urlEncryption';

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

export async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
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
  return requestJson<UserAccount[]>('/api/admin/users');
}

export async function fetchGroups(): Promise<GroupDefinition[]> {
  return requestJson<GroupDefinition[]>('/api/admin/groups');
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
  const { userId, ...body } = payload;
  return requestJson<UserAccount>(`/api/admin/users/${encodeURIComponent(userId)}/access`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export type { UserAccount, PermissionOverride, AuditLogEntry, UpdateUserAccessPayload };
