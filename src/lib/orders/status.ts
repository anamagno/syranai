import type { Enums } from "@/types/database";

type TaskLike = { phase: Enums<"order_phase"> | null; status: Enums<"task_status"> };

/** UI phase keys used by the orders tabs and badges (old app naming). */
export const PHASE_KEYS = ["ordering", "designing", "in_production", "delivering", "closing"] as const;
export type PhaseKey = (typeof PHASE_KEYS)[number];

export const PHASE_ORDER: Enums<"order_phase">[] = ["ordering", "designing", "production", "delivery", "closing"];

export function phaseKey(phase: Enums<"order_phase"> | null): PhaseKey | null {
  if (phase === "production") return "in_production";
  if (phase === "delivery") return "delivering";
  return phase;
}

/** Phases that currently have a pending or in-progress task. */
export function activePhases(tasks: TaskLike[]): PhaseKey[] {
  return PHASE_KEYS.filter((k) =>
    tasks.some((t) => phaseKey(t.phase) === k && (t.status === "in_progress" || t.status === "pending")),
  );
}

export function progress(tasks: TaskLike[]) {
  if (!tasks.length) return { pct: 0, done: 0, total: 0 };
  const done = tasks.filter((t) => t.status === "completed").length;
  return { pct: Math.round((done / tasks.length) * 100), done, total: tasks.length };
}

/** Cancelled orders are "fully closed" once all their closing tasks are done (or they have none). */
export function isFullyClosed(order: { status: Enums<"order_status"> }, tasks: TaskLike[]) {
  if (order.status !== "cancelled") return false;
  const closing = tasks.filter((t) => t.phase === "closing");
  return closing.length === 0 || closing.every((t) => t.status === "completed");
}
