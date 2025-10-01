import {
  fetchUsers,
  fetchGroups,
  fetchPermissions,
  fetchAuditLog,
  fetchCurrentUser,
  persistUserAccess,
  fetchGroupMembers,
  createGroup,
  addUserToGroup,
  type UpdateUserAccessPayload,
  type UserAccount,
  type PermissionOverride,
  type AuditLogEntry,
  type GroupMember,
} from '@/lib/adminApi';
import { type GroupDefinition, type PermissionDefinition } from '@/lib/access-control';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const USERS_QUERY_KEY = ['admin', 'users'] as const;
const GROUPS_QUERY_KEY = ['admin', 'groups'] as const;
const PERMISSIONS_QUERY_KEY = ['admin', 'permissions'] as const;
const CURRENT_USER_QUERY_KEY = ['admin', 'current-user'] as const;
const AUDIT_LOG_QUERY_KEY = ['admin', 'audit-log'] as const;
const GROUP_MEMBERS_QUERY_KEY = ['admin', 'group-members'] as const;

export function useAdminUsers() {
  return useQuery<UserAccount[]>({ queryKey: USERS_QUERY_KEY, queryFn: fetchUsers });
}

export function useAdminGroups() {
  return useQuery<GroupDefinition[]>({
    queryKey: GROUPS_QUERY_KEY,
    queryFn: fetchGroups,
  });
}

export function usePermissionDefinitions() {
  return useQuery<PermissionDefinition[]>({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: fetchPermissions,
  });
}

export function useAdminGroupMembers() {
  return useQuery<GroupMember[]>({
    queryKey: GROUP_MEMBERS_QUERY_KEY,
    queryFn: fetchGroupMembers,
  });
}

export function useAuditLog(limit = 25) {
  return useQuery<AuditLogEntry[]>({
    queryKey: [...AUDIT_LOG_QUERY_KEY, limit],
    queryFn: () => fetchAuditLog(limit),
  });
}

export function useCurrentUser() {
  return useQuery<UserAccount>({ queryKey: CURRENT_USER_QUERY_KEY, queryFn: fetchCurrentUser });
}

interface UpdateUserOptions {
  actorId?: string;
}

export function useUpdateUserAccess(options?: UpdateUserOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<UpdateUserAccessPayload, 'actorId'>) =>
      persistUserAccess({ ...payload, actorId: options?.actorId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: AUDIT_LOG_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY }),
      ]);
    },
  });
}

export function useCreateGroup(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createGroup(name),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: GROUP_MEMBERS_QUERY_KEY }),
      ]);
      options?.onSuccess?.();
    },
  });
}

export function useAddUserToGroup(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { userId: string; groupId: string }) => addUserToGroup(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: GROUP_MEMBERS_QUERY_KEY }),
      ]);
      options?.onSuccess?.();
    },
  });
}

export type { UserAccount, PermissionOverride, AuditLogEntry };
export {
  USERS_QUERY_KEY,
  GROUPS_QUERY_KEY,
  PERMISSIONS_QUERY_KEY,
  CURRENT_USER_QUERY_KEY,
  AUDIT_LOG_QUERY_KEY,
  GROUP_MEMBERS_QUERY_KEY,
};
