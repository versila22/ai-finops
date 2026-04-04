export type SyncStatus = "synced" | "pending" | "error" | "manual";
export type DataOrigin = "auto" | "manual" | "adjusted";
export type PlanType = "monthly_quota" | "prepaid_credits";
export type RecommendationType = "maintain" | "downgrade" | "upgrade" | "watch" | "review";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "resolved";
export type Urgency = "high" | "medium" | "low";

export interface Provider {
  id: string;
  name: string;
  logo: string;
  category: string;
  plan: string;
  planType: PlanType;
  monthlyCost: number;
  includedQuota: number;
  quotaUnit: string;
  consumed: number;
  remaining: number;
  usagePercent: number;
  overage: number;
  resetDate: string;
  daysUntilReset: number;
  syncStatus: SyncStatus;
  lastSync: string;
  dataOrigin: DataOrigin;
  recommendation: RecommendationType;
  recommendationText: string;
  recommendationDetail: string;
  savings?: string;
  urgency: Urgency;
  projectedEndOfCycle: number; // projected % at cycle end
  trend: "up" | "down" | "stable";
}

export interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  providerId: string;
  providerName: string;
  triggerDate: string;
  description: string;
  recommendedAction: string;
  status: AlertStatus;
}

export interface ManualAdjustment {
  id: string;
  providerId: string;
  providerName: string;
  type: string;
  amount: number;
  note: string;
  date: string;
  appliedBy: string;
}

export interface DailyUsage {
  date: string;
  consumed: number;
  cumulative: number;
}

export const providers: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    logo: "O",
    category: "LLM / API",
    plan: "Pro + API",
    planType: "monthly_quota",
    monthlyCost: 220,
    includedQuota: 10000000,
    quotaUnit: "tokens",
    consumed: 8200000,
    remaining: 1800000,
    usagePercent: 82,
    overage: 0,
    resetDate: "2026-04-30",
    daysUntilReset: 26,
    syncStatus: "synced",
    lastSync: "2026-04-04T08:30:00Z",
    dataOrigin: "auto",
    recommendation: "watch",
    recommendationText: "Quota exhaustion risk",
    recommendationDetail: "At 82% usage with 26 days remaining. Current pace projects 100% by Apr 18. Consider upgrading next cycle or throttling non-critical workloads.",
    urgency: "high",
    projectedEndOfCycle: 158,
    trend: "up",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    logo: "A",
    category: "LLM / API",
    plan: "API Usage",
    planType: "monthly_quota",
    monthlyCost: 150,
    includedQuota: 5000000,
    quotaUnit: "tokens",
    consumed: 2250000,
    remaining: 2750000,
    usagePercent: 45,
    overage: 0,
    resetDate: "2026-04-30",
    daysUntilReset: 26,
    syncStatus: "synced",
    lastSync: "2026-04-04T08:25:00Z",
    dataOrigin: "auto",
    recommendation: "maintain",
    recommendationText: "Well-sized plan",
    recommendationDetail: "Healthy usage at 45% with 26 days remaining. Pace is sustainable and plan is appropriately sized.",
    urgency: "low",
    projectedEndOfCycle: 84,
    trend: "stable",
  },
  {
    id: "google",
    name: "Google AI / Vertex",
    logo: "G",
    category: "LLM / Cloud AI",
    plan: "Prepaid Credits",
    planType: "prepaid_credits",
    monthlyCost: 500,
    includedQuota: 500,
    quotaUnit: "EUR credits",
    consumed: 90,
    remaining: 410,
    usagePercent: 18,
    overage: 0,
    resetDate: "2026-06-30",
    daysUntilReset: 87,
    syncStatus: "synced",
    lastSync: "2026-04-04T07:00:00Z",
    dataOrigin: "auto",
    recommendation: "downgrade",
    recommendationText: "Underused credit pack",
    recommendationDetail: "Only 18% of €500 prepaid credits consumed. At current pace, ~€320 will expire unused. Consider a €200 pack next cycle.",
    savings: "~€300",
    urgency: "medium",
    projectedEndOfCycle: 34,
    trend: "down",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    logo: "E",
    category: "Voice AI",
    plan: "Scale Plan",
    planType: "monthly_quota",
    monthlyCost: 99,
    includedQuota: 2000000,
    quotaUnit: "characters",
    consumed: 2340000,
    remaining: 0,
    usagePercent: 117,
    overage: 47,
    resetDate: "2026-04-28",
    daysUntilReset: 24,
    syncStatus: "pending",
    lastSync: "2026-04-03T22:00:00Z",
    dataOrigin: "auto",
    recommendation: "upgrade",
    recommendationText: "Upgrade to stop overage",
    recommendationDetail: "€47 overage this cycle from 340K excess characters. Pro plan at €149/mo includes 4M characters — would eliminate overage and save ~€30/mo net.",
    savings: "~€30/mo",
    urgency: "high",
    projectedEndOfCycle: 175,
    trend: "up",
  },
  {
    id: "lovable",
    name: "Lovable",
    logo: "L",
    category: "AI Dev Platform",
    plan: "Teams Plan",
    planType: "monthly_quota",
    monthlyCost: 100,
    includedQuota: 5000,
    quotaUnit: "messages",
    consumed: 3000,
    remaining: 2000,
    usagePercent: 60,
    overage: 0,
    resetDate: "2026-04-30",
    daysUntilReset: 26,
    syncStatus: "manual",
    lastSync: "2026-04-02T10:00:00Z",
    dataOrigin: "adjusted",
    recommendation: "maintain",
    recommendationText: "Plan OK — manual tracking",
    recommendationDetail: "Usage at 60% with manual adjustments. Auto-sync unavailable — data may lag. Plan size is appropriate.",
    urgency: "low",
    projectedEndOfCycle: 92,
    trend: "stable",
  },
];

export const alerts: Alert[] = [
  {
    id: "a1",
    type: "High Usage",
    severity: "warning",
    providerId: "openai",
    providerName: "OpenAI",
    triggerDate: "2026-04-03",
    description: "OpenAI usage at 82% of monthly quota with 26 days remaining.",
    recommendedAction: "Monitor daily pace. Upgrade if projected to exceed by Apr 15.",
    status: "active",
  },
  {
    id: "a2",
    type: "Overage",
    severity: "critical",
    providerId: "elevenlabs",
    providerName: "ElevenLabs",
    triggerDate: "2026-04-02",
    description: "ElevenLabs exceeded quota — 340K excess characters. Overage: €47.",
    recommendedAction: "Upgrade to Pro plan to eliminate recurring overage.",
    status: "active",
  },
  {
    id: "a3",
    type: "Underused Plan",
    severity: "info",
    providerId: "google",
    providerName: "Google AI / Vertex",
    triggerDate: "2026-04-01",
    description: "Google prepaid credits at 18% — €410 at risk of expiring unused.",
    recommendedAction: "Switch to smaller credit pack or redistribute AI workloads to Google.",
    status: "active",
  },
  {
    id: "a4",
    type: "Sync Issue",
    severity: "warning",
    providerId: "elevenlabs",
    providerName: "ElevenLabs",
    triggerDate: "2026-04-04",
    description: "ElevenLabs sync pending for 6+ hours.",
    recommendedAction: "Verify API key and retry sync.",
    status: "active",
  },
  {
    id: "a5",
    type: "Manual Mode",
    severity: "info",
    providerId: "lovable",
    providerName: "Lovable",
    triggerDate: "2026-03-28",
    description: "Lovable running in manual data mode. Auto-sync disabled.",
    recommendedAction: "Re-enable auto-sync or ensure manual entries are current.",
    status: "active",
  },
  {
    id: "a6",
    type: "Budget Threshold",
    severity: "warning",
    providerId: "openai",
    providerName: "OpenAI",
    triggerDate: "2026-03-15",
    description: "Monthly spend exceeded 75% of budget at mid-cycle.",
    recommendedAction: "Reviewed and adjusted budget allocation.",
    status: "resolved",
  },
];

export const adjustments: ManualAdjustment[] = [
  {
    id: "m1",
    providerId: "lovable",
    providerName: "Lovable",
    type: "Credit Adjustment",
    amount: -200,
    note: "Corrected duplicate message count from failed session",
    date: "2026-04-02",
    appliedBy: "Admin",
  },
  {
    id: "m2",
    providerId: "lovable",
    providerName: "Lovable",
    type: "Usage Override",
    amount: 150,
    note: "Added team member usage from separate workspace",
    date: "2026-03-28",
    appliedBy: "Admin",
  },
  {
    id: "m3",
    providerId: "openai",
    providerName: "OpenAI",
    type: "Cost Correction",
    amount: -12,
    note: "Billing credit applied for API downtime on March 20",
    date: "2026-03-22",
    appliedBy: "Admin",
  },
];

export const generateDailyUsage = (providerId: string): DailyUsage[] => {
  const provider = providers.find((p) => p.id === providerId);
  if (!provider) return [];

  const baseDaily = provider.consumed / 30;
  const data: DailyUsage[] = [];
  let cumulative = 0;

  for (let i = 1; i <= 30; i++) {
    const dayVariance = 0.3 + Math.sin(i * 0.4) * 0.5 + Math.random() * 0.5;
    const consumed = Math.round(baseDaily * dayVariance);
    cumulative += consumed;
    if (i <= 4) {
      data.push({
        date: `Apr ${i}`,
        consumed,
        cumulative: Math.min(cumulative, provider.consumed),
      });
    }
  }
  return data;
};

// Computed KPIs
export const monthlyBudget = 1200;
export const totalPlanSpend = providers.reduce((s, p) => s + p.monthlyCost, 0);
export const totalOverage = providers.reduce((s, p) => s + p.overage, 0);
export const totalSpend = totalPlanSpend + totalOverage;
export const budgetUsedPercent = Math.round((totalSpend / monthlyBudget) * 100);
export const activeAlertCount = alerts.filter((a) => a.status === "active").length;
export const underusedPlans = providers.filter((p) => p.usagePercent < 30);
export const nearExhaustion = providers.filter((p) => p.usagePercent >= 80 && p.usagePercent <= 100);
export const overageProviders = providers.filter((p) => p.overage > 0);
export const potentialSavings = 300 + 30;
