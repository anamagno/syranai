"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, ChevronRight, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MessageGroup } from "@/lib/queries/dashboard";
import { plural } from "@/lib/format";

type Variant = "supervisor" | "employee" | "client";

/** One row per order; "<" and ">" flip through that order's messages without leaving the page. */
function MessageGroupRow({ group, variant }: { group: MessageGroup; variant: Variant }) {
  const [index, setIndex] = useState(0);
  const current = group.messages[index];
  const highlight = variant === "employee" && current?.toMe;
  const many = group.messages.length > 1;

  const step = (e: React.MouseEvent, d: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => i + d);
  };

  const rowClass =
    variant === "supervisor"
      ? "flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 border border-transparent hover:border-[#3b82f6] transition-colors"
      : `flex gap-3 items-start p-3 rounded-lg transition-colors ${
          highlight
            ? "border-t border-r border-b border-border border-l-[3px] border-l-primary hover:bg-primary/5"
            : "border border-border hover:bg-muted/30"
        }`;

  const badge =
    variant === "supervisor" ? (
      <div className={`w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 ${group.unread > 0 ? "bg-blue-500" : "bg-muted-foreground/30"}`}>
        {group.unread > 0 ? `+${group.unread}` : <Check className="w-4 h-4" />}
      </div>
    ) : (
      <div className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center flex-shrink-0 ${group.unread > 0 ? "bg-primary/70 text-white" : "text-primary/70"}`}>
        {group.unread > 0 ? `+${group.unread}` : <CheckCircle2 className="w-6 h-6" />}
      </div>
    );

  const arrows = variant !== "supervisor" || many;
  const href = variant === "supervisor" ? `/orders/${group.orderId}` : `/orders/${group.orderId}#messages`;

  return (
    <Link href={href} className="block">
      <div className={rowClass}>
        {badge}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1">
            {arrows && (
              <button className="text-foreground hover:text-primary disabled:opacity-30 text-sm" disabled={index === 0} onClick={(e) => step(e, -1)}>
                {"<"}
              </button>
            )}
            <p className="text-sm font-medium text-foreground truncate px-2">{current?.subject}</p>
            {highlight && <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">@ You</span>}
            {arrows && (
              <button className="text-foreground hover:text-primary disabled:opacity-30 text-sm" disabled={index === group.messages.length - 1} onClick={(e) => step(e, 1)}>
                {">"}
              </button>
            )}
          </div>
          <p className={`text-xs truncate ${variant === "supervisor" ? "text-muted-foreground" : "text-primary"}`}>
            Order: {group.lote}
            {group.productName ? ` · ${group.productName}` : ""}
            {group.patientName ? ` · ${group.patientName}` : ""}
          </p>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 text-muted-foreground flex-shrink-0">
          {index + 1}/{group.messages.length}
        </span>
      </div>
    </Link>
  );
}

export function MessagesCard({
  title, subtitle, groups, unread, unreadToMe, variant,
}: {
  title: string;
  subtitle?: string;
  groups: MessageGroup[];
  unread: number;
  unreadToMe?: number;
  variant: Variant;
}) {
  const color = variant === "supervisor" ? "text-[#3b82f6]" : "text-primary";
  return (
    <Card className={`h-full ${variant === "supervisor" ? "hover:border-[#3b82f6] transition-colors" : ""}`}>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className={`w-5 h-5 ${color}`} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages.</p>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => <MessageGroupRow key={g.orderId} group={g} variant={variant} />)}
          </div>
        )}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className={`text-xs font-medium ${color}`}>
            {plural(unread, "unread message")}
            {unreadToMe !== undefined && ` · ${plural(unreadToMe, "unread message")} sent to you`}
          </span>
          <ChevronRight size={14} className="text-[#3b82f6]" />
        </div>
      </CardContent>
    </Card>
  );
}
