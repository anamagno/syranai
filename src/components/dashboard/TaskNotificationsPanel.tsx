"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { completeNotification, markNotificationsRead } from "@/lib/actions/notifications";
import { timeAgo } from "@/lib/format";

type Me = { id: string; role: string; department: string | null };

/** Who also gets order notifications (not only task notifications), as in the old app. */
const ORDER_NOTIF_DEPARTMENTS = ["Sales and Client Support", "Logistics"];

async function fetchNotifications(userId: string) {
  const db = createClient();
  const { data, error } = await db
    .from("notifications")
    .select("id, subject, sent_at, is_read, event, order_id, task_id, task:order_tasks ( id, order_id, status ), order:orders ( id, status )")
    .eq("to_user_id", userId)
    .eq("is_deleted", false)
    .order("sent_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}
type Notif = Awaited<ReturnType<typeof fetchNotifications>>[number];

/** Floating notification cards in the top-right corner (old components/dashboard/TaskNotificationsPanel.jsx). */
export function TaskNotificationsPanel({ me }: { me: Me }) {
  const queryClient = useQueryClient();
  const key = ["notifications", me.id];
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data = [] } = useQuery({ queryKey: key, queryFn: () => fetchNotifications(me.id), refetchInterval: 30_000 });

  const showOrderNotifs = me.role === "supervisor" || ORDER_NOTIF_DEPARTMENTS.includes(me.department ?? "");

  const visible = data.filter((n) => {
    if (dismissed.has(n.id)) return false;
    if (n.task_id) return !!n.task && n.task.status !== "completed";
    if (!showOrderNotifs || !n.order) return false;
    if (n.order.status === "finished") return false;
    if (n.event === "termsAwaiting" && n.order.status !== "awaiting_terms") return false;
    return true;
  });
  if (!visible.length) return null;

  const setRead = (ids: string[]) =>
    queryClient.setQueryData<Notif[]>(key, (old = []) => old.map((x) => (ids.includes(x.id) ? { ...x, is_read: true } : x)));

  const markRead = (n: Notif) => {
    setRead([n.id]);
    void markNotificationsRead([n.id]);
  };
  const dismiss = (n: Notif) => {
    setDismissed((s) => new Set(s).add(n.id));
    markRead(n);
  };
  const complete = (n: Notif) => {
    setDismissed((s) => new Set(s).add(n.id));
    queryClient.setQueryData<Notif[]>(key, (old = []) => old.filter((x) => x.id !== n.id));
    void completeNotification(n.id);
  };
  const dismissAll = () => {
    const ids = visible.map((n) => n.id);
    setDismissed((s) => new Set([...s, ...ids]));
    setRead(ids);
    void markNotificationsRead(ids);
  };

  const hrefOf = (n: Notif) =>
    n.task ? `/orders/${n.task.order_id}?task=${n.task.id}` : n.order ? `/orders/${n.order.id}` : null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      <AnimatePresence>
        <motion.div key="header" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }} className="pointer-events-auto">
          <div className="rounded-xl border shadow-lg overflow-hidden bg-primary/10 border-primary/40">
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-primary/20">
              <Bell className="w-3 h-3 flex-shrink-0 text-primary" />
              <span className="text-[11px] font-semibold text-primary">You have {visible.length} notifications</span>
              <button onClick={dismissAll} title="Mark all as read"
                className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                Dismiss all <CheckCheck className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {visible.map((n) => {
          const isNew = !n.is_read;
          const href = hrefOf(n);
          return (
            <motion.div key={n.id} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }} transition={{ duration: 0.25 }} className="pointer-events-auto">
              <div className={`rounded-xl border shadow-lg overflow-hidden ${isNew ? "bg-primary/10 border-primary/40" : "bg-white border-border"}`}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 border-b ${isNew ? "border-primary/20" : "bg-muted/40 border-border"}`}>
                  <Bell className={`w-3 h-3 flex-shrink-0 ${isNew ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-[11px] font-semibold ${isNew ? "text-primary" : "text-muted-foreground"}`}>
                    {isNew ? "New notification" : "Pending confirmation"}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{timeAgo(n.sent_at)}</span>
                </div>
                {href ? (
                  <Link href={href} onClick={() => markRead(n)} className="block px-3 py-2">
                    <p className="text-xs text-foreground hover:text-primary leading-snug">{n.subject}</p>
                  </Link>
                ) : (
                  <p className="px-3 py-2 text-xs text-foreground leading-snug">{n.subject}</p>
                )}
                <div className="flex items-center justify-end gap-1 px-3 pb-2">
                  <button onClick={() => dismiss(n)} title="Dismiss"
                    className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => complete(n)} title="Mark as done"
                    className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
