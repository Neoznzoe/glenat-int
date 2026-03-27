import { useQuery } from '@tanstack/react-query';
import {
  fetchNotifications,
  NOTIFICATIONS_QUERY_KEY,
  type NotificationGroup,
} from '@/lib/notificationsApi';

export function useNotifications(userId: number | undefined) {
  return useQuery<NotificationGroup[]>({
    queryKey: NOTIFICATIONS_QUERY_KEY(userId ?? 0),
    queryFn: () => fetchNotifications(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export type { NotificationGroup } from '@/lib/notificationsApi';
