import { cn } from "@/lib/utils";

interface UsageProgressBarProps {
  value: number;
  label?: string;
  showPercent?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
  sublabel?: string;
}

function getBarColor(value: number) {
  if (value > 100) return "bg-status-critical";
  if (value >= 80) return "bg-status-warning";
  if (value < 30) return "bg-primary/60";
  return "bg-status-healthy";
}

function getTextColor(value: number) {
  if (value > 100) return "text-status-critical";
  if (value >= 80) return "text-status-warning";
  return "text-foreground";
}

export function UsageProgressBar({ value, label, showPercent = true, size = "md", className, sublabel }: UsageProgressBarProps) {
  const clampedValue = Math.min(value, 100);
  const heights = { xs: "h-1.5", sm: "h-2", md: "h-2.5" };

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showPercent) && (
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            {label && <span className="text-xs text-muted-foreground truncate">{label}</span>}
            {sublabel && <span className="text-[10px] text-muted-foreground/60">{sublabel}</span>}
          </div>
          {showPercent && (
            <span className={cn("text-xs font-bold tabular-nums shrink-0", getTextColor(value))}>
              {value}%
            </span>
          )}
        </div>
      )}
      <div className={cn("relative w-full overflow-hidden rounded-full bg-secondary", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", getBarColor(value))}
          style={{ width: `${clampedValue}%` }}
        />
        {/* Threshold marker at 80% */}
        {size !== "xs" && (
          <div className="absolute top-0 h-full w-px bg-foreground/10" style={{ left: "80%" }} />
        )}
      </div>
    </div>
  );
}
