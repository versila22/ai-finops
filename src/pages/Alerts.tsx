import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { Alert } from "@/data/mockData";
import { useAlerts } from "@/hooks/use-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, CheckCircle } from "lucide-react";
import { useI18n } from "@/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncProvider } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProviderBillingUrl } from "@/config/providerBilling";

const Alerts = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const selectedFilter = searchParams.get("filter");
  const { data, isLoading } = useAlerts();
  const alerts = data ?? [];

  const retrySyncMutation = useMutation({
    mutationFn: (providerId: string) => syncProvider(providerId),
    onSuccess: () => {
      toast.success(t.alertRetrySyncSuccess);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t.alertRetrySyncError);
    },
  });

  const activeAlerts = useMemo(() => {
    const active = alerts.filter((a) => a.status === "active");
    if (selectedFilter === "overage") {
      return active.filter((a) => a.type.toLowerCase().includes("overage"));
    }
    return active;
  }, [alerts, selectedFilter]);

  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  const renderAction = (alert: Alert) => {
    const type = alert.type.toLowerCase();
    const billingUrl = getProviderBillingUrl(alert.providerId);

    if (type.includes("overage") && billingUrl) {
      return (
        <Button size="sm" variant="outline" asChild>
          <a href={billingUrl} target="_blank" rel="noreferrer">{t.alertViewSubscription}</a>
        </Button>
      );
    }

    if (type.includes("high usage")) {
      return (
        <Button size="sm" variant="outline" onClick={() => navigate(`/providers/${alert.providerId}`)}>
          {t.alertViewUsage}
        </Button>
      );
    }

    if (type.includes("underused")) {
      return (
        <Button size="sm" variant="outline" onClick={() => navigate(`/providers/${alert.providerId}?section=subscription`)}>
          {t.alertOptimize}
        </Button>
      );
    }

    if (type.includes("sync issue")) {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => retrySyncMutation.mutate(alert.providerId)}
          disabled={retrySyncMutation.isPending}
        >
          {t.alertRetrySync}
        </Button>
      );
    }

    return <span className="text-xs text-muted-foreground">{alert.recommendedAction}</span>;
  };

  const AlertTable = ({ items }: { items: Alert[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">{t.thSeverity}</TableHead>
          <TableHead>{t.thType}</TableHead>
          <TableHead>{t.thProvider}</TableHead>
          <TableHead>{t.thDate}</TableHead>
          <TableHead className="max-w-[300px]">{t.thDescription}</TableHead>
          <TableHead className="max-w-[250px]">{t.thRecommendedAction}</TableHead>
          <TableHead className="w-[180px]">{t.thActionButton}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">{t.noAlertsToDisplay}</TableCell>
          </TableRow>
        ) : (
          items.map((a) => (
            <TableRow key={a.id}>
              <TableCell><StatusBadge status={a.severity} showIcon /></TableCell>
              <TableCell className="text-sm font-medium">{a.type}</TableCell>
              <TableCell className="text-sm font-semibold">{a.providerName}</TableCell>
              <TableCell className="text-xs text-muted-foreground tabular-nums">{a.triggerDate}</TableCell>
              <TableCell className="text-xs max-w-[300px] leading-relaxed">{a.description}</TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-[250px] leading-relaxed">{a.recommendedAction}</TableCell>
              <TableCell>{renderAction(a)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

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
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-status-warning-muted">
            <Bell className="h-4 w-4 text-status-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.alertsTitle}</h1>
            <p className="text-sm text-muted-foreground">{t.alertsSubtitle(activeAlerts.length, resolvedAlerts.length)}</p>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active" className="gap-1.5">
              <Bell className="h-3 w-3" /> {t.tabActive(activeAlerts.length)}
            </TabsTrigger>
            <TabsTrigger value="resolved" className="gap-1.5">
              <CheckCircle className="h-3 w-3" /> {t.tabResolved(resolvedAlerts.length)}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <Card><CardContent className="p-0"><AlertTable items={activeAlerts} /></CardContent></Card>
          </TabsContent>
          <TabsContent value="resolved">
            <Card><CardContent className="p-0"><AlertTable items={resolvedAlerts} /></CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
