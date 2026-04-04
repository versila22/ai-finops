import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight, LucideIcon, TrendingDown, TrendingUp, Eye, RefreshCw, CheckCircle } from "lucide-react";
import type { RecommendationType } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  providerName: string;
  recommendation: RecommendationType;
  text: string;
  className?: string;
}

const icons: Record<RecommendationType, LucideIcon> = {
  maintain: CheckCircle,
  downgrade: TrendingDown,
  upgrade: TrendingUp,
  watch: Eye,
  review: RefreshCw,
};

export function RecommendationCard({ providerName, recommendation, text, className }: RecommendationCardProps) {
  return (
    <Card className={cn("p-4 flex items-start gap-3", className)}>
      <div className="mt-0.5">
        {(() => { const Icon = icons[recommendation]; return <Icon className="h-4 w-4 text-muted-foreground" />; })()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">{providerName}</span>
          <StatusBadge status={recommendation} />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </Card>
  );
}
