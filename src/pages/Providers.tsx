import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { ProviderLogo } from "@/components/dashboard/ProviderLogo";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProviders } from "@/hooks/use-api";
import { useI18n } from "@/i18n";
import type { Provider } from "@/data/mockData";
import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProviderFormDialog } from "@/components/providers/ProviderFormDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProvider } from "@/lib/api";
import { toast } from "sonner";

const Providers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeFilter = searchParams.get("filter");
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const { data, isLoading } = useProviders();
  const providers = data ?? [];

  const createMutation = useMutation({
    mutationFn: createProvider,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["providers"] });
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success(t.providerCreateSuccess);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t.providerCreateError);
    },
  });

  const filteredProviders = providers.filter((provider) => {
    if (activeFilter === "underused") return provider.usagePercent < 30;
    if (activeFilter === "exhaustion") return provider.usagePercent >= 80 || provider.projectedEndOfCycle >= 100;
    return true;
  });

  const filterTitle = activeFilter === "underused"
    ? t.providersFilterUnderused
    : activeFilter === "exhaustion"
    ? t.providersFilterExhaustion
    : null;

  const renderTrend = (provider: Provider) => {
    if (provider.trend === "up") return <TrendingUp className="inline h-3.5 w-3.5 text-status-warning" />;
    if (provider.trend === "down") return <TrendingDown className="inline h-3.5 w-3.5 text-status-info" />;
    return <Minus className="inline h-3.5 w-3.5 text-muted-foreground" />;
  };

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
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.providersTitle}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t.providersSubtitle(providers.length, providers.filter((p) => p.syncStatus === "synced").length, providers.filter((p) => p.dataOrigin === "manual" || p.dataOrigin === "adjusted").length)}
            </p>
            {filterTitle && (
              <div className="mt-3 inline-flex rounded-md border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                {filterTitle}: {filteredProviders.length}
              </div>
            )}
          </div>
          <ProviderFormDialog
            mode="create"
            onSubmit={async (payload) => {
              await createMutation.mutateAsync(payload);
            }}
            isSubmitting={createMutation.isPending}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t.providerAddButton}
              </Button>
            }
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">{t.thProvider}</TableHead>
                  <TableHead>{t.thPlan}</TableHead>
                  <TableHead className="text-right">{t.thCost}</TableHead>
                  <TableHead className="w-[160px]">{t.thQuotaUsage}</TableHead>
                  <TableHead className="text-right">{t.thRemaining}</TableHead>
                  <TableHead className="text-right">{t.thOverage}</TableHead>
                  <TableHead className="text-center">{t.thTrend}</TableHead>
                  <TableHead className="text-right">{t.thProjected}</TableHead>
                  <TableHead>{t.thReset}</TableHead>
                  <TableHead>{t.thSync}</TableHead>
                  <TableHead>{t.thData}</TableHead>
                  <TableHead>{t.thAction}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/providers/${p.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <ProviderLogo name={p.name} logo={p.logo} size="sm" />
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.category}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="text-sm">{p.plan}</span>
                        <div><StatusBadge status={p.planType} /></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">€{p.monthlyCost}</TableCell>
                    <TableCell>
                      <UsageProgressBar value={p.usagePercent} size="xs" label={`${(p.consumed / 1000).toFixed(0)}k / ${(p.includedQuota / 1000).toFixed(0)}k`} />
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{p.remaining > 0 ? `${(p.remaining / 1000).toFixed(0)}k` : "—"}</TableCell>
                    <TableCell className="text-right">
                      {p.overage > 0 ? <span className="font-bold text-status-critical tabular-nums">€{p.overage}</span> : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderTrend(p)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-semibold tabular-nums ${p.projectedEndOfCycle > 100 ? "text-status-critical" : p.projectedEndOfCycle >= 80 ? "text-status-warning" : "text-foreground"}`}>
                        {p.projectedEndOfCycle}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-xs">{p.resetDate ? new Date(p.resetDate).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" }) : "—"}</span>
                        <p className="text-[10px] text-muted-foreground">{t.daysLeft(p.daysUntilReset)}</p>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={p.syncStatus} showIcon /></TableCell>
                    <TableCell><StatusBadge status={p.dataOrigin} /></TableCell>
                    <TableCell><StatusBadge status={p.recommendation} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Providers;
