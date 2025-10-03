import {
  fetchUsers,
  fetchGroups,
  fetchPermissions,
  fetchAuditLog,
  fetchCurrentUser,
  persistUserAccess,
  persistModuleOverrideChange,
  createGroup,
  type UpdateUserAccessPayload,
  type UpdateModuleOverridePayload,
  type UserAccount,
  type PermissionOverride,
  type AuditLogEntry,
} from '@/lib/adminApi';
import { type GroupDefinition, type PermissionDefinition } from '@/lib/access-control';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const USERS_QUERY_KEY = ['admin', 'users'] as const;
const GROUPS_QUERY_KEY = ['admin', 'groups'] as const;
const PERMISSIONS_QUERY_KEY = ['admin', 'permissions'] as const;
const CURRENT_USER_QUERY_KEY = ['admin', 'current-user'] as const;
const AUDIT_LOG_QUERY_KEY = ['admin', 'audit-log'] as const;

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

function useUserAccessMutation(options?: UpdateUserOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<UpdateUserAccessPayload, 'actorId'>) =>
      persistUserAccess({ ...payload, actorId: options?.actorId }),
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData<UserAccount[]>(USERS_QUERY_KEY, (users) => {
        if (!users) {
          return users;
        }

        let hasMatch = false;
        const nextUsers = users.map((user) => {
          if (user.id !== updatedUser.id) {
            return user;
          }

          hasMatch = true;
          return { ...user, ...updatedUser };
        });

        return hasMatch ? nextUsers : users;
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: AUDIT_LOG_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY }),
      ]);
    },
  });
}

export function useUpdateUserAccess(options?: UpdateUserOptions) {
  return useUserAccessMutation(options);
}

export function usePersistModuleOverride(options?: UpdateUserOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<UpdateModuleOverridePayload, 'actorId'>) =>
      persistModuleOverrideChange({ ...payload, actorId: options?.actorId }),
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData<UserAccount[]>(USERS_QUERY_KEY, (users) => {
        if (!users) {
          return users;
        }

        let hasMatch = false;
        const nextUsers = users.map((user) => {
          if (user.id !== updatedUser.id) {
            return user;
          }

          hasMatch = true;
          return { ...user, ...updatedUser };
        });

        return hasMatch ? nextUsers : users;
      });

      await Promise.all([
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
};
