import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  status?: "healthy" | "warning" | "critical" | "info";
  accent?: boolean;
}

export function KPICard({ title, value, subtitle, icon: Icon, status = "info", accent }: KPICardProps) {
  const statusBorder = {
    healthy: "border-l-status-healthy",
    warning: "border-l-status-warning",
    critical: "border-l-status-critical",
    info: "border-l-primary",
  };
  const statusIcon = {
    healthy: "text-status-healthy",
    warning: "text-status-warning",
    critical: "text-status-critical",
    info: "text-primary",
  };

  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 border-l-[3px] transition-shadow hover:shadow-md",
      statusBorder[status],
      accent && "bg-gradient-to-br from-card to-accent/30"
    )}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <Icon className={cn("h-4 w-4", statusIcon[status])} strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground mt-1.5 leading-tight">{subtitle}</p>}
    </div>
  );
}
