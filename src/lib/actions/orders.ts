"use server";

import { revalidatePath } from "next/cache";
import type { TablesUpdate } from "@/types/database";
import { hasSupervisorPermissions } from "@/lib/auth/roles";
import { authorize, pick, run } from "./guard";

type OrderPatch = TablesUpdate<"orders">;

/** What employees may change on an order (supervisors may change anything except id/lote/number). */
const EMPLOYEE_EDITABLE = ["status", "payment", "delivery", "priority", "notes", "surgery_date",
  "expected_completion_date", "expected_completion_confirmed", "end_date", "paid_at", "delivered_at",
  "billing_name", "billing_vat", "billing_address", "shipping_name", "shipping_address",
  "patient_name", "porosity", "breaking_line", "material", "jaw", "restoration_area"] as const;

/** What a doctor / distributor may change on their own order. */
const CLIENT_EDITABLE = ["request_cancel", "notes", "surgery_date", "shipping_name", "shipping_address",
  "billing_name", "billing_vat", "billing_address"] as const;

export async function updateOrder(orderId: string, patch: OrderPatch) {
  return run(async () => {
    const { profile, admin } = await authorize();

    let safe: OrderPatch;
    if (profile.role === "supervisor") {
      const { id: _i, lote: _l, number: _n, legacy_id: _g, ...rest } = patch;
      safe = rest;
    } else if (profile.role === "employee") {
      safe = pick(patch, EMPLOYEE_EDITABLE);
    } else {
      const { data: order, error } = await admin
        .from("orders").select("doctor_id, distributor_id").eq("id", orderId).single();
      if (error) throw error;
      const owns = order.doctor_id === profile.id || order.distributor_id === profile.id;
      if (!owns) throw new Error("This is not your order");
      safe = pick(patch, CLIENT_EDITABLE);
    }
    if (Object.keys(safe).length === 0) throw new Error("Nothing you are allowed to change");

    const { error } = await admin.from("orders").update(safe).eq("id", orderId);
    if (error) throw error;
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
  });
}

/** Cancel an order: supervisors and supervisor-like departments only. */
export async function cancelOrder(orderId: string) {
  return run(async () => {
    const { profile, admin } = await authorize({ check: hasSupervisorPermissions });
    const { error } = await admin
      .from("orders")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancelled_by_id: profile.id })
      .eq("id", orderId);
    if (error) throw error;
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
  });
}
