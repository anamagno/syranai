/** "3 hours ago", "in 2 days" (replaces date-fns formatDistanceToNow). */
export function timeAgo(ts: string | null | undefined, now = Date.now()): string {
  if (!ts) return "";
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return "";
  const diff = (t - now) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"], [3600, "minute"], [86400, "hour"], [86400 * 30, "day"], [86400 * 365, "month"],
  ];
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  for (let i = 1; i < steps.length; i++) {
    if (abs < steps[i][0]) return rtf.format(Math.round(diff / steps[i - 1][0]), steps[i][1]);
  }
  return rtf.format(Math.round(diff / (86400 * 365)), "year");
}

/** "1 order" / "3 orders" */
export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
