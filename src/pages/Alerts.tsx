import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { alerts } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, CheckCircle } from "lucide-react";
import { useI18n } from "@/i18n";

const Alerts = () => {
  const { t } = useI18n();
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  const AlertTable = ({ items }: { items: typeof alerts }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">{t.thSeverity}</TableHead>
          <TableHead>{t.thType}</TableHead>
          <TableHead>{t.thProvider}</TableHead>
          <TableHead>{t.thDate}</TableHead>
          <TableHead className="max-w-[300px]">{t.thDescription}</TableHead>
          <TableHead className="max-w-[250px]">{t.thRecommendedAction}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">{t.noAlertsToDisplay}</TableCell>
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
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

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
