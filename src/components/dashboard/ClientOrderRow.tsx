"use client";

import Link from "next/link";
import { BookOpen, HeartPulse, MapPin, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export type DoctorOrderView = {
  id: string;
  title: string;
  details: string;
  progress: number;
  badge: { label: string; className: string };
  protocolUrl: string | null;
  ifuUrl: string | null;
};

/** Doctor "Ongoing Orders" row: status badge, surgical protocol / IFU buttons, progress bar. */
export function DoctorOrderRow({ o }: { o: DoctorOrderView }) {
  const open = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank");
  };
  return (
    <Link href={`/orders/${o.id}`} className="block">
      <div className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="font-medium text-sm">{o.title}</span>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {(o.protocolUrl || o.ifuUrl) && (
              <div className="flex items-center gap-1 px-2 h-7 rounded-md border border-border bg-muted/40">
                {o.protocolUrl && (
                  <button className="p-1 rounded text-muted-foreground hover:text-primary" title="Open Surgical Protocol" onClick={(e) => open(e, o.protocolUrl!)}>
                    <HeartPulse className="w-3 h-3" />
                  </button>
                )}
                {o.protocolUrl && o.ifuUrl && <div className="w-px h-2.5 bg-border" />}
                {o.ifuUrl && (
                  <button className="p-1 rounded text-muted-foreground hover:text-primary" title="IFU document" onClick={(e) => open(e, o.ifuUrl!)}>
                    <BookOpen className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-medium border ${o.badge.className}`}>{o.badge.label}</Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{o.details}</p>
        <Progress value={o.progress} className="h-1.5" />
        <p className="text-xs text-muted-foreground text-right mt-1">{o.progress}% complete</p>
      </div>
    </Link>
  );
}

/** Distributor "Assigned Orders" row. The status badge is rendered on the server and passed in. */
export function DistributorOrderRow({
  id, lote, patientName, shippingAddress, progress, badge,
}: { id: string; lote: string; patientName: string | null; shippingAddress: string | null; progress: number; badge: React.ReactNode }) {
  return (
    <Link href={`/orders/${id}`} className="block">
      <div className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="font-medium text-sm">{lote}</span>
          {badge}
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {patientName && <span><Package className="w-3 h-3 inline mr-1" />{patientName}</span>}
          {shippingAddress && <span> · <MapPin className="w-3 h-3 inline mr-1" />{shippingAddress.substring(0, 30)}...</span>}
        </p>
        <Progress value={progress} className="h-1.5" />
      </div>
    </Link>
  );
}
