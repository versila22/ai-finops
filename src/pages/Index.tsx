import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  Receipt,
  AlertTriangle,
  TrendingDown,
  Battery,
  Bell,
} from "lucide-react";
import {
  providers,
  alerts,
  monthlyBudget,
  totalSpend,
  totalOverage,
  activeAlerts,
  underusedPlans,
  nearExhaustion,
} from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const activeAlertsList = alerts.filter((a) => a.status === "active").slice(0, 4);
  const recommendations = providers.filter((p) => p.recommendation !== "maintain");

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your AI spend overview for April 2026</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard title="Monthly Budget" value={`€${monthlyBudget}`} icon={Wallet} status="info" />
          <KPICard title="Total Spend" value={`€${totalSpend}`} subtitle={`${Math.round((totalSpend / monthlyBudget) * 100)}% of budget`} icon={Receipt} status={totalSpend > monthlyBudget ? "critical" : "healthy"} />
          <KPICard title="Overage" value={`€${totalOverage}`} icon={AlertTriangle} status={totalOverage > 0 ? "critical" : "healthy"} />
          <KPICard title="Active Alerts" value={activeAlerts} icon={Bell} status={activeAlerts > 3 ? "critical" : activeAlerts > 0 ? "warning" : "healthy"} />
          <KPICard title="Underused Plans" value={underusedPlans} icon={TrendingDown} status={underusedPlans > 0 ? "warning" : "healthy"} />
          <KPICard title="Near Exhaustion" value={nearExhaustion} icon={Battery} status={nearExhaustion > 0 ? "warning" : "healthy"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Summary */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAlertsList.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <StatusBadge status={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.recommendedAction}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate("/alerts")} className="text-xs text-primary font-medium hover:underline">
                View all alerts →
              </button>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((p) => (
                <RecommendationCard
                  key={p.id}
                  providerName={p.name}
                  recommendation={p.recommendation}
                  text={p.recommendationText}
                  className="border-0 shadow-none p-2 bg-muted/30"
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Provider Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Provider Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/providers/${p.id}`)}
                >
                  <div className="w-36 shrink-0">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.plan}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <UsageProgressBar value={p.usagePercent} size="sm" />
                  </div>
                  <div className="w-20 text-right shrink-0">
                    <p className="text-sm font-semibold">€{p.monthlyCost}</p>
                    {p.overage > 0 && (
                      <p className="text-xs text-status-critical">+€{p.overage}</p>
                    )}
                  </div>
                  <div className="w-24 shrink-0 flex justify-end gap-1.5">
                    <StatusBadge status={p.syncStatus} />
                  </div>
                  <div className="w-20 shrink-0 flex justify-end">
                    <StatusBadge status={p.recommendation} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
