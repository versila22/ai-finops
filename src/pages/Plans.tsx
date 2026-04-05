import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { ProviderLogo } from "@/components/dashboard/ProviderLogo";
import { useI18n } from "@/i18n";
import { useProviders } from "@/hooks/use-api";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";

const Plans = () => {
  const { t, locale } = useI18n();
  const { data, isLoading } = useProviders();
  const providers = data ?? [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.plansTitle}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t.plansSubtitle(providers.filter(p => p.planType === "monthly_quota").length, providers.filter(p => p.planType === "prepaid_credits").length)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {providers.map((p) => {
            const trendIcon = p.trend === "up"
              ? <TrendingUp className="h-3 w-3 text-status-warning" />
              : p.trend === "down"
              ? <TrendingDown className="h-3 w-3 text-status-info" />
              : <Minus className="h-3 w-3 text-muted-foreground" />;
            const trendText = p.trend === "up" ? t.trendUp : p.trend === "down" ? t.trendDown : t.trendStable;

            return (
              <Card key={p.id} className="overflow-hidden">
                <div className={`h-1 w-full ${p.planType === "prepaid_credits" ? "bg-spend-prepaid" : "bg-spend-plan"}`} />
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center gap-2.5">
                    <ProviderLogo name={p.name} logo={p.logo} size="sm" />
                    <div className="flex-1">
                      <CardTitle className="text-sm font-bold">{p.name}</CardTitle>
                      <p className="text-[10px] text-muted-foreground">{p.plan}</p>
                    </div>
                    <StatusBadge status={p.planType} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">{t.cost}</span>
                      <p className="font-bold text-base tabular-nums">€{p.monthlyCost}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">{t.included}</span>
                      <p className="font-semibold">{p.includedQuota.toLocaleString()} {p.quotaUnit}</p>
                    </div>
                  </div>

                  <UsageProgressBar
                    value={p.usagePercent}
                    label={`${p.consumed.toLocaleString()} ${t.used}`}
                    sublabel={`${t.of} ${p.includedQuota.toLocaleString()}`}
                    size="sm"
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground">{t.projectedLabel}</p>
                      <span className={`text-sm font-bold tabular-nums ${p.projectedEndOfCycle > 100 ? "text-status-critical" : p.projectedEndOfCycle >= 80 ? "text-status-warning" : "text-foreground"}`}>
                        {p.projectedEndOfCycle}%
                      </span>
                    </div>
                    <div className="space-y-0.5 text-center">
                      <p className="text-[10px] text-muted-foreground">{t.trendLabel}</p>
                      <div className="flex items-center justify-center gap-1">
                        {trendIcon}
                        <span className="text-[10px] text-muted-foreground">{trendText}</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <p className="text-[10px] text-muted-foreground">{t.action}</p>
                      <StatusBadge status={p.recommendation} />
                    </div>
                  </div>

                  {p.overage > 0 && (
                    <div className="p-2 rounded-md bg-status-critical-muted border border-status-critical/15 text-center">
                      <p className="text-[11px] font-bold text-status-critical">{t.overageThisCycle(p.overage)}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                    <div className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{t.lastSyncShort}: {new Date(p.lastSync).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" })}</span>
                    </div>
                    <span>{t.resets} {new Date(p.resetDate).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" })} · {t.daysLeftLabel(p.daysUntilReset)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.syncStatus} showIcon />
                    <StatusBadge status={p.dataOrigin} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Plans;
