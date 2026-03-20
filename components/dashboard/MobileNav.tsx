"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Users,
  Menu,
  ShoppingCart,
  Calculator,
  FolderKanban,
  Factory,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Sales", href: "/dashboard/quotations", icon: TrendingUp },
  { label: "Inventory", href: "/dashboard/inventory", icon: Package },
  { label: "HR", href: "/dashboard/hr", icon: Users },
];

const MORE_ITEMS: NavItem[] = [
  { label: "Purchasing", href: "/dashboard/procurement", icon: ShoppingCart },
  { label: "Accounting", href: "/dashboard/accounting", icon: Calculator },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Manufacturing", href: "/dashboard/manufacturing", icon: Factory },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href.split("?")[0]);
}

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* Slide-up "More" sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMoreOpen(false)} aria-hidden />
          {/* Panel */}
          <div className="absolute inset-x-0 bottom-0 z-[61] rounded-t-2xl bg-background pb-[calc(env(safe-area-inset-bottom)+4.5rem)] shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">More</h2>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-accent"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="grid grid-cols-3 gap-2 p-4">
              {MORE_ITEMS.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex min-h-[4rem] flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-center transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <item.icon className="size-5 shrink-0" />
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)] md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex h-16 items-stretch">
          {PRIMARY_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-5 shrink-0" />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
              moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Menu className="size-5 shrink-0" />
            <span className="text-[10px] font-medium leading-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
