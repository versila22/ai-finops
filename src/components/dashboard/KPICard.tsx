import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  status?: "healthy" | "warning" | "critical" | "info";
}

export function KPICard({ title, value, subtitle, icon: Icon, status = "info" }: KPICardProps) {
  const statusBg = {
    healthy: "bg-status-healthy-muted",
    warning: "bg-status-warning-muted",
    critical: "bg-status-critical-muted",
    info: "bg-status-info-muted",
  };
  const statusIcon = {
    healthy: "text-status-healthy",
    warning: "text-status-warning",
    critical: "text-status-critical",
    info: "text-status-info",
  };

  return (
    <Card className="p-5 flex items-start gap-4">
      <div className={cn("rounded-lg p-2.5", statusBg[status])}>
        <Icon className={cn("h-5 w-5", statusIcon[status])} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
}
