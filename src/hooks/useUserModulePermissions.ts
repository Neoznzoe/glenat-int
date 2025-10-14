import { useQuery } from '@tanstack/react-query';
import {
  fetchUserPermissions,
  USER_PERMISSIONS_QUERY_KEY,
  type UserPermissionRecord,
} from '@/lib/userPermissions';

function normalizeIdentifier(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function filterPermissionsForUser(
  records: UserPermissionRecord[],
  userId: string,
): UserPermissionRecord[] {
  const visibilityByModule = new Map<string, UserPermissionRecord>();

  records.forEach((record) => {
    if (record.permissionType !== 'module') {
      return;
    }
    if (!record.moduleId || record.canView === null) {
      return;
    }
    if (record.userId !== userId) {
      return;
    }

    visibilityByModule.set(record.moduleId, record);
  });

  return Array.from(visibilityByModule.values());
}

export function useUserModulePermissions(userId?: string) {
  const normalizedUserId = normalizeIdentifier(userId);

  return useQuery<UserPermissionRecord[]>({
    queryKey: [...USER_PERMISSIONS_QUERY_KEY, normalizedUserId ?? 'anonymous'],
    queryFn: fetchUserPermissions,
    enabled: Boolean(normalizedUserId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    select: (records) =>
      normalizedUserId ? filterPermissionsForUser(records, normalizedUserId) : [],
  });
}

export type { UserPermissionRecord } from '@/lib/userPermissions';
