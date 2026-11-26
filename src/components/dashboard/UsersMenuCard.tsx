"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RoleStat = { label: string; total: number; pendingInvites: number; sentInvites: number; pendingApproval: number };

/** Supervisor "Users" card: click opens a small menu to the 3 user lists. */
export function UsersMenuCard({ roleStats, totalUsers }: { roleStats: RoleStat[]; totalUsers: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div ref={ref} className="h-full">
      <Card className="h-full cursor-pointer hover:border-[#14b8a6] transition-colors group relative" onClick={() => setOpen((v) => !v)}>
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#14b8a6]" /> Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground mt-2 mb-3 transition-colors group-hover:text-[#14b8a6]">View, edit and message users</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            {roleStats
              .filter((r) => r.total || r.pendingInvites || r.sentInvites || r.pendingApproval)
              .map((r) => (
                <p key={r.label}>
                  {r.total} {r.label}
                  {r.pendingInvites > 0 && ` · ${r.pendingInvites} pending invites`}
                  {r.sentInvites > 0 && ` · ${r.sentInvites} waiting response`}
                  {r.pendingApproval > 0 && ` · ${r.pendingApproval} waiting approval`}
                </p>
              ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs font-medium text-[#14b8a6]">{totalUsers} users</span>
            <ChevronRight size={14} className="text-[#14b8a6]" />
          </div>
          {open && (
            <div className="absolute right-4 top-16 z-50 w-48 rounded-xl border bg-white shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {[
                ["View Employees", "/users/employees"],
                ["View Distributors", "/users/distributors"],
                ["View Doctors", "/users/doctors"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="block w-full text-left px-4 py-2 text-sm hover:bg-background hover:text-[#14b8a6]">
                  {label}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
