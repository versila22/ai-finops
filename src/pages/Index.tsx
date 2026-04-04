import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { RadialProgress } from "@/components/dashboard/RadialProgress";
import { ProviderLogo } from "@/components/dashboard/ProviderLogo";
import { SpendBar } from "@/components/dashboard/SpendBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet, Receipt, AlertTriangle, TrendingDown, Battery, Bell, Sparkles, ArrowRight,
} from "lucide-react";
import {
  providers, alerts, monthlyBudget, totalSpend, totalPlanSpend, totalOverage,
  activeAlertCount, underusedPlans, nearExhaustion, overageProviders, potentialSavings,
} from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const activeAlertsList = alerts.filter((a) => a.status === "active").slice(0, 3);
  const actionableRecs = providers.filter((p) => p.recommendation !== "maintain");

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
          <KPICard title={t.kpiTotalSpend} value={`€${totalSpend}`} subtitle={`${Math.round((totalSpend / monthlyBudget) * 100)}% ${t.ofBudget}`} icon={Receipt} status={totalSpend > monthlyBudget ? "critical" : "healthy"} />
          <KPICard title={t.kpiOverageCost} value={totalOverage > 0 ? `€${totalOverage}` : "€0"} subtitle={overageProviders.length > 0 ? `${overageProviders.length} ${t.provider}` : t.noOverages} icon={AlertTriangle} status={totalOverage > 0 ? "critical" : "healthy"} />
          <KPICard title={t.kpiActiveAlerts} value={activeAlertCount} subtitle={`${activeAlertCount} ${t.requireAttention}`} icon={Bell} status={activeAlertCount > 3 ? "critical" : activeAlertCount > 0 ? "warning" : "healthy"} />
          <KPICard title={t.kpiUnderused} value={underusedPlans.length} subtitle={underusedPlans.length > 0 ? underusedPlans.map(p => p.name).join(", ") : t.allPlansUtilized} icon={TrendingDown} status={underusedPlans.length > 0 ? "warning" : "healthy"} />
          <KPICard title={t.kpiNearExhaustion} value={nearExhaustion.length} subtitle={nearExhaustion.length > 0 ? nearExhaustion.map(p => p.name).join(", ") : t.noRisks} icon={Battery} status={nearExhaustion.length > 0 ? "warning" : "healthy"} />
        </div>

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
            <CardContent className="space-y-1 pt-0">
              {providers.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors group" onClick={() => navigate(`/providers/${p.id}`)}>
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
                    {p.overage > 0 && <p className="text-[10px] font-semibold text-status-critical">+€{p.overage}</p>}
                  </div>
                  <div className="w-14 text-right shrink-0"><span className="text-[10px] text-muted-foreground">{t.daysLeft(p.daysUntilReset)}</span></div>
                  <div className="w-[72px] shrink-0 flex justify-end opacity-80 group-hover:opacity-100"><StatusBadge status={p.recommendation} /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{t.actionRequired}</h3>
              <span className="text-[10px] font-medium text-primary bg-primary/8 rounded-md px-2 py-0.5">{actionableRecs.length} {t.recommendations}</span>
            </div>
            {actionableRecs.map((p) => (
              <RecommendationCard key={p.id} providerName={p.name} recommendation={p.recommendation} text={p.recommendationText} detail={p.recommendationDetail} savings={p.recommendation === "downgrade" ? "~€300" : p.recommendation === "upgrade" ? "~€30/mo" : undefined} />
            ))}
            <Card className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t.quotaSnapshot}</h4>
              <div className="flex items-center justify-around">
                {providers.slice(0, 4).map((p) => (<RadialProgress key={p.id} value={p.usagePercent} size={56} strokeWidth={5} label={p.logo} />))}
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
            {activeAlertsList.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/50 bg-muted/20">
                <StatusBadge status={alert.severity} showIcon />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{alert.providerName}</span>
                    <span className="text-[10px] text-muted-foreground">{alert.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{alert.triggerDate}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
