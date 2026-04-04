import { cn } from "@/lib/utils";

interface ProviderLogoProps {
  name: string;
  logo: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorMap: Record<string, string> = {
  O: "bg-emerald-500/10 text-emerald-600",
  A: "bg-amber-500/10 text-amber-600",
  G: "bg-blue-500/10 text-blue-600",
  E: "bg-purple-500/10 text-purple-600",
  L: "bg-pink-500/10 text-pink-600",
};

const sizes = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

export function ProviderLogo({ name, logo, size = "md", className }: ProviderLogoProps) {
  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center font-bold shrink-0",
        colorMap[logo] || "bg-muted text-muted-foreground",
        sizes[size],
        className
      )}
      title={name}
    >
      {logo}
    </div>
  );
}
