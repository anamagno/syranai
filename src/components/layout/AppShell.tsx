"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays, ChevronDown, ChevronRight, ClipboardList, Clock, Factory, Fingerprint, LayoutDashboard,
  ListOrdered, LogOut, Menu, Package, PlusCircle, Settings, ShoppingBag, Stethoscope, Truck, UserCircle, Users, X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LOGO_URL } from "@/lib/brand";
import { signOut } from "@/lib/actions/auth";
import type { NavIcon, NavItem } from "@/lib/auth/navigation";
import type { Role } from "@/lib/auth/roles";

const ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard, clock: Clock, bag: ShoppingBag, package: Package, factory: Factory, users: Users,
  calendar: CalendarDays, fingerprint: Fingerprint, clipboard: ClipboardList, user: UserCircle, settings: Settings,
  plus: PlusCircle, list: ListOrdered, truck: Truck,
};
const ROLE_ICON: Record<Role, LucideIcon> = { supervisor: Users, employee: UserCircle, doctor: Stethoscope, distributor: Truck };

type ShellUser = { name: string; email: string; role: Role; department: string | null };

export function AppShell({ nav, user, children }: { nav: NavItem[]; user: ShellUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r bg-card flex flex-col transition-transform md:translate-x-0 md:static",
        open ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="flex items-center gap-3 px-5 h-16 border-b">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_URL} alt="BoneEasy" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-lg">BoneEasy</span>
          <button className="ml-auto md:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map((item) => <NavEntry key={item.label} item={item} onNavigate={() => setOpen(false)} />)}
        </nav>
        <UserFooter user={user} />
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden h-14 border-b flex items-center px-4 bg-card">
          <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="w-5 h-5" /></button>
          <span className="ml-3 font-semibold">BoneEasy</span>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function NavEntry({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const Icon = ICONS[item.icon];
  const childActive = item.children?.some((c) => pathname.startsWith(c.href)) ?? false;
  const [expanded, setExpanded] = useState(childActive);
  const base = "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";

  if (item.children) {
    return (
      <div>
        <button className={cn(base, "hover:bg-muted", childActive && "text-primary")} onClick={() => setExpanded((v) => !v)}>
          <Icon className="w-4 h-4" />
          <span className="flex-1 text-left">{item.label}</span>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {expanded && (
          <div className="ml-7 mt-1 space-y-1">
            {item.children.map((c) => (
              <Link key={c.href} href={c.href} onClick={onNavigate}
                className={cn(base, "py-1.5", pathname.startsWith(c.href) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted")}>
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // "/orders" stays active on "/orders/<id>" but not on "/orders/new" (its own menu entry)
  const active = pathname === item.href ||
    (pathname.startsWith(`${item.href}/`) && !(item.href === "/orders" && pathname === "/orders/new"));
  return (
    <Link href={item.href!} onClick={onNavigate}
      className={cn(base, active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted")}>
      <Icon className="w-4 h-4" /> {item.label}
    </Link>
  );
}

function UserFooter({ user }: { user: ShellUser }) {
  const RoleIcon = ROLE_ICON[user.role];
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  return (
    <div className="border-t p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"><RoleIcon className="w-4 h-4" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {roleLabel}{user.role === "employee" && user.department ? ` - ${user.department}` : ""}
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-muted-foreground hover:text-primary" title="Sign out" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
