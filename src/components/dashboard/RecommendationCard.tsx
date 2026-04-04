import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { TrendingDown, TrendingUp, Eye, CheckCircle, ArrowRight } from "lucide-react";
import type { RecommendationType } from "@/data/mockData";

interface RecommendationCardProps {
  providerName: string;
  recommendation: RecommendationType;
  text: string;
  detail: string;
  savings?: string;
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

export function RecommendationCard({ providerName, recommendation, text, detail, savings, className, compact }: RecommendationCardProps) {
  const Icon = icons[recommendation];

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
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border border-l-[3px] bg-card p-4",
      accentBorders[recommendation],
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-sm font-bold">{providerName}</span>
        <StatusBadge status={recommendation} />
      </div>
      <p className="text-sm font-medium mb-1">{text}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
      {savings && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-status-healthy-muted px-2.5 py-1 text-xs font-semibold text-status-healthy">
          <TrendingDown className="h-3 w-3" />
          Potential savings: {savings}
        </div>
      )}
    </div>
  );
}
