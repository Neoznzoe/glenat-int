import { useQuery } from '@tanstack/react-query';
import {
  fetchTravelingToday,
  fetchPlannedTravel,
  fetchVisitingToday,
  PRESENCE_TRAVELING_TODAY_QUERY_KEY,
  PRESENCE_PLANNED_TRAVEL_QUERY_KEY,
  PRESENCE_VISITING_TODAY_QUERY_KEY,
  type PresencePerson,
} from '@/lib/presenceApi';

export function useTravelingToday() {
  return useQuery<PresencePerson[]>({
    queryKey: [...PRESENCE_TRAVELING_TODAY_QUERY_KEY],
    queryFn: fetchTravelingToday,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function usePlannedTravel() {
  return useQuery<PresencePerson[]>({
    queryKey: [...PRESENCE_PLANNED_TRAVEL_QUERY_KEY],
    queryFn: fetchPlannedTravel,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useVisitingToday() {
  return useQuery<PresencePerson[]>({
    queryKey: [...PRESENCE_VISITING_TODAY_QUERY_KEY],
    queryFn: fetchVisitingToday,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export type { PresencePerson } from '@/lib/presenceApi';
