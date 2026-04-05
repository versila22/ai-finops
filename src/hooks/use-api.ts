import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboard,
  fetchProviders,
  fetchProvider,
  fetchAlerts,
  fetchPlans,
  fetchAdjustments,
  type DashboardResponse,
  type ProviderDetailResponse,
} from "@/lib/api";
import type { Provider, Alert, ManualAdjustment } from "@/data/mockData";

export function useDashboard() {
  return useQuery<DashboardResponse, Error>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30_000,
  });
}

export function useProviders() {
  return useQuery<Provider[], Error>({
    queryKey: ["providers"],
    queryFn: fetchProviders,
    staleTime: 60_000,
  });
}

export function useProvider(id: string) {
  return useQuery<ProviderDetailResponse, Error>({
    queryKey: ["provider", id],
    queryFn: () => fetchProvider(id),
    staleTime: 60_000,
    enabled: Boolean(id),
  });
}

export function useAlerts() {
  return useQuery<Alert[], Error>({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    staleTime: 60_000,
  });
}

export function usePlans() {
  return useQuery<Provider[], Error>({
    queryKey: ["plans"],
    queryFn: fetchPlans,
    staleTime: 60_000,
  });
}

export function useAdjustments() {
  return useQuery<ManualAdjustment[], Error>({
    queryKey: ["adjustments"],
    queryFn: fetchAdjustments,
    staleTime: 60_000,
  });
}
