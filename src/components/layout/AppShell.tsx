"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays, Check, ChevronDown, ChevronRight, ClipboardList, Clock, Earth, Factory, Fingerprint, LayoutDashboard,
  ListOrdered, LogOut, Menu, Package, PlusCircle, Settings, ShoppingBag, Truck, UserCircle, Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LOGO_URL } from "@/lib/brand";
import { signOut } from "@/lib/actions/auth";
import { updateMyProfile } from "@/lib/actions/profile";
import type { NavIcon, NavItem } from "@/lib/auth/navigation";
import type { Role } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard, clock: Clock, bag: ShoppingBag, package: Package, factory: Factory, users: Users,
  calendar: CalendarDays, fingerprint: Fingerprint, clipboard: ClipboardList, user: UserCircle, settings: Settings,
  plus: PlusCircle, list: ListOrdered, truck: Truck,
};

export type ShellUser = {
  name: string | null;
  email: string;
  role: Role;
  department: string | null;
  systemLanguage: string;
};

/**
 * Sidebar + mobile header (old Layout.jsx).
 * The sidebar is always exactly the screen height: on desktop it is sticky, only the menu scrolls,
 * so the account footer stays at the bottom however long the page is.
 */
export function AppShell({ nav, user, version, children }: {
  nav: NavItem[];
  user: ShellUser;
  version: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]); // close the mobile menu after navigating

  return (
    <div className="min-h-screen bg-background flex">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex-shrink-0 bg-card border-r border-border",
        "flex flex-col transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}>
        {/* Logo */}
        <div className="p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_URL} alt="BoneEasy" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-foreground tracking-tight leading-none">BoneEasy</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Tailored Prosthetics</p>
            </div>
          </div>
        </div>

        {/* Menu: the only part that scrolls */}
        <nav className="flex-1 min-h-0 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => <NavEntry key={item.label} item={item} />)}
        </nav>

        <UserFooter user={user} version={version} />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu"
            className="h-9 w-9 hover:bg-transparent hover:text-primary">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_URL} alt="BoneEasy" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-sm">BoneEasy</span>
          </div>
          <div className="w-9" />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Menu entries                                                        */
/* ------------------------------------------------------------------ */

function NavEntry({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = ICONS[item.icon];
  const childActive = item.children?.some((c) => pathname.startsWith(c.href)) ?? false;
  const [expanded, setExpanded] = useState(childActive);
  const base = "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";

  if (item.children) {
    return (
      <div>
        <button onClick={() => setExpanded((v) => !v)}
          className={cn(base, childActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/60")}>
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }} className="overflow-hidden ml-4 mt-1 space-y-0.5">
              {item.children.map((c) => {
                const active = pathname.startsWith(c.href);
                return (
                  <Link key={c.href} href={c.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                      active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    {c.label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // "/orders" stays active on "/orders/<id>" but not on "/orders/new" (its own menu entry)
  const active = pathname === item.href ||
    (pathname.startsWith(`${item.href}/`) && !(item.href === "/orders" && pathname === "/orders/new"));
  return (
    <Link href={item.href!}
      className={cn(base, active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60")}>
      <Icon className="w-5 h-5" />
      <span className="flex-1">{item.label}</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Account footer                                                      */
/* ------------------------------------------------------------------ */

const popover = {
  initial: { opacity: 0, y: 6, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.96 },
  transition: { duration: 0.15 },
};

function UserFooter({ user, version }: { user: ShellUser; version: string | null }) {
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const badge = user.role === "employee" && user.department ? `${roleLabel} - ${user.department}` : roleLabel;

  return (
    <div className="p-4 border-t border-border flex-shrink-0">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
          {(user.name || user.email || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.name || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Badge className="text-xs truncate bg-primary/10 text-primary hover:bg-primary/20 font-normal border-0">{badge}</Badge>
        <div className="flex items-center gap-2">
          <LanguageSwitcher current={user.systemLanguage} />
          <LogoutButton />
        </div>
      </div>

      <div className="flex items-center mt-1">
        <p className="ml-auto text-[9px] text-muted-foreground truncate">Version {version || "..."}</p>
      </div>
    </div>
  );
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
];

/** Globe button: changes profiles.system_language (old LanguageSwitcher.jsx). */
function LanguageSwitcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const [saving, start] = useTransition();
  const router = useRouter();

  const select = (code: string) => {
    setOpen(false);
    if (code === current) return;
    start(async () => {
      const r = await updateMyProfile({ system_language: code as "en" | "pt" });
      if (!r.ok) toast.error(r.error);
      else router.refresh(); // reloads server data in the new language, no full page reload
    });
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" title="System Language" disabled={saving} onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-primary flex-shrink-0">
        <Earth className="w-4 h-4" />
      </Button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div {...popover} className="absolute bottom-10 right-0 w-44 rounded-xl border border-border bg-card shadow-xl p-1.5 z-50">
              <p className="text-xs text-muted-foreground font-medium px-2.5 py-1.5">System Language</p>
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => select(l.code)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors hover:bg-muted/60 text-foreground">
                  {l.label}
                  {current === l.code && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Log out with the small "Confirm Log out?" popover. */
function LogoutButton() {
  const [confirm, setConfirm] = useState(false);
  const [leaving, start] = useTransition();

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" title="Log out" onClick={() => setConfirm((v) => !v)}
        className="h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-primary flex-shrink-0">
        <LogOut className="w-4 h-4" />
      </Button>
      <AnimatePresence>
        {confirm && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setConfirm(false)} />
            <motion.div {...popover} className="absolute bottom-10 right-0 w-44 rounded-xl border border-border bg-card shadow-xl p-2 z-50">
              <p className="text-xs text-foreground font-medium text-center px-2 pb-2">Confirm Log out?</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={() => setConfirm(false)}>Cancel</Button>
                <Button size="sm" className="flex-1 h-8 text-xs" disabled={leaving} onClick={() => start(() => signOut())}>
                  {leaving ? "..." : "Yes"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
