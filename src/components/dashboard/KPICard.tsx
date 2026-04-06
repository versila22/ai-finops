import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  status?: "healthy" | "warning" | "critical" | "info";
  accent?: boolean;
  onClick?: () => void;
}

export function KPICard({ title, value, subtitle, icon: Icon, status = "info", accent, onClick }: KPICardProps) {
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

  const clickable = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        "w-full rounded-lg border bg-card p-4 border-l-[3px] text-left transition-all hover:shadow-md",
        clickable && "cursor-pointer hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        !clickable && "cursor-default",
        statusBorder[status],
        accent && "bg-gradient-to-br from-card to-accent/30"
      )}
    >
      <div className="flex items-center justify-between mb-2 gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <Icon className={cn("h-4 w-4 shrink-0", statusIcon[status])} strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground mt-1.5 leading-tight">{subtitle}</p>}
    </button>
  );
}
