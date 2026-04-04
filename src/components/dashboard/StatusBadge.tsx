import { cn } from "@/lib/utils";
import { Circle, CheckCircle, AlertTriangle, XCircle, Pencil, RefreshCw, ArrowDown, ArrowUp, Eye, Info } from "lucide-react";
import { useI18n } from "@/i18n";

type StatusType = "healthy" | "warning" | "critical" | "info" | "synced" | "pending" | "error" | "manual" |
  "maintain" | "downgrade" | "upgrade" | "watch" | "review" |
  "auto" | "adjusted" | "monthly_quota" | "prepaid_credits" |
  "active" | "resolved";

const styles: Record<string, string> = {
  healthy: "bg-status-healthy-muted text-status-healthy border-status-healthy/20",
  warning: "bg-status-warning-muted text-status-warning border-status-warning/20",
  critical: "bg-status-critical-muted text-status-critical border-status-critical/20",
  info: "bg-status-info-muted text-status-info border-status-info/20",
  synced: "bg-status-healthy-muted text-status-healthy border-status-healthy/20",
  pending: "bg-status-warning-muted text-status-warning border-status-warning/20",
  error: "bg-status-critical-muted text-status-critical border-status-critical/20",
  manual: "bg-status-info-muted text-status-info border-status-info/20",
  maintain: "bg-status-healthy-muted text-status-healthy border-status-healthy/20",
  downgrade: "bg-spend-prepaid/10 text-spend-prepaid border-spend-prepaid/20",
  upgrade: "bg-status-warning-muted text-status-warning border-status-warning/20",
  watch: "bg-status-warning-muted text-status-warning border-status-warning/20",
  review: "bg-status-info-muted text-status-info border-status-info/20",
  auto: "bg-status-healthy-muted text-status-healthy border-status-healthy/20",
  adjusted: "bg-status-warning-muted text-status-warning border-status-warning/20",
  monthly_quota: "bg-primary/8 text-primary border-primary/15",
  prepaid_credits: "bg-spend-prepaid/8 text-spend-prepaid border-spend-prepaid/15",
  active: "bg-status-critical-muted text-status-critical border-status-critical/20",
  resolved: "bg-muted text-muted-foreground border-border",
};

const iconMap: Record<string, typeof Circle> = {
  synced: CheckCircle,
  healthy: CheckCircle,
  maintain: CheckCircle,
  warning: AlertTriangle,
  watch: Eye,
  critical: XCircle,
  error: XCircle,
  pending: RefreshCw,
  manual: Pencil,
  adjusted: Pencil,
  downgrade: ArrowDown,
  upgrade: ArrowUp,
  auto: CheckCircle,
  info: Info,
};

// Map status keys to dictionary keys
const labelKeys: Record<string, string> = {
  monthly_quota: "badgeMonthly",
  prepaid_credits: "badgePrepaid",
  maintain: "badgeMaintain",
  downgrade: "badgeDowngrade",
  upgrade: "badgeUpgrade",
  watch: "badgeWatch",
  review: "badgeReview",
  synced: "badgeSynced",
  auto: "badgeAuto",
  adjusted: "badgeAdjusted",
  manual: "badgeManual",
  pending: "badgePending",
  error: "badgeError",
  active: "badgeActive",
  resolved: "badgeResolved",
  healthy: "badgeHealthy",
  warning: "badgeWarning",
  critical: "badgeCritical",
  info: "badgeInfo",
};

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = false, className }: StatusBadgeProps) {
  const { t } = useI18n();
  const IconComp = iconMap[status];
  const dictKey = labelKeys[status];
  const label = dictKey ? (t as any)[dictKey] || status : status;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize leading-none",
      styles[status] || "bg-muted text-muted-foreground border-border",
      className
    )}>
      {showIcon && IconComp && <IconComp className="h-3 w-3" />}
      {label}
    </span>
  );
}
