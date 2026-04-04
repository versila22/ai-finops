import { cn } from "@/lib/utils";

interface RadialProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export function RadialProgress({ value, size = 80, strokeWidth = 7, className, label }: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.min(value, 100);
  const offset = circumference - (clampedValue / 100) * circumference;

  const color = value > 100
    ? "text-status-critical"
    : value >= 80
    ? "text-status-warning"
    : value < 30
    ? "text-primary/60"
    : "text-status-healthy";

  const trackColor = value > 100
    ? "text-status-critical-muted"
    : value >= 80
    ? "text-status-warning-muted"
    : "text-secondary";

  return (
    <div className={cn("relative inline-flex flex-col items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackColor}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-700 ease-out", color)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-sm font-bold tabular-nums", color)}>{value}%</span>
      </div>
      {label && <span className="text-[10px] text-muted-foreground mt-1 font-medium">{label}</span>}
    </div>
  );
}
