"use server";

import { authorize, run } from "./guard";

/**
 * Notifications popups (old TaskMessage/Message with type "notification").
 * A user can only touch their own notifications: every update is filtered by to_user_id = me.
 */

/** X button / "Dismiss all" / clicking the link: mark as read. */
export async function markNotificationsRead(ids: string[]) {
  return run(async () => {
    if (!ids.length) return;
    const { profile, admin } = await authorize();
    const { error } = await admin
      .from("notifications").update({ is_read: true })
      .in("id", ids).eq("to_user_id", profile.id);
    if (error) throw error;
  });
}

/** ✓ button: done, never show again (old: is_active = false). */
export async function completeNotification(id: string) {
  return run(async () => {
    const { profile, admin } = await authorize();
    const { error } = await admin
      .from("notifications").update({ is_read: true, is_deleted: true })
      .eq("id", id).eq("to_user_id", profile.id);
    if (error) throw error;
  });
}
