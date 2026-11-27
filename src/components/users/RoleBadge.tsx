import { Briefcase, Shield, Stethoscope, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ROLE_CONFIG = {
  supervisor: { label: "Supervisor", icon: Shield, className: "bg-primary/10 text-primary border-primary/20" },
  employee: { label: "Employee", icon: Briefcase, className: "bg-accent text-accent-foreground border-accent" },
  doctor: { label: "Doctor", icon: Stethoscope, className: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  distributor: { label: "Distributor", icon: Truck, className: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
} as const;

/** Role pill with icon (old components/users/RoleBadge.jsx). */
export function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.employee;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.className} border font-medium gap-1.5 px-2.5 py-1`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}
