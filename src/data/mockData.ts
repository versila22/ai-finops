export type SyncStatus = "synced" | "pending" | "error" | "manual";
export type DataOrigin = "auto" | "manual" | "adjusted";
export type PlanType = "monthly_quota" | "prepaid_credits";
export type RecommendationType = "maintain" | "downgrade" | "upgrade" | "watch" | "review";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "resolved";

export interface Provider {
  id: string;
  name: string;
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
  syncStatus: SyncStatus;
  lastSync: string;
  dataOrigin: DataOrigin;
  recommendation: RecommendationType;
  recommendationText: string;
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
    syncStatus: "synced",
    lastSync: "2026-04-04T08:30:00Z",
    dataOrigin: "auto",
    recommendation: "watch",
    recommendationText: "At 82% usage with 26 days remaining. Monitor closely — may need upgrade next cycle.",
  },
  {
    id: "anthropic",
    name: "Anthropic",
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
    syncStatus: "synced",
    lastSync: "2026-04-04T08:25:00Z",
    dataOrigin: "auto",
    recommendation: "maintain",
    recommendationText: "Healthy usage at 45%. Current plan is well-sized.",
  },
  {
    id: "google",
    name: "Google AI / Vertex",
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
    syncStatus: "synced",
    lastSync: "2026-04-04T07:00:00Z",
    dataOrigin: "auto",
    recommendation: "downgrade",
    recommendationText: "Only 18% of prepaid credits used. Consider a smaller credit pack next cycle.",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
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
    syncStatus: "pending",
    lastSync: "2026-04-03T22:00:00Z",
    dataOrigin: "auto",
    recommendation: "upgrade",
    recommendationText: "€47 overage this cycle. Upgrade to next tier to save ~€30/mo.",
  },
  {
    id: "lovable",
    name: "Lovable",
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
    syncStatus: "manual",
    lastSync: "2026-04-02T10:00:00Z",
    dataOrigin: "adjusted",
    recommendation: "maintain",
    recommendationText: "Usage at 60% with manual adjustments applied. Plan is well-sized.",
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
    description: "OpenAI usage has reached 82% of monthly quota with 26 days remaining.",
    recommendedAction: "Monitor usage rate. Consider upgrading if pace continues.",
    status: "active",
  },
  {
    id: "a2",
    type: "Overage",
    severity: "critical",
    providerId: "elevenlabs",
    providerName: "ElevenLabs",
    triggerDate: "2026-04-02",
    description: "ElevenLabs has exceeded quota by 340K characters. Overage cost: €47.",
    recommendedAction: "Upgrade to next plan tier to avoid recurring overage.",
    status: "active",
  },
  {
    id: "a3",
    type: "Underused Plan",
    severity: "info",
    providerId: "google",
    providerName: "Google AI / Vertex",
    triggerDate: "2026-04-01",
    description: "Google prepaid credits at only 18% utilization. Risk of waste.",
    recommendedAction: "Downgrade to a smaller credit pack or redistribute usage.",
    status: "active",
  },
  {
    id: "a4",
    type: "Sync Issue",
    severity: "warning",
    providerId: "elevenlabs",
    providerName: "ElevenLabs",
    triggerDate: "2026-04-04",
    description: "ElevenLabs sync is pending. Last successful sync was 6 hours ago.",
    recommendedAction: "Check API key validity and retry sync.",
    status: "active",
  },
  {
    id: "a5",
    type: "Manual Mode",
    severity: "info",
    providerId: "lovable",
    providerName: "Lovable",
    triggerDate: "2026-03-28",
    description: "Lovable is in manual data mode. Auto-sync is disabled.",
    recommendedAction: "Re-enable auto-sync or verify manual entries.",
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
    recommendedAction: "Review spending pace and adjust budget if needed.",
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
  const days = 30;
  const dailyAvg = provider.consumed / days;
  const data: DailyUsage[] = [];
  let cumulative = 0;
  for (let i = 1; i <= 4; i++) {
    const variance = 0.5 + Math.random();
    const consumed = Math.round(dailyAvg * variance);
    cumulative += consumed;
    data.push({
      date: `Apr ${i}`,
      consumed,
      cumulative: Math.min(cumulative, provider.consumed),
    });
  }
  // backfill the rest to approximate total
  const remaining = provider.consumed - cumulative;
  if (remaining > 0) {
    data[data.length - 1].cumulative = provider.consumed;
  }
  return data;
};

export const monthlyBudget = 1200;
export const totalSpend = providers.reduce((sum, p) => sum + p.monthlyCost + p.overage, 0);
export const totalOverage = providers.reduce((sum, p) => sum + p.overage, 0);
export const activeAlerts = alerts.filter((a) => a.status === "active").length;
export const underusedPlans = providers.filter((p) => p.usagePercent < 30).length;
export const nearExhaustion = providers.filter((p) => p.usagePercent >= 80 && p.usagePercent <= 100).length;
