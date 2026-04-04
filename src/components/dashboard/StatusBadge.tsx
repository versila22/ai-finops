import { cn } from "@/lib/utils";

type StatusType = "healthy" | "warning" | "critical" | "info" | "synced" | "pending" | "error" | "manual" |
  "maintain" | "downgrade" | "upgrade" | "watch" | "review" |
  "auto" | "adjusted" | "monthly_quota" | "prepaid_credits" |
  "active" | "resolved";

const styles: Record<string, string> = {
  healthy: "bg-status-healthy-muted text-status-healthy",
  warning: "bg-status-warning-muted text-status-warning",
  critical: "bg-status-critical-muted text-status-critical",
  info: "bg-status-info-muted text-status-info",
  synced: "bg-status-healthy-muted text-status-healthy",
  pending: "bg-status-warning-muted text-status-warning",
  error: "bg-status-critical-muted text-status-critical",
  manual: "bg-status-info-muted text-status-info",
  maintain: "bg-status-healthy-muted text-status-healthy",
  downgrade: "bg-status-info-muted text-status-info",
  upgrade: "bg-status-warning-muted text-status-warning",
  watch: "bg-status-warning-muted text-status-warning",
  review: "bg-status-info-muted text-status-info",
  auto: "bg-status-healthy-muted text-status-healthy",
  adjusted: "bg-status-warning-muted text-status-warning",
  monthly_quota: "bg-status-info-muted text-status-info",
  prepaid_credits: "bg-secondary text-secondary-foreground",
  active: "bg-status-critical-muted text-status-critical",
  resolved: "bg-muted text-muted-foreground",
};

const labels: Record<string, string> = {
  monthly_quota: "Monthly Quota",
  prepaid_credits: "Prepaid Credits",
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
      styles[status] || "bg-muted text-muted-foreground",
      className
    )}>
      {labels[status] || status}
    </span>
  );
}
