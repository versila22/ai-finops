import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { alerts } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Alerts = () => {
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  const AlertTable = ({ items }: { items: typeof alerts }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Severity</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Recommended Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((a) => (
          <TableRow key={a.id}>
            <TableCell><StatusBadge status={a.severity} /></TableCell>
            <TableCell className="font-medium text-sm">{a.type}</TableCell>
            <TableCell className="text-sm">{a.providerName}</TableCell>
            <TableCell className="text-xs text-muted-foreground">{a.triggerDate}</TableCell>
            <TableCell className="text-sm max-w-[280px]">{a.description}</TableCell>
            <TableCell className="text-xs text-muted-foreground max-w-[240px]">{a.recommendedAction}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts Center</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeAlerts.length} active alerts</p>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({activeAlerts.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedAlerts.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <Card>
              <CardContent className="p-0">
                <AlertTable items={activeAlerts} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="resolved">
            <Card>
              <CardContent className="p-0">
                <AlertTable items={resolvedAlerts} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
