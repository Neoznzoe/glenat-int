import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getCurrentUser, getModules, getUserPermissions } from "@/api/client";
import { CurrentUser, Module, UserPermission } from "@/types/sidebar";

const STALE_TIME = 60_000;
const RETRY_COUNT = 1;

export function useModulesQuery(): UseQueryResult<Module[], Error> {
  return useQuery<Module[], Error>({
    queryKey: ["modules"],
    queryFn: ({ signal }) => getModules({ signal }),
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
}

export function useUserPermissionsQuery(): UseQueryResult<UserPermission[], Error> {
  return useQuery<UserPermission[], Error>({
    queryKey: ["me", "permissions"],
    queryFn: ({ signal }) => getUserPermissions({ signal }),
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
}

export function useCurrentUserQuery(): UseQueryResult<CurrentUser, Error> {
  return useQuery<CurrentUser, Error>({
    queryKey: ["me"],
    queryFn: ({ signal }) => getCurrentUser({ signal }),
    staleTime: STALE_TIME,
    retry: RETRY_COUNT,
  });
}
