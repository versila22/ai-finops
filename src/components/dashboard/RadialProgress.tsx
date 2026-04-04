import { cn } from "@/lib/utils";

interface RadialProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function RadialProgress({ value, size = 80, strokeWidth = 8, className }: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.min(value, 100);
  const offset = circumference - (clampedValue / 100) * circumference;

  const color = value > 100
    ? "text-status-critical"
    : value >= 80
    ? "text-status-warning"
    : value < 30
    ? "text-status-info"
    : "text-status-healthy";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
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
          className={cn("transition-all duration-500", color)}
        />
      </svg>
      <span className={cn("absolute text-sm font-bold", color)}>
        {value}%
      </span>
    </div>
  );
}
