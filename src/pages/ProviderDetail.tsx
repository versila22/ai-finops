import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { RadialProgress } from "@/components/dashboard/RadialProgress";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { ProviderLogo } from "@/components/dashboard/ProviderLogo";
import { providers, alerts, adjustments, generateDailyUsage } from "@/data/mockData";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, RefreshCw } from "lucide-react";
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
      <div className="space-y-5 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/providers")} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <ProviderLogo name={provider.name} logo={provider.logo} size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">{provider.name}</h1>
            <p className="text-xs text-muted-foreground">{provider.category} · {provider.plan}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={provider.planType} />
            <StatusBadge status={provider.syncStatus} showIcon />
            <StatusBadge status={provider.dataOrigin} />
          </div>
        </div>

        {/* Vitals row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-4 flex flex-col items-center justify-center col-span-1">
            <RadialProgress value={provider.usagePercent} size={88} strokeWidth={6} />
            <p className="text-[10px] text-muted-foreground font-medium mt-1.5">Quota Used</p>
          </Card>
          <Card className="p-4 border-l-[3px] border-l-primary">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Plan Cost</p>
            <p className="text-2xl font-bold mt-1 tabular-nums">€{provider.monthlyCost}</p>
            <StatusBadge status={provider.planType} className="mt-1.5" />
          </Card>
          <Card className="p-4 border-l-[3px] border-l-status-warning">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Consumed</p>
            <p className="text-xl font-bold mt-1 tabular-nums">{(provider.consumed / 1000).toFixed(0)}k</p>
            <p className="text-[10px] text-muted-foreground">of {(provider.includedQuota / 1000).toFixed(0)}k {provider.quotaUnit}</p>
          </Card>
          <Card className="p-4 border-l-[3px] border-l-status-healthy">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Remaining</p>
            <p className="text-xl font-bold mt-1 tabular-nums">{Math.max(0, provider.remaining / 1000).toFixed(0)}k</p>
            <p className="text-[10px] text-muted-foreground">{provider.quotaUnit}</p>
          </Card>
          <Card className={`p-4 border-l-[3px] ${provider.overage > 0 ? "border-l-status-critical" : "border-l-border"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Overage</p>
            <p className={`text-xl font-bold mt-1 tabular-nums ${provider.overage > 0 ? "text-status-critical" : ""}`}>
              {provider.overage > 0 ? `€${provider.overage}` : "€0"}
            </p>
            <p className="text-[10px] text-muted-foreground">{provider.daysUntilReset}d until reset</p>
          </Card>
        </div>

        {/* Usage bar */}
        <Card className="p-4">
          <UsageProgressBar
            value={provider.usagePercent}
            label={`${provider.consumed.toLocaleString()} / ${provider.includedQuota.toLocaleString()} ${provider.quotaUnit}`}
            sublabel={`Resets ${new Date(provider.resetDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
            size="md"
          />
        </Card>

        {/* Chart + Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold">Daily Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyUsage}>
                    <defs>
                      <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(226, 70%, 55%)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(226, 70%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-[10px]" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 10 }} />
                    <YAxis className="text-[10px]" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="consumed" stroke="hsl(226, 70%, 55%)" fill="url(#usageGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <RecommendationCard
              providerName={provider.name}
              recommendation={provider.recommendation}
              text={provider.recommendationText}
              detail={provider.recommendationDetail}
              savings={provider.recommendation === "downgrade" ? "~€300" : provider.recommendation === "upgrade" ? "~€30/mo" : undefined}
            />
          </div>
        </div>

        {/* Alerts + Adjustments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Active Alerts ({providerAlerts.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {providerAlerts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No active alerts for this provider</p>
              ) : (
                providerAlerts.map((a) => (
                  <div key={a.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.severity} showIcon />
                      <span className="text-[10px] text-muted-foreground">{a.triggerDate}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{a.description}</p>
                    <p className="text-[10px] text-muted-foreground">{a.recommendedAction}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Manual Adjustments ({providerAdjustments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {providerAdjustments.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No manual adjustments</p>
              ) : (
                providerAdjustments.map((a) => (
                  <div key={a.id} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{a.type}</span>
                      <span className={`text-xs font-bold tabular-nums ${a.amount < 0 ? "text-status-critical" : "text-status-healthy"}`}>
                        {a.amount > 0 ? "+" : ""}{a.amount}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{a.note}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{a.date} · {a.appliedBy}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sync footer */}
        <div className="flex items-center gap-6 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3" />
            <span>Sync: </span>
            <StatusBadge status={provider.syncStatus} showIcon />
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>Last synced: {new Date(provider.lastSync).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Data origin:</span>
            <StatusBadge status={provider.dataOrigin} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDetail;
