import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { RadialProgress } from "@/components/dashboard/RadialProgress";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { ProviderLogo } from "@/components/dashboard/ProviderLogo";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useProvider } from "@/hooks/use-api";
import { ArrowLeft, Clock, RefreshCw, TrendingUp, TrendingDown, Minus, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useI18n } from "@/i18n";
import { getProviderBillingUrl } from "@/config/providerBilling";
import { ProviderFormDialog } from "@/components/providers/ProviderFormDialog";
import { deleteProvider, updateProvider } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProviderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subscriptionRef = useRef<HTMLDivElement | null>(null);
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const { data, isLoading } = useProvider(id ?? "");
  const [editOpen, setEditOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateProvider>[1]) => updateProvider(id ?? "", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["provider", id] });
      await queryClient.invalidateQueries({ queryKey: ["providers"] });
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success(t.providerEditSuccess);
      setEditOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t.providerEditError);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProvider(id ?? ""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["providers"] });
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success(t.providerDeleteSuccess);
      navigate("/providers");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t.providerDeleteError);
    },
  });

  useEffect(() => {
    if (searchParams.get("section") === "subscription") {
      subscriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams, data]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const provider = data ?? null;

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t.providerNotFound}</p>
        </div>
      </DashboardLayout>
    );
  }

  const providerAlerts = provider.alerts.filter((a) => a.status === "active");
  const providerAdjustments = provider.adjustments ?? [];
  const dailyUsage = provider.dailyUsage ?? [];
  const billingUrl = getProviderBillingUrl(provider.id);
  const formatUsageDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const trendIcon = provider.trend === "up"
    ? <TrendingUp className="h-3.5 w-3.5 text-status-warning" />
    : provider.trend === "down"
    ? <TrendingDown className="h-3.5 w-3.5 text-status-info" />
    : <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  const trendText = provider.trend === "up" ? t.trendUp : provider.trend === "down" ? t.trendDown : t.trendStable;

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-[1200px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate("/providers")} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <ProviderLogo name={provider.name} logo={provider.logo} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold tracking-tight">{provider.name}</h1>
              <p className="text-xs text-muted-foreground">{provider.category} · {provider.plan}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={provider.planType} />
            <StatusBadge status={provider.syncStatus} showIcon />
            <StatusBadge status={provider.dataOrigin} />
            <ProviderFormDialog
              mode="edit"
              provider={provider}
              open={editOpen}
              onOpenChange={setEditOpen}
              onSubmit={async (payload) => {
                await updateMutation.mutateAsync(payload);
              }}
              isSubmitting={updateMutation.isPending}
              trigger={
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  {t.providerEditButton}
                </Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t.providerDeleteButton}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.providerDeleteConfirmTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.providerDeleteConfirmDescription(provider.name)}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.providerFormCancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                    {t.providerDeleteConfirmAction}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card className="p-4 flex flex-col items-center justify-center col-span-1">
            <RadialProgress value={provider.usagePercent} size={88} strokeWidth={6} />
            <p className="text-[10px] text-muted-foreground font-medium mt-1.5">{t.quotaUsed}</p>
          </Card>
          <Card className="p-4 border-l-[3px] border-l-primary">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.planCost}</p>
            <p className="text-2xl font-bold mt-1 tabular-nums">€{provider.monthlyCost}</p>
            <StatusBadge status={provider.planType} className="mt-1.5" />
          </Card>
          <Card className="p-4 border-l-[3px] border-l-status-warning">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.consumed}</p>
            <p className="text-xl font-bold mt-1 tabular-nums">{provider.consumed.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{t.of} {provider.includedQuota.toLocaleString()} {provider.quotaUnit}</p>
          </Card>
          <Card className="p-4 border-l-[3px] border-l-status-healthy">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.remaining}</p>
            <p className="text-xl font-bold mt-1 tabular-nums">{Math.max(0, provider.remaining).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{provider.quotaUnit}</p>
          </Card>
          <Card className={`p-4 border-l-[3px] ${provider.overage > 0 ? "border-l-status-critical" : "border-l-border"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.overage}</p>
            <p className={`text-xl font-bold mt-1 tabular-nums ${provider.overage > 0 ? "text-status-critical" : ""}`}>
              {provider.overage > 0 ? `€${provider.overage}` : "€0"}
            </p>
            <p className="text-[10px] text-muted-foreground">{t.daysUntilReset(provider.daysUntilReset)}</p>
          </Card>
          <Card className="p-4 border-l-[3px] border-l-primary/50">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.projectedLabel}</p>
            <p className={`text-xl font-bold mt-1 tabular-nums ${provider.projectedEndOfCycle > 100 ? "text-status-critical" : provider.projectedEndOfCycle >= 80 ? "text-status-warning" : "text-foreground"}`}>
              {provider.projectedEndOfCycle}%
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {trendIcon}
              <span className="text-[10px] text-muted-foreground">{trendText}</span>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <UsageProgressBar
            value={provider.usagePercent}
            label={`${provider.consumed.toLocaleString()} / ${provider.includedQuota.toLocaleString()} ${provider.quotaUnit}`}
            sublabel={`${t.resets} ${provider.resetDate ? new Date(provider.resetDate).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" }) : "—"}`}
            size="md"
          />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold">{t.dailyConsumption}</CardTitle>
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
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 10 }}
                      tickFormatter={formatUsageDate}
                    />
                    <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      labelFormatter={(value) => formatUsageDate(String(value))}
                    />
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
              savings={provider.savings}
              urgency={provider.urgency}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t.activeAlertsCount(providerAlerts.length)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {providerAlerts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">{t.noActiveAlerts}</p>
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
              <CardTitle className="text-sm font-semibold">{t.manualAdjustmentsCount(providerAdjustments.length)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {providerAdjustments.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">{t.noAdjustments}</p>
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

        <Card ref={subscriptionRef} className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t.subscriptionSectionTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.subscriptionPlan}</p>
                <p className="mt-1 font-semibold">{provider.plan}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.subscriptionSpend}</p>
                <p className="mt-1 font-semibold">€{provider.monthlyCost}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.subscriptionQuota}</p>
                <p className="mt-1 font-semibold">{provider.includedQuota.toLocaleString()} {provider.quotaUnit}</p>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-card p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{t.subscriptionManageLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.subscriptionManageHelp}</p>
              </div>
              {billingUrl ? (
                <Button asChild>
                  <a href={billingUrl} target="_blank" rel="noreferrer">
                    {t.subscriptionManageCta}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">{t.subscriptionLinkUnavailable}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-6 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3" />
            <span>{t.syncLabel}: </span>
            <StatusBadge status={provider.syncStatus} showIcon />
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{t.lastSynced}: {provider.lastSync ? new Date(provider.lastSync).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB") : "—"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>{t.dataOrigin}:</span>
            <StatusBadge status={provider.dataOrigin} />
          </div>
          <div className="flex items-center gap-1.5">
            <span>{t.trendLabel}:</span>
            {trendIcon}
            <span>{trendText}</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDetail;
