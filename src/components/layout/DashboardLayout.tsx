import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Zap } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border/60 bg-card/80 backdrop-blur-sm px-4 shrink-0 sticky top-0 z-10">
            <SidebarTrigger className="mr-3" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              <span className="font-medium">AI FinOps Cockpit</span>
              <span className="text-border">·</span>
              <span>April 2026</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-5">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
