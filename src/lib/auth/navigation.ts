import type { Profile } from "./roles";
import { PRODUCTION_DEPARTMENTS } from "./roles";

/** Icon names map to lucide-react icons in components/layout/AppSidebar.tsx */
export type NavIcon =
  | "dashboard" | "clock" | "bag" | "package" | "factory" | "users" | "calendar"
  | "fingerprint" | "clipboard" | "user" | "settings" | "plus" | "list" | "truck";

export type NavItem = { label: string; href?: string; icon: NavIcon; children?: { label: string; href: string }[] };

const R = {
  supervisorDash: "/dashboard/supervisor",
  employeeDash: "/dashboard/employee",
  doctorDash: "/dashboard/doctor",
  distributorDash: "/dashboard/distributor",
  workPlan: "/work-plan",
  orders: "/orders",
  newOrder: "/orders/new",
  products: "/products",
  machines: "/machines",
  doctors: "/users/doctors",
  distributors: "/users/distributors",
  employees: "/users/employees",
  supervisors: "/users/supervisors",
  calendar: "/calendar",
  tailored: "/tailored-implant",
  terms: "/terms",
  account: "/account",
  settings: "/settings",
} as const;

const SUPERVISOR_NAV: NavItem[] = [
  { label: "Dashboard", href: R.supervisorDash, icon: "dashboard" },
  { label: "Work Plan", href: R.workPlan, icon: "clock" },
  { label: "Orders", href: R.orders, icon: "bag" },
  { label: "Products", href: R.products, icon: "package" },
  { label: "Machinery", href: R.machines, icon: "factory" },
  {
    label: "Users", icon: "users",
    children: [
      { label: "Doctors", href: R.doctors },
      { label: "Distributors", href: R.distributors },
      { label: "Employees", href: R.employees },
      { label: "Supervisors", href: R.supervisors },
    ],
  },
  { label: "Calendar", href: R.calendar, icon: "calendar" },
  { label: "Tailored Implant™", href: R.tailored, icon: "fingerprint" },
  { label: "Terms & Conditions", href: R.terms, icon: "clipboard" },
  { label: "Account", href: R.account, icon: "user" },
  { label: "System Settings", href: R.settings, icon: "settings" },
];

const EMPLOYEE_NAV: NavItem[] = [
  { label: "My Dashboard", href: R.employeeDash, icon: "dashboard" },
  { label: "Work Plan", href: R.workPlan, icon: "clock" },
  { label: "Orders", href: R.orders, icon: "clipboard" },
  { label: "Products", href: R.products, icon: "package" },
  { label: "Tailored Implant™", href: R.tailored, icon: "fingerprint" },
  { label: "Account", href: R.account, icon: "user" },
];

const QUALITY_NAV: NavItem[] = [
  { label: "My Dashboard", href: R.employeeDash, icon: "dashboard" },
  { label: "Work Plan", href: R.workPlan, icon: "clock" },
  { label: "Orders", href: R.orders, icon: "clipboard" },
  { label: "Products", href: R.products, icon: "package" },
  { label: "Machinery", href: R.machines, icon: "factory" },
  { label: "Tailored Implant™", href: R.tailored, icon: "fingerprint" },
  { label: "Terms & Conditions", href: R.terms, icon: "clipboard" },
  { label: "Account", href: R.account, icon: "user" },
];

const QUALITY_CONTROL_AND_PROD_NAV: NavItem[] = [
  { label: "My Dashboard", href: R.employeeDash, icon: "dashboard" },
  { label: "Work Plan", href: R.workPlan, icon: "clock" },
  { label: "Orders", href: R.orders, icon: "clipboard" },
  { label: "Products", href: R.products, icon: "package" },
  { label: "Machinery", href: R.machines, icon: "factory" },
  { label: "Tailored Implant™", href: R.tailored, icon: "fingerprint" },
  { label: "Account", href: R.account, icon: "user" },
];

const SALES_CLIENT_SUPPORT_NAV: NavItem[] = [
  { label: "My Dashboard", href: R.employeeDash, icon: "dashboard" },
  { label: "Work Plan", href: R.workPlan, icon: "clock" },
  { label: "Orders", href: R.orders, icon: "clipboard" },
  { label: "Products", href: R.products, icon: "package" },
  {
    label: "Users", icon: "users",
    children: [
      { label: "Doctors", href: R.doctors },
      { label: "Distributors", href: R.distributors },
    ],
  },
  { label: "Tailored Implant™", href: R.tailored, icon: "fingerprint" },
  { label: "Terms & Conditions", href: R.terms, icon: "clipboard" },
  { label: "Account", href: R.account, icon: "user" },
];

const DOCTOR_NAV: NavItem[] = [
  { label: "Dashboard", href: R.doctorDash, icon: "dashboard" },
  { label: "New Order", href: R.newOrder, icon: "plus" },
  { label: "My Orders", href: R.orders, icon: "list" },
  { label: "Products", href: R.products, icon: "package" },
  { label: "Tailored Implant™", href: R.tailored, icon: "fingerprint" },
  { label: "Terms & Conditions", href: R.terms, icon: "clipboard" },
  { label: "Account", href: R.account, icon: "user" },
];

const DISTRIBUTOR_NAV: NavItem[] = [
  { label: "Dashboard", href: R.distributorDash, icon: "dashboard" },
  { label: "New Order", href: R.newOrder, icon: "plus" },
  { label: "My Orders", href: R.orders, icon: "truck" },
  { label: "My Doctors", href: R.doctors, icon: "users" },
  { label: "Products", href: R.products, icon: "package" },
  { label: "Tailored Implant™", href: R.tailored, icon: "fingerprint" },
  { label: "Account", href: R.account, icon: "user" },
];

/** Same rules as NavByRole in the old Layout.jsx */
export function navFor(p: Pick<Profile, "role" | "department">): NavItem[] {
  const d = p.department ?? "";
  if (p.role === "supervisor") return SUPERVISOR_NAV;
  if (p.role === "employee" && d === "Sales and Client Support") return SALES_CLIENT_SUPPORT_NAV;
  if (p.role === "employee" && d === "Quality") return QUALITY_NAV;
  if (p.role === "employee" && PRODUCTION_DEPARTMENTS.includes(d)) return QUALITY_CONTROL_AND_PROD_NAV;
  if (p.role === "employee") return EMPLOYEE_NAV;
  if (p.role === "doctor") return DOCTOR_NAV;
  return DISTRIBUTOR_NAV;
}

export const ROUTES = R;
