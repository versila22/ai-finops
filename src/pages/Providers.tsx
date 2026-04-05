import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { ProviderLogo } from "@/components/dashboard/ProviderLogo";
import { useNavigate } from "react-router-dom";
import { useProviders } from "@/hooks/use-api";
import { useI18n } from "@/i18n";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const Providers = () => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const { data, isLoading } = useProviders();
  const providers = data ?? [];

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.providersTitle}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t.providersSubtitle(providers.length, providers.filter(p => p.syncStatus === "synced").length, providers.filter(p => p.dataOrigin === "manual" || p.dataOrigin === "adjusted").length)}
          </p>
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
                {providers.map((p) => (
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
                      {p.trend === "up" && <TrendingUp className="inline h-3.5 w-3.5 text-status-warning" />}
                      {p.trend === "down" && <TrendingDown className="inline h-3.5 w-3.5 text-status-info" />}
                      {p.trend === "stable" && <Minus className="inline h-3.5 w-3.5 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-semibold tabular-nums ${p.projectedEndOfCycle > 100 ? "text-status-critical" : p.projectedEndOfCycle >= 80 ? "text-status-warning" : "text-foreground"}`}>
                        {p.projectedEndOfCycle}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-xs">{new Date(p.resetDate).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short" })}</span>
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
