import {
  type AuditLogEntry,
  type PermissionOverride,
  type UpdateUserAccessPayload,
  type UserAccount,
} from './mockDb';
import { type GroupDefinition, type PermissionDefinition } from './access-control';

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
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
