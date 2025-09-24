import { requestJson } from '@/api/client';
import type {
  AuditLogEntry,
  GroupDefinition,
  PermissionDefinition,
  PermissionOverride,
  UpdateUserAccessPayload,
  UserAccount,
} from './types';

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
    body: JSON.stringify(body satisfies Omit<UpdateUserAccessPayload, 'userId'>),
  });
}

export type {
  AuditLogEntry,
  GroupDefinition,
  PermissionDefinition,
  PermissionOverride,
  UpdateUserAccessPayload,
  UserAccount,
};
