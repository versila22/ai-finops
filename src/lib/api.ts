import type {
  Provider,
  Alert,
  ManualAdjustment,
  DailyUsage,
} from "@/data/mockData";

// Use /api/v1 in dev (proxied by Vite to http://localhost:8001)
// In prod, use VITE_API_URL env var or fallback to /api/v1
const BASE_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : "/api/v1";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText} (${path})`);
  }
  return res.json() as Promise<T>;
}

// --- Types for API responses ---

export interface DashboardKPIs {
  monthlyBudget: number;
  totalSpend: number;
  totalPlanSpend: number;
  totalOverage: number;
  budgetUsedPercent: number;
  activeAlertCount: number;
  potentialSavings: number;
}

export interface DashboardResponse {
  providers: Provider[];
  alerts: Alert[];
  kpis: DashboardKPIs;
}

export interface ProviderDetailResponse extends Provider {
  dailyUsage: DailyUsage[];
  alerts: Alert[];
  adjustments: ManualAdjustment[];
}

// --- Fetch functions ---

export function fetchDashboard(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/dashboard");
}

export function fetchProviders(): Promise<Provider[]> {
  return apiFetch<Provider[]>("/providers");
}

export function fetchProvider(id: string): Promise<ProviderDetailResponse> {
  return apiFetch<ProviderDetailResponse>(`/providers/${id}`);
}

export function fetchAlerts(): Promise<Alert[]> {
  return apiFetch<Alert[]>("/alerts");
}

export function fetchPlans(): Promise<Provider[]> {
  return apiFetch<Provider[]>("/plans");
}

export function fetchAdjustments(): Promise<ManualAdjustment[]> {
  return apiFetch<ManualAdjustment[]>("/adjustments");
}

export function fetchSettings(): Promise<unknown> {
  return apiFetch<unknown>("/settings");
}
