import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { TrendingDown, TrendingUp, Eye, CheckCircle, ArrowRight, AlertTriangle, Clock } from "lucide-react";
import type { RecommendationType, Urgency } from "@/data/mockData";
import { useI18n } from "@/i18n";

interface RecommendationCardProps {
  providerName: string;
  recommendation: RecommendationType;
  text: string;
  detail: string;
  savings?: string;
  urgency?: Urgency;
  className?: string;
  compact?: boolean;
}

const icons: Record<RecommendationType, typeof CheckCircle> = {
  maintain: CheckCircle,
  downgrade: TrendingDown,
  upgrade: TrendingUp,
  watch: Eye,
  review: ArrowRight,
};

const accentBorders: Record<RecommendationType, string> = {
  maintain: "border-l-status-healthy",
  downgrade: "border-l-spend-prepaid",
  upgrade: "border-l-status-warning",
  watch: "border-l-status-warning",
  review: "border-l-primary",
};

const urgencyStyles: Record<Urgency, string> = {
  high: "bg-status-critical-muted text-status-critical border-status-critical/20",
  medium: "bg-status-warning-muted text-status-warning border-status-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function RecommendationCard({ providerName, recommendation, text, detail, savings, urgency, className, compact }: RecommendationCardProps) {
  const Icon = icons[recommendation];
  const { t } = useI18n();

  const urgencyLabel = urgency === "high" ? t.urgencyHigh : urgency === "medium" ? t.urgencyMedium : t.urgencyLow;

  if (compact) {
    return (
      <div className={cn(
        "flex items-start gap-3 p-3 rounded-lg border border-l-[3px] bg-card",
        accentBorders[recommendation],
        className
      )}>
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold">{providerName}</span>
            <StatusBadge status={recommendation} />
            {urgency && (
              <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", urgencyStyles[urgency])}>
                <AlertTriangle className="h-2.5 w-2.5" />
                {urgencyLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border border-l-[3px] bg-card p-4 space-y-3",
      accentBorders[recommendation],
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-sm font-bold">{providerName}</span>
        <StatusBadge status={recommendation} />
        {urgency && (
          <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ml-auto", urgencyStyles[urgency])}>
            <AlertTriangle className="h-2.5 w-2.5" />
            {urgencyLabel}
          </span>
        )}
      </div>

      {/* Structured fields */}
      <div className="space-y-2 text-xs">
        <div className="flex gap-2">
          <span className="text-muted-foreground font-semibold uppercase tracking-wider w-16 shrink-0">{t.recAction}</span>
          <span className="font-medium">{text}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground font-semibold uppercase tracking-wider w-16 shrink-0">{t.recReason}</span>
          <span className="text-muted-foreground leading-relaxed">{detail}</span>
        </div>
      </div>

      {/* Impact / Savings */}
      {savings && (
        <div className="flex items-center gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-status-healthy-muted px-2.5 py-1.5 text-xs font-bold text-status-healthy border border-status-healthy/20">
            <TrendingDown className="h-3.5 w-3.5" />
            {t.potentialSavingsLabel(savings)}
          </div>
        </div>
      )}
    </div>
  );
}
