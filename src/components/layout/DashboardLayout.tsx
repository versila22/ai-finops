import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Zap, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useI18n, type Locale } from "@/i18n";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border/60 bg-card/80 backdrop-blur-sm px-4 shrink-0 sticky top-0 z-10">
            <SidebarTrigger className="mr-3" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" />
              <span className="font-medium">{t.headerTitle}</span>
              <span className="text-border">·</span>
              <span>{t.april2026}</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {/* Language switcher */}
              <div className="flex items-center rounded-md border border-border/60 bg-muted/40 p-0.5">
                {(["en", "fr"] as Locale[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold uppercase tracking-wide transition-all ${
                      locale === l
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
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
