import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { ProviderLogo } from "@/components/dashboard/ProviderLogo";
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
      <div className="space-y-6 max-w-[1400px]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Providers & Tools</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {providers.length} tracked · {providers.filter(p => p.syncStatus === "synced").length} synced · {providers.filter(p => p.dataOrigin === "manual" || p.dataOrigin === "adjusted").length} manual
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Provider</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="w-[160px]">Quota Usage</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Overage</TableHead>
                  <TableHead>Reset</TableHead>
                  <TableHead>Sync</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => navigate(`/providers/${p.id}`)}
                  >
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
                      <UsageProgressBar
                        value={p.usagePercent}
                        size="xs"
                        label={`${(p.consumed / 1000).toFixed(0)}k / ${(p.includedQuota / 1000).toFixed(0)}k`}
                      />
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {p.remaining > 0 ? `${(p.remaining / 1000).toFixed(0)}k` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.overage > 0 ? (
                        <span className="font-bold text-status-critical tabular-nums">€{p.overage}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-xs">{new Date(p.resetDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                        <p className="text-[10px] text-muted-foreground">{p.daysUntilReset}d</p>
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
