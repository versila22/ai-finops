import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { ProviderLogo } from "@/components/dashboard/ProviderLogo";
import { providers } from "@/data/mockData";
import { useI18n } from "@/i18n";

function getProjectedStatus(p: typeof providers[0]) {
  if (p.usagePercent > 100) return { status: "critical" as const };
  if (p.usagePercent >= 80) return { status: "warning" as const };
  if (p.usagePercent < 30) return { status: "info" as const };
  return { status: "healthy" as const };
}

const Plans = () => {
  const { t, locale } = useI18n();

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
            const projected = getProjectedStatus(p);
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
                      <p className="text-[10px] text-muted-foreground">{t.projected}</p>
                      <StatusBadge status={projected.status} />
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

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{t.resets} {new Date(p.resetDate).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" })}</span>
                    <span>{t.daysLeftLabel(p.daysUntilReset)}</span>
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
