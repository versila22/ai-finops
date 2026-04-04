import { cn } from "@/lib/utils";

interface SpendBarProps {
  planCost: number;
  overage: number;
  budget: number;
  className?: string;
}

export function SpendBar({ planCost, overage, budget, className }: SpendBarProps) {
  const planPercent = Math.min((planCost / budget) * 100, 100);
  const overagePercent = Math.min((overage / budget) * 100, 100 - planPercent);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>€0</span>
        <span>€{budget}</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute left-0 top-0 h-full bg-spend-plan rounded-l-full transition-all duration-500"
          style={{ width: `${planPercent}%` }}
        />
        {overage > 0 && (
          <div
            className="absolute top-0 h-full bg-spend-overage transition-all duration-500"
            style={{ left: `${planPercent}%`, width: `${overagePercent}%` }}
          />
        )}
      </div>
      <div className="flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-spend-plan" />
          <span className="text-muted-foreground">Plans €{planCost}</span>
        </div>
        {overage > 0 && (
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-sm bg-spend-overage" />
            <span className="text-muted-foreground">Overage €{overage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
