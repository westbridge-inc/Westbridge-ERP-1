"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, User, Settings, CreditCard, LogOut, Keyboard } from "lucide-react";
import { ROUTES } from "@/lib/config/site";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import dynamic from "next/dynamic";

const CommandPalette = dynamic(
  () => import("@/components/dashboard/CommandPalette").then((m) => ({ default: m.CommandPalette })),
  { ssr: false },
);
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ShortcutsModal } from "@/components/dashboard/ShortcutsModal";
import { useShortcuts } from "@/components/dashboard/ShortcutsContext";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const LABELS: Record<string, string> = {
  accounting: "Accounting",
  analytics: "Analytics",
  crm: "CRM",
  expenses: "Expenses",
  hr: "HR",
  inventory: "Inventory",
  invoices: "Invoices",
  procurement: "Procurement",
  quotations: "Quotations",
  settings: "Settings",
  dashboard: "Dashboard",
  projects: "Projects",
  manufacturing: "Manufacturing",
  admin: "Admin",
  jobs: "Jobs",
  onboarding: "Onboarding",
  new: "New",
  reconciliation: "Reconciliation",
};

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

function useSessionUser() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/validate`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { data?: { name?: string; email?: string } }) => {
        const raw = d?.data;
        if (raw) {
          const displayName = raw.name?.trim() || (raw.email ? raw.email.split("@")[0].replace(/[._-]/g, " ") : "");
          setUser({ name: displayName, email: raw.email ?? "" });
        }
      })
      .catch(() => setUser({ name: "User", email: "" }));
  }, []);

  return user;
}

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [openCommand, setOpenCommand] = useState(false);
  const { setOpenMobile, isMobile } = useSidebar();
  const { openShortcuts, setOpenShortcuts, openShortcutsModal } = useShortcuts();
  const user = useSessionUser();

  useKeyboardShortcuts({
    onOpenCommand: () => setOpenCommand(true),
    onOpenNotifications: () => {},
    onOpenShortcuts: openShortcutsModal,
  });

  const segments =
    pathname
      ?.replace(/^\/dashboard\/?/, "")
      .split("/")
      .filter(Boolean) ?? [];
  const breadcrumbItems = segments.length === 0 ? [] : ["dashboard", ...segments];

  async function handleSignOut() {
    try {
      const csrfRes = await fetch(`${API_BASE}/api/csrf`, { credentials: "include" });
      const csrfData = await csrfRes.json().catch(() => ({}));
      const token = csrfData?.data?.token ?? csrfData?.token;
      if (token) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: "POST",
          headers: { "X-CSRF-Token": token },
          credentials: "include",
        });
      }
    } finally {
      router.push(ROUTES.login);
      router.refresh();
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              onClick={() => setOpenMobile(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          )}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={ROUTES.dashboard}>Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbItems.slice(1).map((segment, i) => {
                const href = `${ROUTES.dashboard}/${breadcrumbItems.slice(1, i + 2).join("/")}`;
                const label = LABELS[segment] ?? segment;
                const isLast = i === breadcrumbItems.length - 2;
                return (
                  <span key={`${segment}-${i}`} className="flex items-center gap-1.5">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="font-medium">{label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={href}>{label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <TooltipProvider delayDuration={400}>
            {/* Search */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex"
                  onClick={() => setOpenCommand(true)}
                  aria-label="Search"
                >
                  <Search className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search (⌘K)</TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="User menu">
                      {user ? (
                        <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-[11px] font-medium text-background">
                          {getInitials(user.name)}
                        </span>
                      ) : (
                        <User className="size-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Account</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                {user && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings?tab=profile">
                    <User /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings?tab=billing">
                    <CreditCard /> Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openShortcutsModal}>
                  <Keyboard /> Keyboard Shortcuts
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </header>
      <CommandPalette open={openCommand} onClose={() => setOpenCommand(false)} />
      <ShortcutsModal open={openShortcuts} onClose={() => setOpenShortcuts(false)} />
    </>
  );
}
