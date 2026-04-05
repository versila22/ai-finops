import {
  LayoutDashboard,
  Server,
  Bell,
  CreditCard,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useI18n } from "@/i18n";
import { useDashboard } from "@/hooks/use-api";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t } = useI18n();
  const { data: dashboardData } = useDashboard();
  const activeAlertCount = dashboardData?.kpis?.activeAlertCount ?? 0;

  const navItems = [
    { title: t.navCockpit, url: "/", icon: LayoutDashboard },
    { title: t.navProviders, url: "/providers", icon: Server },
    { title: t.navAlerts, url: "/alerts", icon: Bell, badge: activeAlertCount },
    { title: t.navPlans, url: "/plans", icon: CreditCard },
    { title: t.navAdjustments, url: "/adjustments", icon: SlidersHorizontal },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold tracking-tight leading-none">{t.appName}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.appTagline}</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent/60 relative"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4" strokeWidth={1.5} />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && item.badge > 0 && (
                            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-status-critical text-[10px] font-bold text-status-critical-foreground">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t.cycle}</p>
            <p className="text-xs font-medium mt-0.5">{t.cycleRange}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
