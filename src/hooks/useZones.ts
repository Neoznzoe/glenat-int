import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchZones,
  fetchZone,
  createZone,
  updateZone,
  deleteZone,
  type Zone,
  type CreateZonePayload,
} from '@/lib/zonesApi';

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
  });
}

export function useZone(zoneId: string | null) {
  return useQuery({
    queryKey: ['zones', zoneId],
    queryFn: () => (zoneId ? fetchZone(zoneId) : Promise.reject(new Error('No zone ID'))),
    enabled: zoneId !== null,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateZonePayload) => createZone(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zoneId, payload }: { zoneId: string; payload: Partial<CreateZonePayload> }) =>
      updateZone(zoneId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['zones'] });
      void queryClient.invalidateQueries({ queryKey: ['zones', variables.zoneId] });
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteZone(zoneId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

export type { Zone, CreateZonePayload };
