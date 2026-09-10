import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Smile,
  Wallet,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { AiBackground } from "@/components/ai-background";
import { useApp } from "@/components/app-context";
import logo from "@/assets/mitsuki-logo.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { restaurants, notifications, formatDate } from "@/data/mitsuki";
import { periodLabel, type PeriodKey, type Scope } from "@/services/odooService";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/achats", label: "Achats & Approvisionnement", icon: ShoppingCart },
  { to: "/production", label: "Production & Stocks", icon: Package },
  { to: "/finance", label: "Finance & Performance", icon: Wallet },
  { to: "/satisfaction", label: "Satisfaction & Qualité", icon: Smile },
  { to: "/community", label: "Community Manager", icon: Megaphone },
  { to: "/alertes", label: "Centre d'alertes", icon: ShieldAlert },
  { to: "/configuration", label: "Paramètres", icon: Settings },
] as const;

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  const location = useLocation();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
      {nav.map((item) => {
        const active =
          item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
        const link = (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              collapsed && "justify-center px-2",
              active
                ? "bg-primary/12 text-accent-foreground shadow-[inset_2px_0_0_0_var(--primary)]"
                : "text-muted-foreground hover:translate-x-0.5 hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
        if (!collapsed) return link;
        return (
          <Tooltip key={item.to}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  const { user } = useApp();
  const router = useRouter();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className={cn("flex items-center gap-2.5 px-5 py-5", collapsed && "justify-center px-2")}>
        <img src={logo} alt="Logo Mitsuki" className="size-9 rounded-lg object-contain" />
        {!collapsed && (
          <div>
            <p className="text-sm leading-tight font-semibold tracking-tight text-petrol">
              MITSUKI AI
            </p>
            <p className="text-[11px] text-muted-foreground">Pilotage opérationnel</p>
          </div>
        )}
      </div>

      <NavLinks collapsed={collapsed} onNavigate={onNavigate} />

      <div className="border-t p-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">DM</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        )}
        <div className="mt-1 space-y-0.5">
          <Link
            to="/alertes"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Bell className="size-4" />
            {!collapsed && "Notifications"}
            {!collapsed && unread > 0 && (
              <Badge className="ml-auto h-5 rounded-full bg-destructive px-1.5 text-[10px] text-destructive-foreground">
                {unread}
              </Badge>
            )}
          </Link>
          <button
            onClick={() => router.navigate({ to: "/login" })}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <LogOut className="size-4" />
            {!collapsed && "Déconnexion"}
          </button>
        </div>
      </div>
    </>
  );
}

export function AppShell({
  title,
  breadcrumbs,
  children,
  actions,
  ambient = false,
}: {
  title: string;
  breadcrumbs?: { label: string; to?: string }[];
  children: ReactNode;
  actions?: ReactNode;
  /** Affiche le fond animé subtil (dashboard, espaces d'analyse IA). */
  ambient?: boolean;
}) {
  const { scope, setScope, period, setPeriod, user } = useApp();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r bg-sidebar transition-[width] duration-300 md:flex",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        {ambient && <AiBackground />}

        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b bg-card/95 px-4 py-3 backdrop-blur md:px-5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-full flex-col">
                <SidebarBody onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Déployer le menu" : "Replier le menu"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-petrol">{title}</h1>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                {breadcrumbs.map((b, i) => (
                  <span key={b.label} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="size-3" />}
                    {b.to ? (
                      <Link to={b.to} className="hover:text-foreground">
                        {b.label}
                      </Link>
                    ) : (
                      <span>{b.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {actions}
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
              <SelectTrigger className="w-[150px] bg-card lg:w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(periodLabel) as PeriodKey[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {periodLabel[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={scope} onValueChange={(v) => setScope(v as Scope)}>
              <SelectTrigger className="w-[170px] bg-card lg:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les établissements</SelectItem>
                {restaurants.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative bg-card">
                  <Bell className="size-4" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                      {unread}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
                    <span className="text-sm font-medium">{n.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {n.detail} · {formatDate(n.date)}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="size-9 cursor-pointer">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    DM
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.navigate({ to: "/configuration" })}>
                  Paramètres
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.navigate({ to: "/login" })}>
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="page-enter min-w-0 flex-1 space-y-5 p-4 pb-24 md:p-5">{children}</main>
      </div>
    </div>
  );
}
