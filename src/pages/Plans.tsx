import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { UsageProgressBar } from "@/components/dashboard/UsageProgressBar";
import { providers } from "@/data/mockData";

function getProjectedStatus(p: typeof providers[0]) {
  if (p.usagePercent > 100) return { label: "Over Quota", status: "critical" as const };
  if (p.usagePercent >= 80) return { label: "May Exceed", status: "warning" as const };
  if (p.usagePercent < 30) return { label: "Underused", status: "info" as const };
  return { label: "On Track", status: "healthy" as const };
}

const Plans = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plans & Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">All active plans and their projected end-of-cycle status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {providers.map((p) => {
            const projected = getProjectedStatus(p);
            return (
              <Card key={p.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <StatusBadge status={p.planType} />
                  </div>
                  <p className="text-sm text-muted-foreground">{p.plan}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Cost</span>
                    <span className="font-semibold">€{p.monthlyCost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Included Quota</span>
                    <span className="font-medium">{p.includedQuota.toLocaleString()} {p.quotaUnit}</span>
                  </div>
                  <UsageProgressBar
                    value={p.usagePercent}
                    label={`${p.consumed.toLocaleString()} / ${p.includedQuota.toLocaleString()}`}
                    size="sm"
                  />
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Projected</p>
                      <StatusBadge status={projected.status} className="mt-1" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Recommendation</p>
                      <StatusBadge status={p.recommendation} className="mt-1" />
                    </div>
                  </div>
                  {p.overage > 0 && (
                    <div className="p-2 rounded-md bg-status-critical-muted text-center">
                      <p className="text-xs font-semibold text-status-critical">€{p.overage} overage this cycle</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Plans;
