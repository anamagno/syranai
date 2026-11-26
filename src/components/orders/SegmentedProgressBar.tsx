"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { BadgeCheck, FolderOpen } from "lucide-react";
import type { OrderListTask } from "@/lib/queries/orders";
import { PHASE_ORDER } from "@/lib/orders/status";

const duration = (t: OrderListTask) => (t.duration_hours > 0 ? t.duration_hours : 1);

function segmentColor(t: OrderListTask, cancelled: boolean) {
  if (cancelled && t.status === "completed") return "#DC2626";
  if (t.status === "completed") return "#79A8D0";
  if (cancelled && (t.status === "in_progress" || t.status === "paused")) return "#FECACA";
  if (t.status === "in_progress" || t.status === "paused") return "#C7DBEB";
  if (t.status === "pending") return "#FFFFCC";
  return "#e5e7eb";
}

/** Progress bar split by phase, each task sized by its duration (old Orders.jsx). */
export function SegmentedProgressBar({ tasks, cancelled }: { tasks: OrderListTask[]; cancelled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [tip, setTip] = useState<{ task: OrderListTask; left: number; width: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) if (e.contentRect.width > 0) setWidth(e.contentRect.width);
    });
    ro.observe(el);
    const w = el.getBoundingClientRect().width;
    if (w > 0) setWidth(w);
    return () => ro.disconnect();
  }, []);

  if (!tasks.length) return null;
  const phases = PHASE_ORDER.filter((p) => tasks.some((t) => t.phase === p));
  const byPhase = phases.map((p) =>
    tasks.filter((t) => t.phase === p).sort((a, b) => a.sequence_order - b.sequence_order),
  );

  const segments: { task: OrderListTask; left: number; width: number }[] = [];
  byPhase.forEach((phaseTasks, i) => {
    const total = phaseTasks.reduce((s, t) => s + duration(t), 0);
    const phaseLeft = (i / phases.length) * width;
    const phaseWidth = width / phases.length;
    let acc = 0;
    for (const t of phaseTasks) {
      segments.push({ task: t, left: phaseLeft + (acc / total) * phaseWidth, width: (duration(t) / total) * phaseWidth });
      acc += duration(t);
    }
  });

  return (
    <div ref={ref} className="relative w-full h-2 bg-gray-200 rounded overflow-visible" style={{ isolation: "isolate" }}>
      {width > 0 && segments.map((s, i) => (
        <div
          key={s.task.id}
          className="absolute top-0 h-full cursor-pointer transition-opacity hover:opacity-80"
          style={{
            left: s.left, width: s.width, backgroundColor: segmentColor(s.task, cancelled),
            borderRadius: i === 0 ? "4px 0 0 4px" : i === segments.length - 1 ? "0 4px 4px 0" : 0,
          }}
          onMouseEnter={() => setTip(s)}
          onMouseLeave={() => setTip(null)}
        />
      ))}

      {width > 0 && byPhase.map((phaseTasks, i) => {
        const total = phaseTasks.reduce((s, t) => s + duration(t), 0);
        const phaseLeft = Math.round((i / phases.length) * width);
        const phaseWidth = Math.round(width / phases.length);
        let acc = 0;
        return (
          <Fragment key={phases[i]}>
            {i !== 0 && <div className="absolute top-0 h-full w-[2px] bg-gray-500 pointer-events-none" style={{ left: phaseLeft, zIndex: 2 }} />}
            {phaseTasks.map((t, idx) => {
              if (idx === 0) return null;
              acc += duration(phaseTasks[idx - 1]);
              return (
                <div key={t.id} className="absolute top-0 h-full w-[1px] bg-gray-400 opacity-50 pointer-events-none"
                  style={{ left: Math.round(phaseLeft + (acc / total) * phaseWidth), zIndex: 2 }} />
              );
            })}
          </Fragment>
        );
      })}

      {tip && (
        <div className="absolute z-50 pointer-events-none"
          style={{ bottom: "calc(100% + 10px)", left: tip.left + tip.width / 2, transform: "translateX(-50%)" }}>
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 min-w-[180px]">
            <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45" style={{ bottom: -7 }} />
            <p className="font-semibold text-center text-sm text-gray-900 mb-2 leading-tight">{tip.task.title_pt || tip.task.title_en || "Task"}</p>
            <div className="flex flex-col gap-1 text-center text-xs text-gray-500">
              <div className="flex items-center gap-2"><BadgeCheck className="w-3 h-3" /><span className="capitalize">{tip.task.status.replace("_", " ")}</span></div>
              {tip.task.department && <div className="flex items-center gap-2"><FolderOpen className="w-3 h-3" /><span>{tip.task.department}</span></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
