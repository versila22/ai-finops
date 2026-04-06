import { BarChart3, Bell, CreditCard, Home } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "Providers", to: "/providers", icon: BarChart3 },
  { label: "Alerts", to: "/alerts", icon: Bell },
  { label: "Plans", to: "/plans", icon: CreditCard },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="grid h-14 grid-cols-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} strokeWidth={1.8} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
