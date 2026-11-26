import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FadeIn } from "./FadeIn";

/** Row of number tiles (old dashboards' stat cards). Zero shows grey, anything else in the brand colour. */
export function StatTiles({
  stats, columns, href, small = false,
}: {
  stats: { label: string; value: number }[];
  columns: string;
  href?: string;
  small?: boolean;
}) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {stats.map((s, i) => {
        const tile = (
          <Card className={`${small ? "p-4" : "p-5"} text-center ${href ? "cursor-pointer hover:text-primary hover:shadow-md transition-all" : ""}`}>
            <p className={small ? "text-xs text-muted-foreground uppercase tracking-wide" : "text-sm text-muted-foreground"}>{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.value === 0 ? "text-slate-500" : "text-primary"}`}>{s.value}</p>
          </Card>
        );
        return (
          <FadeIn key={s.label} delay={i * 0.08}>
            {href ? <Link href={href} className="block">{tile}</Link> : tile}
          </FadeIn>
        );
      })}
    </div>
  );
}
