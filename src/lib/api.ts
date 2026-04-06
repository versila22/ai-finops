import type {
  Provider,
  Alert,
  ManualAdjustment,
  DailyUsage,
} from "@/data/mockData";
import { clearToken, getToken, setToken } from "@/lib/auth";

const BASE_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : "/api/v1";

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

function handleUnauthorized() {
  clearToken();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth = false, headers, ...init } = options;
  const token = skipAuth ? null : getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let detail = `${res.statusText} (${path})`;
    try {
      const data = await res.json();
      detail = data?.detail ?? detail;
    } catch {
      // ignore JSON parse failures for plain-text responses
    }
    throw new Error(`API error ${res.status}: ${detail}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

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

interface ProviderDetailApiResponse {
  provider: Provider;
  dailyUsage: DailyUsage[];
  alerts: Alert[];
  adjustments: ManualAdjustment[];
}

export interface ProviderDetailResponse extends Provider {
  dailyUsage: DailyUsage[];
  alerts: Alert[];
  adjustments: ManualAdjustment[];
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });
  setToken(result.accessToken);
  return result;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  await apiFetch<AuthUser>("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });
  return login(email, password);
}

export function logout() {
  clearToken();
}

export function fetchDashboard(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/dashboard");
}

export function fetchProviders(): Promise<Provider[]> {
  return apiFetch<Provider[]>("/providers");
}

export async function fetchProvider(id: string): Promise<ProviderDetailResponse> {
  const response = await apiFetch<ProviderDetailApiResponse>(`/providers/${id}`);
  return {
    ...response.provider,
    dailyUsage: response.dailyUsage,
    alerts: response.alerts,
    adjustments: response.adjustments,
  };
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

export function syncAllProviders(): Promise<unknown> {
  return apiFetch<unknown>("/sync/all", { method: "POST" });
}

export function syncProvider(providerId: string): Promise<unknown> {
  return apiFetch<unknown>(`/sync/${providerId}`, { method: "POST" });
}
