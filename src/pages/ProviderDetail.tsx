import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { RadialProgress } from "@/components/dashboard/RadialProgress";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { providers, alerts, adjustments, generateDailyUsage } from "@/data/mockData";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ProviderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const provider = providers.find((p) => p.id === id);

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Provider not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const providerAlerts = alerts.filter((a) => a.providerId === id && a.status === "active");
  const providerAdjustments = adjustments.filter((a) => a.providerId === id);
  const dailyUsage = generateDailyUsage(id!);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/providers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{provider.name}</h1>
            <p className="text-sm text-muted-foreground">{provider.category} · {provider.plan}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <StatusBadge status={provider.syncStatus} />
            <StatusBadge status={provider.dataOrigin} />
            <StatusBadge status={provider.recommendation} />
          </div>
        </div>

        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 flex flex-col items-center justify-center">
            <RadialProgress value={provider.usagePercent} size={100} />
            <p className="text-xs text-muted-foreground mt-2">Quota Usage</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-muted-foreground">Monthly Cost</p>
            <p className="text-2xl font-bold mt-1">€{provider.monthlyCost}</p>
            {provider.overage > 0 && <p className="text-sm text-status-critical mt-1">+ €{provider.overage} overage</p>}
          </Card>
          <Card className="p-5">
            <p className="text-xs text-muted-foreground">Consumed / Quota</p>
            <p className="text-lg font-bold mt-1">{provider.consumed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">of {provider.includedQuota.toLocaleString()} {provider.quotaUnit}</p>
            <UsageProgressBar value={provider.usagePercent} size="sm" className="mt-3" showPercent={false} />
          </Card>
          <Card className="p-5">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-lg font-bold mt-1">{Math.max(0, provider.remaining).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{provider.quotaUnit}</p>
            <p className="text-xs text-muted-foreground mt-2">Resets {new Date(provider.resetDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
          </Card>
        </div>

        {/* Chart + Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily Usage Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyUsage}>
                    <defs>
                      <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(226, 70%, 55%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(226, 70%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(215, 16%, 47%)" }} />
                    <YAxis className="text-xs" tick={{ fill: "hsl(215, 16%, 47%)" }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="consumed" stroke="hsl(226, 70%, 55%)" fill="url(#usageGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <RecommendationCard
            providerName={provider.name}
            recommendation={provider.recommendation}
            text={provider.recommendationText}
          />
        </div>

        {/* Alerts + Adjustments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {providerAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active alerts</p>
              ) : (
                providerAlerts.map((a) => (
                  <div key={a.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.severity} />
                      <span className="text-xs text-muted-foreground">{a.triggerDate}</span>
                    </div>
                    <p className="text-sm">{a.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Manual Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {providerAdjustments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No adjustments</p>
              ) : (
                providerAdjustments.map((a) => (
                  <div key={a.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{a.type}</span>
                      <span className={`text-sm font-semibold ${a.amount < 0 ? "text-status-critical" : "text-status-healthy"}`}>
                        {a.amount > 0 ? "+" : ""}{a.amount}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.note}</p>
                    <p className="text-xs text-muted-foreground">{a.date} · {a.appliedBy}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sync info */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Sync Status</p>
              <StatusBadge status={provider.syncStatus} className="mt-1" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Sync</p>
              <p className="text-sm font-medium mt-1">{new Date(provider.lastSync).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data Origin</p>
              <StatusBadge status={provider.dataOrigin} className="mt-1" />
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDetail;
