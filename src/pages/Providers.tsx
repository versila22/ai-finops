import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { providers } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Providers = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Providers & Tools</h1>
          <p className="text-sm text-muted-foreground mt-1">All tracked AI providers and their current status</p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Quota</TableHead>
                  <TableHead className="w-[140px]">Usage</TableHead>
                  <TableHead className="text-right">Overage</TableHead>
                  <TableHead>Reset</TableHead>
                  <TableHead>Sync</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/providers/${p.id}`)}
                  >
                    <TableCell className="font-semibold">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{p.plan}</span>
                        <StatusBadge status={p.planType} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">€{p.monthlyCost}</TableCell>
                    <TableCell className="text-right text-sm">
                      {p.includedQuota.toLocaleString()} {p.quotaUnit}
                    </TableCell>
                    <TableCell>
                      <UsageProgressBar value={p.usagePercent} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      {p.overage > 0 ? (
                        <span className="font-semibold text-status-critical">€{p.overage}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(p.resetDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</TableCell>
                    <TableCell><StatusBadge status={p.syncStatus} /></TableCell>
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
