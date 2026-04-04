import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface UsageProgressBarProps {
  value: number;
  label?: string;
  showPercent?: boolean;
  size?: "sm" | "md";
  className?: string;
}

function getStatusColor(value: number) {
  if (value > 100) return "bg-status-critical";
  if (value >= 80) return "bg-status-warning";
  if (value < 30) return "bg-status-info";
  return "bg-status-healthy";
}

export function UsageProgressBar({ value, label, showPercent = true, size = "md", className }: UsageProgressBarProps) {
  const clampedValue = Math.min(value, 100);

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground font-medium">{label}</span>}
          {showPercent && (
            <span className={cn("font-semibold", value > 100 ? "text-status-critical" : value >= 80 ? "text-status-warning" : "text-foreground")}>
              {value}%
            </span>
          )}
        </div>
      )}
      <div className={cn("relative w-full overflow-hidden rounded-full bg-secondary", size === "sm" ? "h-2" : "h-3")}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", getStatusColor(value))}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
