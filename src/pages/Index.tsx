import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { RadialProgress } from "@/components/dashboard/RadialProgress";
import { ProviderLogo } from "@/components/dashboard/ProviderLogo";
import { SpendBar } from "@/components/dashboard/SpendBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet, Receipt, AlertTriangle, TrendingDown, TrendingUp, Battery, Bell, Sparkles, ArrowRight, ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import { useDashboard } from "@/hooks/use-api";
import { getProviderBillingUrl } from "@/config/providerBilling";
import type { Provider, Alert } from "@/data/mockData";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { data, isLoading } = useDashboard();

  const providers: Provider[] = data?.providers ?? [];
  const alerts: Alert[] = data?.alerts ?? [];
  const kpis = data?.kpis;

  const monthlyBudget = kpis?.monthlyBudget ?? 0;
  const totalSpend = kpis?.totalSpend ?? 0;
  const totalPlanSpend = kpis?.totalPlanSpend ?? 0;
  const totalOverage = kpis?.totalOverage ?? 0;
  const activeAlertCount = kpis?.activeAlertCount ?? 0;
  const potentialSavings = kpis?.potentialSavings ?? 0;

  const underusedPlans = providers.filter((p) => p.usagePercent < 30);
  const nearExhaustion = providers.filter((p) => p.usagePercent >= 80 && p.usagePercent <= 100);
  const overageProviders = providers.filter((p) => p.overage > 0);

  const activeAlertsList = alerts.filter((a) => a.status === "active").slice(0, 3);
  const actionableRecs = providers.filter((p) => p.recommendation !== "maintain");

  const atRiskProviders = providers.filter((p) => p.projectedEndOfCycle > 100 && p.overage === 0);
  const overspendingProviders = providers.filter((p) => p.overage > 0);
  const optimizableProviders = providers.filter((p) => p.usagePercent < 30);
  const healthyProviders = providers.filter((p) => p.usagePercent >= 30 && p.usagePercent <= 80 && p.overage === 0);

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
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.dashTitle}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t.dashSubtitle(providers.length)}</p>
          </div>
          {potentialSavings > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-status-healthy-muted border border-status-healthy/20 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-status-healthy" />
              <span className="text-xs font-semibold text-status-healthy">{t.potentialSavings(potentialSavings)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KPICard title={t.kpiMonthlyBudget} value={`€${monthlyBudget}`} icon={Wallet} status="info" accent />
          <KPICard title={t.kpiTotalSpend} value={`€${totalSpend}`} subtitle={`${Math.round((totalSpend / (monthlyBudget || 1)) * 100)}% ${t.ofBudget}`} icon={Receipt} status={totalSpend > monthlyBudget ? "critical" : "healthy"} onClick={() => navigate("/providers")} />
          <KPICard title={t.kpiOverageCost} value={totalOverage > 0 ? `€${totalOverage}` : "€0"} subtitle={overageProviders.length > 0 ? `${overageProviders.length} ${t.provider}` : t.noOverages} icon={AlertTriangle} status={totalOverage > 0 ? "critical" : "healthy"} onClick={() => navigate("/alerts?filter=overage")} />
          <KPICard title={t.kpiActiveAlerts} value={activeAlertCount} subtitle={`${activeAlertCount} ${t.requireAttention}`} icon={Bell} status={activeAlertCount > 3 ? "critical" : activeAlertCount > 0 ? "warning" : "healthy"} onClick={() => navigate("/alerts")} />
          <KPICard title={t.kpiUnderused} value={underusedPlans.length} subtitle={underusedPlans.length > 0 ? underusedPlans.map((p) => p.name).join(", ") : t.allPlansUtilized} icon={TrendingDown} status={underusedPlans.length > 0 ? "warning" : "healthy"} onClick={() => navigate("/providers?filter=underused")} />
          <KPICard title={t.kpiNearExhaustion} value={nearExhaustion.length} subtitle={nearExhaustion.length > 0 ? nearExhaustion.map((p) => p.name).join(", ") : t.noRisks} icon={Battery} status={nearExhaustion.length > 0 ? "warning" : "healthy"} onClick={() => navigate("/providers?filter=exhaustion")} />
        </div>

        <Card className="p-4 border-l-[3px] border-l-status-warning">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-4 w-4 text-status-warning" />
            <h3 className="text-sm font-bold">{t.riskSummaryTitle}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-status-critical-muted/50 border border-status-critical/15 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-status-critical">{t.riskAtRisk}</p>
              <p className="text-xl font-bold text-status-critical mt-0.5">{atRiskProviders.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.projectedOverage}</p>
            </div>
            <div className="rounded-lg bg-status-critical-muted/50 border border-status-critical/15 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-status-critical">{t.riskOverspending}</p>
              <p className="text-xl font-bold text-status-critical mt-0.5">{overspendingProviders.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.activeOverage}</p>
            </div>
            <div className="rounded-lg bg-status-warning-muted/50 border border-status-warning/15 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-status-warning">{t.riskOptimizable}</p>
              <p className="text-xl font-bold text-status-warning mt-0.5">{optimizableProviders.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.savingsAvailable}</p>
            </div>
            <div className="rounded-lg bg-status-healthy-muted/50 border border-status-healthy/15 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-status-healthy">{t.riskHealthy}</p>
              <p className="text-xl font-bold text-status-healthy mt-0.5">{healthyProviders.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.onTrack}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold">{t.budgetComposition}</h3>
            <span className="text-xs text-muted-foreground">€{totalSpend} / €{monthlyBudget}</span>
          </div>
          <SpendBar planCost={totalPlanSpend} overage={totalOverage} budget={monthlyBudget} />
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <Card className="xl:col-span-3">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">{t.planUtilization}</CardTitle>
              <button onClick={() => navigate("/providers")} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                {t.allProviders} <ArrowRight className="h-3 w-3" />
              </button>
            </CardHeader>
            <CardContent className="space-y-1 pt-0 overflow-x-auto">
              {providers.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors group min-w-[480px]" onClick={() => navigate(`/providers/${p.id}`)}>
                  <ProviderLogo name={p.name} logo={p.logo} size="sm" />
                  <div className="w-[100px] shrink-0">
                    <p className="text-sm font-semibold leading-tight">{p.name}</p>
                    <div className="flex items-center gap-1 mt-0.5"><StatusBadge status={p.planType} /></div>
                  </div>
                  <div className="flex-1 min-w-[120px]"><UsageProgressBar value={p.usagePercent} size="sm" showPercent={false} /></div>
                  <div className="w-12 text-right">
                    <span className={`text-sm font-bold tabular-nums ${p.usagePercent > 100 ? "text-status-critical" : p.usagePercent >= 80 ? "text-status-warning" : "text-foreground"}`}>{p.usagePercent}%</span>
                  </div>
                  <div className="w-16 text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">€{p.monthlyCost}</p>
                    {p.overage > 0 && <p className="text-xs font-semibold text-status-critical">+€{p.overage}</p>}
                  </div>
                  <div className="w-12 text-right shrink-0">
                    {p.trend === "up" && <TrendingUp className="inline h-3.5 w-3.5 text-status-warning" />}
                    {p.trend === "down" && <TrendingDown className="inline h-3.5 w-3.5 text-status-info" />}
                    {p.trend === "stable" && <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                  <div className="w-14 text-right shrink-0"><span className="text-xs text-muted-foreground">{t.daysLeft(p.daysUntilReset)}</span></div>
                  <div className="w-[72px] shrink-0 flex justify-end opacity-80 group-hover:opacity-100"><StatusBadge status={p.recommendation} /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{t.actionRequired}</h3>
              <span className="text-xs font-medium text-primary bg-primary/8 rounded-md px-2 py-0.5">{actionableRecs.length} {t.recommendations}</span>
            </div>
            {actionableRecs.map((p) => (
              <RecommendationCard
                key={p.id}
                providerName={p.name}
                recommendation={p.recommendation}
                text={p.recommendationText}
                detail={p.recommendationDetail}
                savings={p.savings}
                urgency={p.urgency}
              />
            ))}
            <Card className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t.quotaSnapshot}</h4>
              <div className="grid grid-cols-2 gap-4 justify-items-center">
                {providers.slice(0, 4).map((p) => (
                  <RadialProgress key={p.id} value={p.usagePercent} size={72} strokeWidth={5} label={p.name} />
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">{t.recentAlerts}</CardTitle>
            <button onClick={() => navigate("/alerts")} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              {t.alertCenter} <ArrowRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeAlertsList.map((alert) => {
              const billingUrl = getProviderBillingUrl(alert.providerId);
              const action = alert.type.toLowerCase();

              return (
                <div key={alert.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/50 bg-muted/20">
                  <StatusBadge status={alert.severity} showIcon />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{alert.providerName}</span>
                      <span className="text-xs text-muted-foreground">{alert.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{alert.triggerDate}</span>
                    {action.includes("overage") && billingUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={billingUrl} target="_blank" rel="noreferrer">{t.alertViewSubscription}</a>
                      </Button>
                    )}
                    {action.includes("high usage") && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/providers/${alert.providerId}`)}>{t.alertViewUsage}</Button>
                    )}
                    {action.includes("underused") && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/providers/${alert.providerId}?section=subscription`)}>{t.alertOptimize}</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
